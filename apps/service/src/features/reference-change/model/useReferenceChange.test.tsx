import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
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

// 지도 홈(/map)에서 시트를 연 상태로, 훅의 결과와 함께 지금 경로를 확인할 수 있게 렌더한다
function renderReferenceChange() {
  return renderHook(
    () => ({
      sheet: useReferenceChange({ onClose: onCloseMock }),
      pathname: useLocation().pathname,
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MemoryRouter initialEntries={['/map']}>{children}</MemoryRouter>
      ),
    },
  );
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
  describe('시트를 열었을 때', () => {
    it('동네 기준이면 그 동네를 선택된 상태로 알려줍니다', () => {
      const { result } = renderReferenceChange();

      expect(result.current.sheet.selectedNeighborhoodId).toBe(SEONGSU_ID);
      expect(result.current.sheet.isCurrentLocationSelected).toBe(false);
    });

    it('현재 위치 기준이면 현재 위치를 선택된 상태로 알려줍니다', () => {
      useReferencePointStore.getState().selectCurrentLocation(COORDINATES);

      const { result } = renderReferenceChange();

      expect(result.current.sheet.isCurrentLocationSelected).toBe(true);
      expect(result.current.sheet.selectedNeighborhoodId).toBeNull();
    });
  });

  describe('동네를 눌렀을 때', () => {
    it('그 동네로 기준을 바꾸고 시트를 닫습니다', () => {
      const { result } = renderReferenceChange();

      act(() => result.current.sheet.chooseNeighborhood(GANGNAM_ID));

      expect(getSavedReferencePoint()).toEqual({
        type: 'neighborhood',
        neighborhoodId: GANGNAM_ID,
      });
      expect(onCloseMock).toHaveBeenCalledOnce();
    });

    it('지금 기준과 같은 동네면 기준을 바꾸지 않고 시트만 닫습니다', () => {
      const referencePointBefore = getSavedReferencePoint();
      const { result } = renderReferenceChange();

      act(() => result.current.sheet.chooseNeighborhood(SEONGSU_ID));

      expect(getSavedReferencePoint()).toBe(referencePointBefore);
      expect(onCloseMock).toHaveBeenCalledOnce();
    });

    it('기준을 바꿔도 고른 반경은 그대로 둡니다', () => {
      useReferencePointStore.getState().setRadius(1000);
      const { result } = renderReferenceChange();

      act(() => result.current.sheet.chooseNeighborhood(GANGNAM_ID));

      expect(useReferencePointStore.getState().radius).toBe(1000);
    });
  });

  describe('현재 위치를 눌렀을 때', () => {
    it('위치를 받으면 현재 위치로 기준을 바꾸고 시트를 닫습니다', async () => {
      succeedWithPosition();
      const { result } = renderReferenceChange();

      await act(() => result.current.sheet.chooseCurrentLocation());

      expect(getSavedReferencePoint()).toEqual({
        type: 'currentLocation',
        coordinates: COORDINATES,
      });
      expect(onCloseMock).toHaveBeenCalledOnce();
      expect(result.current.pathname).toBe('/map');
    });

    it('이미 현재 위치 기준이어도 위치를 다시 받아 좌표를 갱신합니다', async () => {
      useReferencePointStore
        .getState()
        .selectCurrentLocation({ lat: 37.5, lng: 127.0 });
      succeedWithPosition();
      const { result } = renderReferenceChange();

      await act(() => result.current.sheet.chooseCurrentLocation());

      expect(getSavedReferencePoint()).toEqual({
        type: 'currentLocation',
        coordinates: COORDINATES,
      });
    });

    // 거부·시간 초과·미지원·오류는 위치 권한 훅이 구분하고, 이 훅은 성공이 아니면 모두 같이 처리하므로 거부를 대표로 확인한다
    it('위치를 받지 못하면 기준을 바꾸지 않고 동네 고르기로 이동합니다', async () => {
      failWithDenied();
      const { result } = renderReferenceChange();

      await act(() => result.current.sheet.chooseCurrentLocation());

      expect(getSavedReferencePoint()).toEqual({
        type: 'neighborhood',
        neighborhoodId: SEONGSU_ID,
      });
      expect(result.current.pathname).toBe('/neighborhood');
    });

    // 위치 요청 자체를 한 번만 보내는 것은 위치 권한 훅이 보장하므로, 이 훅이 더하는 기준 변경과 시트 닫기가 겹치지 않는지 본다
    it('위치를 받는 동안 다시 눌러도 기준을 바꾸고 시트를 닫는 일은 한 번만 합니다', async () => {
      const releasePosition = holdPositionUntilReleased();
      const { result } = renderReferenceChange();

      let firstChoice: Promise<void> = Promise.resolve();
      let secondChoice: Promise<void> = Promise.resolve();
      act(() => {
        firstChoice = result.current.sheet.chooseCurrentLocation();
      });
      act(() => {
        secondChoice = result.current.sheet.chooseCurrentLocation();
      });
      expect(result.current.sheet.isLocating).toBe(true);

      await act(async () => {
        releasePosition();
        await Promise.all([firstChoice, secondChoice]);
      });

      expect(onCloseMock).toHaveBeenCalledOnce();
      expect(result.current.sheet.isLocating).toBe(false);
    });

    it('위치를 받기 전에 시트가 사라지면 위치를 받아도 기준을 바꾸지 않습니다', async () => {
      const releasePosition = holdPositionUntilReleased();
      const { result, unmount } = renderReferenceChange();

      let choice: Promise<void> = Promise.resolve();
      act(() => {
        choice = result.current.sheet.chooseCurrentLocation();
      });
      unmount();
      await act(async () => {
        releasePosition();
        await choice;
      });

      expect(getSavedReferencePoint()).toEqual({
        type: 'neighborhood',
        neighborhoodId: SEONGSU_ID,
      });
      expect(onCloseMock).not.toHaveBeenCalled();
    });
  });
});
