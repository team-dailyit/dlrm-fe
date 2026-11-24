import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useReferencePointStore } from '@/entities/reference-point';

import { useNeighborhoodNoticeStore } from './neighborhoodNoticeStore';
import { useNeighborhoodNotice } from './useNeighborhoodNotice';

const SEONGSU_ID = 1_000_000_000_001;
const GANGNAM_ID = 1_000_000_000_002;
const COORDINATES = { lat: 37.5445, lng: 127.0559 };

const POSITION_ERROR_PERMISSION_DENIED = 1;

// jsdom에는 Geolocation API가 없고, 실제 위치 요청을 보내지 않도록 getCurrentPosition을 stub으로 대신한다
const getCurrentPositionStub = vi.fn<Geolocation['getCurrentPosition']>();

// 위치를 받지 못했을 때 화면에 알리는 함수(기준 변경 시트 열기)가 불렸는지 확인한다
const onLocationFailedMock = vi.fn();

function defineNavigatorProperty(
  key: 'geolocation' | 'permissions',
  value: unknown,
) {
  Object.defineProperty(navigator, key, { value, configurable: true });
}

// jsdom에는 Permissions API가 없어, 브라우저가 알려 주는 위치 권한 상태를 직접 정한다
function setupPermission(state: PermissionState) {
  defineNavigatorProperty('permissions', {
    query: () => Promise.resolve(Object.assign(new EventTarget(), { state })),
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

// 위치 응답을 붙잡아 두었다가, 돌려받은 함수를 부르면 그때 성공 또는 거부로 응답한다
function holdPositionUntilReleased(outcome: 'success' | 'denied') {
  let releasePosition = () => {};
  getCurrentPositionStub.mockImplementation((success, error) => {
    releasePosition = () =>
      outcome === 'success'
        ? success({
            coords: { latitude: COORDINATES.lat, longitude: COORDINATES.lng },
          } as GeolocationPosition)
        : error?.({
            code: POSITION_ERROR_PERMISSION_DENIED,
          } as GeolocationPositionError);
  });

  return () => releasePosition();
}

function renderNeighborhoodNotice() {
  return renderHook(() =>
    useNeighborhoodNotice({ onLocationFailed: onLocationFailedMock }),
  );
}

function getSavedReferencePoint() {
  return useReferencePointStore.getState().referencePoint;
}

// 성수 기준으로 지도를 보던 상태에서 시작한다. 테스트끼리 기준점과 닫은 기록이 남지 않도록 비운다
beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  useReferencePointStore.getState().reset();
  useReferencePointStore.getState().selectNeighborhood(SEONGSU_ID);
  useNeighborhoodNoticeStore.setState({ isDismissed: false });
  defineNavigatorProperty('geolocation', {
    getCurrentPosition: getCurrentPositionStub,
  });
  setupPermission('prompt');
});

// 다음 테스트에 navigator stub과 stub·mock 동작이 남지 않도록 지운다
afterEach(() => {
  Reflect.deleteProperty(navigator, 'geolocation');
  Reflect.deleteProperty(navigator, 'permissions');
  getCurrentPositionStub.mockReset();
  onLocationFailedMock.mockReset();
});

describe('useNeighborhoodNotice', () => {
  describe('동네 기준일 때', () => {
    it('동네 기준 안내를 보여줍니다', () => {
      const { result } = renderNeighborhoodNotice();

      expect(result.current.isNoticeVisible).toBe(true);
    });

    it('위치 권한이 거부된 상태여도 안내를 보여주고, 거부 상태인지 함께 알려줍니다', async () => {
      setupPermission('denied');

      const { result } = renderNeighborhoodNotice();

      await waitFor(() => expect(result.current.isLocationDenied).toBe(true));
      expect(result.current.isNoticeVisible).toBe(true);
    });
  });

  describe('현재 위치 기준일 때', () => {
    it('동네 기준 안내를 보여주지 않습니다', () => {
      useReferencePointStore.getState().selectCurrentLocation(COORDINATES);

      const { result } = renderNeighborhoodNotice();

      expect(result.current.isNoticeVisible).toBe(false);
    });
  });

  describe('안내를 닫았을 때', () => {
    // 지도 홈을 벗어났다 돌아와 훅이 다시 그려져도 이번 방문 동안은 닫은 채로 둔다
    it('안내를 숨기고, 화면을 다시 그려도 숨긴 채로 둡니다', () => {
      const { result, unmount } = renderNeighborhoodNotice();

      act(() => result.current.dismissNotice());
      expect(result.current.isNoticeVisible).toBe(false);

      unmount();
      const { result: rerendered } = renderNeighborhoodNotice();

      expect(rerendered.current.isNoticeVisible).toBe(false);
    });
  });

  // 화면이 사라진 뒤의 처리는 useLocationResultHandler 테스트가 지킨다
  describe('내 위치로 보기를 눌렀을 때', () => {
    it('위치를 받으면 현재 위치로 기준을 바꾸고, 바꿨다고 알려줍니다', async () => {
      succeedWithPosition();
      const { result } = renderNeighborhoodNotice();

      await act(() => result.current.switchToCurrentLocation());

      expect(getSavedReferencePoint()).toEqual({
        type: 'currentLocation',
        coordinates: COORDINATES,
      });
      expect(result.current.hasSwitchedToCurrentLocation).toBe(true);
      expect(result.current.isNoticeVisible).toBe(false);
    });

    // 거부·시간 초과·미지원·오류는 위치 권한 훅이 구분하고, 이 훅은 성공이 아니면 모두 같이 처리하므로 거부를 대표로 확인한다
    it('위치를 받지 못하면 기준은 그대로 두고 기준 변경 시트를 열도록 알립니다', async () => {
      failWithDenied();
      const { result } = renderNeighborhoodNotice();

      await act(() => result.current.switchToCurrentLocation());

      expect(getSavedReferencePoint()).toEqual({
        type: 'neighborhood',
        neighborhoodId: SEONGSU_ID,
      });
      expect(onLocationFailedMock).toHaveBeenCalledOnce();
      expect(result.current.hasSwitchedToCurrentLocation).toBe(false);
    });

    // 이 훅이 누를 때마다 처리를 감싸므로, 공통 훅의 중복 방지가 그대로 이어지는지 본다
    it('위치를 받는 동안 다시 눌러도 위치 요청과 처리는 한 번만 합니다', async () => {
      const releasePosition = holdPositionUntilReleased('denied');
      const { result } = renderNeighborhoodNotice();

      let firstSwitch: Promise<void> = Promise.resolve();
      let secondSwitch: Promise<void> = Promise.resolve();
      act(() => {
        firstSwitch = result.current.switchToCurrentLocation();
        secondSwitch = result.current.switchToCurrentLocation();
      });
      await act(async () => {
        releasePosition();
        await Promise.all([firstSwitch, secondSwitch]);
      });

      expect(getCurrentPositionStub).toHaveBeenCalledOnce();
      expect(onLocationFailedMock).toHaveBeenCalledOnce();
    });

    // 지도 홈은 위치를 기다리는 동안에도 화면에 남아 있어, 화면이 사라졌는지로는 막을 수 없다
    it('위치를 기다리는 동안 사용자가 다른 동네를 고르면 그 선택을 덮어쓰지 않습니다', async () => {
      const releasePosition = holdPositionUntilReleased('success');
      const { result } = renderNeighborhoodNotice();

      let pendingSwitch: Promise<void> = Promise.resolve();
      act(() => {
        pendingSwitch = result.current.switchToCurrentLocation();
      });
      act(() =>
        useReferencePointStore.getState().selectNeighborhood(GANGNAM_ID),
      );
      await act(async () => {
        releasePosition();
        await pendingSwitch;
      });

      expect(getSavedReferencePoint()).toEqual({
        type: 'neighborhood',
        neighborhoodId: GANGNAM_ID,
      });
      expect(result.current.hasSwitchedToCurrentLocation).toBe(false);
    });
  });

  describe('내 위치로 바꾼 뒤 다시 동네 기준으로 돌아갔을 때', () => {
    it('내 위치로 바꿨다는 상태를 거둡니다', async () => {
      succeedWithPosition();
      const { result } = renderNeighborhoodNotice();
      await act(() => result.current.switchToCurrentLocation());

      act(() =>
        useReferencePointStore.getState().selectNeighborhood(GANGNAM_ID),
      );

      expect(result.current.hasSwitchedToCurrentLocation).toBe(false);
    });
  });
});
