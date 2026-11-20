import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useReferencePointStore } from '@/entities/reference-point';

import { useReferenceChange } from './useReferenceChange';

const SEONGSU_ID = 1_000_000_000_001;
const GANGNAM_ID = 1_000_000_000_002;
const COORDINATES = { lat: 37.5445, lng: 127.0559 };

const POSITION_ERROR_PERMISSION_DENIED = 1;

// jsdom에는 Geolocation API가 없고, 실제 위치 요청을 보내지 않도록 getCurrentPosition을 stub으로 대신한다
const getCurrentPositionStub = vi.fn<Geolocation['getCurrentPosition']>();

// 시트를 닫는 함수가 불렸는지 확인한다
const onCloseMock = vi.fn();

function setupGeolocation() {
  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition: getCurrentPositionStub },
    configurable: true,
  });
}

function succeedWithPosition() {
  getCurrentPositionStub.mockImplementation((success) => {
    success({
      coords: { latitude: COORDINATES.lat, longitude: COORDINATES.lng },
    } as GeolocationPosition);
  });
}

function failWithDenied() {
  getCurrentPositionStub.mockImplementation((_success, error) => {
    error?.({
      code: POSITION_ERROR_PERMISSION_DENIED,
    } as GeolocationPositionError);
  });
}

// 위치 응답을 붙잡아 두었다가, 돌려받은 함수를 부르면 그때 성공으로 응답한다
function holdPositionUntilReleased() {
  let releasePosition = () => {};
  getCurrentPositionStub.mockImplementation((success) => {
    releasePosition = () =>
      success({
        coords: { latitude: COORDINATES.lat, longitude: COORDINATES.lng },
      } as GeolocationPosition);
  });

  return () => releasePosition();
}

function renderReferenceChange() {
  return renderHook(() => useReferenceChange({ onClose: onCloseMock }));
}

function getSavedReferencePoint() {
  return useReferencePointStore.getState().referencePoint;
}

// 성수 기준으로 지도를 보던 상태에서 시작한다. 테스트끼리 기준점이 남지 않도록 저장소도 비운다
beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  useReferencePointStore.getState().reset();
  useReferencePointStore.getState().selectNeighborhood(SEONGSU_ID);
  setupGeolocation();
});

// 다음 테스트에 navigator stub과 stub·mock 동작이 남지 않도록 지운다
afterEach(() => {
  Reflect.deleteProperty(navigator, 'geolocation');
  getCurrentPositionStub.mockReset();
  onCloseMock.mockReset();
});

describe('useReferenceChange', () => {
  describe('동네를 눌렀을 때', () => {
    it('그 동네로 기준을 바꾸고 시트를 닫습니다', () => {
      const { result } = renderReferenceChange();

      act(() => result.current.selectNeighborhood(GANGNAM_ID));

      expect(getSavedReferencePoint()).toEqual({
        type: 'neighborhood',
        neighborhoodId: GANGNAM_ID,
      });
      expect(onCloseMock).toHaveBeenCalledOnce();
    });

    it('지금 기준과 같은 동네면 기준을 바꾸지 않고 시트만 닫습니다', () => {
      const referencePointBefore = getSavedReferencePoint();
      const { result } = renderReferenceChange();

      act(() => result.current.selectNeighborhood(SEONGSU_ID));

      expect(getSavedReferencePoint()).toBe(referencePointBefore);
      expect(onCloseMock).toHaveBeenCalledOnce();
    });
  });

  describe('현재 위치를 눌렀을 때', () => {
    it('위치를 받으면 현재 위치로 기준을 바꾸고 시트를 닫습니다', async () => {
      succeedWithPosition();
      const { result } = renderReferenceChange();

      await act(() => result.current.selectCurrentLocation());

      expect(getSavedReferencePoint()).toEqual({
        type: 'currentLocation',
        coordinates: COORDINATES,
      });
      expect(onCloseMock).toHaveBeenCalledOnce();
    });

    it('이미 현재 위치 기준이어도 위치를 다시 받아 좌표를 갱신합니다', async () => {
      useReferencePointStore
        .getState()
        .selectCurrentLocation({ lat: 37.5, lng: 127.0 });
      succeedWithPosition();
      const { result } = renderReferenceChange();

      await act(() => result.current.selectCurrentLocation());

      expect(getSavedReferencePoint()).toEqual({
        type: 'currentLocation',
        coordinates: COORDINATES,
      });
    });

    // 거부·시간 초과·미지원·오류는 위치 권한 훅이 구분하고, 이 훅은 성공이 아니면 모두 같이 처리하므로 거부를 대표로 확인한다
    it('위치를 받지 못하면 기준을 바꾸지 않고 시트를 연 채로 실패를 알립니다', async () => {
      failWithDenied();
      const { result } = renderReferenceChange();

      await act(() => result.current.selectCurrentLocation());

      expect(getSavedReferencePoint()).toEqual({
        type: 'neighborhood',
        neighborhoodId: SEONGSU_ID,
      });
      expect(result.current.isLocationFailed).toBe(true);
      expect(onCloseMock).not.toHaveBeenCalled();
    });
  });

  describe('위치 실패 안내가 떠 있을 때', () => {
    // 위치를 거부해 실패 안내가 뜬 시트에서 시작한다
    beforeEach(() => {
      failWithDenied();
    });

    it('위치 허용을 다시 시도하면 실패 안내를 지웁니다', async () => {
      const { result } = renderReferenceChange();
      await act(() => result.current.selectCurrentLocation());

      holdPositionUntilReleased();
      act(() => {
        void result.current.selectCurrentLocation();
      });

      expect(result.current.isLocationFailed).toBe(false);
    });

    it('동네 고르기를 누르면 실패 안내를 닫고 시트는 연 채로 둡니다', async () => {
      const { result } = renderReferenceChange();
      await act(() => result.current.selectCurrentLocation());

      act(() => result.current.dismissLocationFailure());

      expect(result.current.isLocationFailed).toBe(false);
      expect(onCloseMock).not.toHaveBeenCalled();
    });
  });
});
