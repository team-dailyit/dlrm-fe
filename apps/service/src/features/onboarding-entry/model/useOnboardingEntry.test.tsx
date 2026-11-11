import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation, useNavigationType } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useReferencePointStore } from '@/entities/reference-point';

import { useOnboardingEntry } from './useOnboardingEntry';

const NEIGHBORHOOD_ID = 1_000_000_000_001;
const COORDINATES = { lat: 37.5445, lng: 127.0559 };

// GeolocationPositionError.code 값
const POSITION_ERROR_PERMISSION_DENIED = 1;
const POSITION_ERROR_TIMEOUT = 3;

// jsdom에는 Geolocation API가 없고, 실제 위치 요청을 보내지 않도록 getCurrentPosition을 mock으로 대신한다
const getCurrentPositionMock = vi.fn<Geolocation['getCurrentPosition']>();

function defineNavigatorProperty(
  key: 'geolocation' | 'permissions',
  value: unknown,
) {
  Object.defineProperty(navigator, key, { value, configurable: true });
}

// 위치 권한 상태를 정한다. checking 이면 조회가 끝나지 않아 권한 상태를 아직 알 수 없는 상황이다.
// 권한 조회가 끝난 뒤의 동작을 확인할 수 있도록 조회 Promise를 돌려준다
function setupPermission(state: PermissionState | 'checking') {
  const permissionQuery =
    state === 'checking'
      ? new Promise<never>(() => {})
      : Promise.resolve(Object.assign(new EventTarget(), { state }));
  defineNavigatorProperty('geolocation', {
    getCurrentPosition: getCurrentPositionMock,
  });
  defineNavigatorProperty('permissions', { query: () => permissionQuery });

  return permissionQuery;
}

function succeedWithPosition() {
  getCurrentPositionMock.mockImplementation((success) => {
    success({
      coords: { latitude: COORDINATES.lat, longitude: COORDINATES.lng },
    } as GeolocationPosition);
  });
}

function failWithCode(code: number) {
  getCurrentPositionMock.mockImplementation((_success, error) => {
    error?.({ code } as GeolocationPositionError);
  });
}

// 응답이 오지 않아 위치를 받는 중인 상황이다
function keepPositionPending() {
  getCurrentPositionMock.mockImplementation(() => {});
}

// 위치 응답을 붙잡아 두었다가, 돌려받은 함수를 부르면 그때 성공으로 응답한다
function holdPositionUntilReleased() {
  let releasePosition = () => {};
  getCurrentPositionMock.mockImplementation((success) => {
    releasePosition = () =>
      success({
        coords: { latitude: COORDINATES.lat, longitude: COORDINATES.lng },
      } as GeolocationPosition);
  });

  return () => releasePosition();
}

// 온보딩(/)에서 시작해, 훅의 결과와 함께 지금 경로와 이동 방식을 확인할 수 있게 렌더한다
function renderOnboardingEntry() {
  return renderHook(
    () => ({
      entry: useOnboardingEntry(),
      pathname: useLocation().pathname,
      navigationType: useNavigationType(),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
      ),
    },
  );
}

function getSavedReferencePoint() {
  return useReferencePointStore.getState().referencePoint;
}

// 테스트끼리 기준점이 남지 않도록 스토어와 저장소를 초기화한다
beforeEach(() => {
  useReferencePointStore.getState().reset();
  sessionStorage.clear();
  localStorage.clear();
});

// 다음 테스트에 navigator stub과 mock 동작이 남지 않도록 지운다
afterEach(() => {
  Reflect.deleteProperty(navigator, 'geolocation');
  Reflect.deleteProperty(navigator, 'permissions');
  getCurrentPositionMock.mockReset();
});

describe('useOnboardingEntry', () => {
  describe('저장된 동네가 있을 때', () => {
    let permissionQuery: Promise<unknown>;

    // 위치 권한이 허용되어 있어도 사용자가 마지막에 고른 동네를 따르는지 보기 위해 권한을 허용해 둔다
    beforeEach(() => {
      useReferencePointStore.getState().selectNeighborhood(NEIGHBORHOOD_ID);
      permissionQuery = setupPermission('granted');
    });

    it('위치를 요청하지 않고 지도 홈으로 바로 이동합니다', async () => {
      const { result } = renderOnboardingEntry();
      // 권한 조회가 끝나 granted 를 알게 된 뒤에도 위치를 요청하지 않는지 보기 위해 조회가 끝나길 기다린다
      await act(async () => {
        await permissionQuery;
      });

      expect(result.current.pathname).toBe('/map');
      expect(result.current.navigationType).toBe('REPLACE');
      expect(getCurrentPositionMock).not.toHaveBeenCalled();
    });
  });

  describe('저장된 동네가 없고 위치 권한이 이미 허용되어 있을 때', () => {
    // 권한 팝업 없이 위치를 받을 수 있는 상황이다
    beforeEach(() => {
      setupPermission('granted');
    });

    it('위치를 받아 현재 위치를 기준점으로 저장하고 지도 홈으로 이동합니다', async () => {
      succeedWithPosition();

      const { result } = renderOnboardingEntry();

      await waitFor(() => expect(result.current.pathname).toBe('/map'));
      expect(result.current.navigationType).toBe('REPLACE');
      expect(getSavedReferencePoint()).toEqual({
        type: 'currentLocation',
        coordinates: COORDINATES,
      });
    });

    it('위치를 받는 동안에는 온보딩을 보여주지 않습니다', async () => {
      keepPositionPending();

      const { result } = renderOnboardingEntry();

      await waitFor(() => expect(getCurrentPositionMock).toHaveBeenCalled());
      expect(result.current.entry.isDeciding).toBe(true);
    });

    it('위치를 받는 중에 화면을 벗어나면 위치를 받아도 기준점을 저장하지 않습니다', async () => {
      const releasePosition = holdPositionUntilReleased();
      const { unmount } = renderOnboardingEntry();
      await waitFor(() => expect(getCurrentPositionMock).toHaveBeenCalled());

      unmount();
      await act(async () => {
        releasePosition();
      });

      expect(getSavedReferencePoint()).toBeNull();
    });

    // 훅은 granted 인지만 보고 나머지 결과는 같게 처리하므로 대표 케이스 하나만 확인한다.
    // 실패 종류를 나누는 것은 useLocationPermission 테스트에서 검증한다
    it('위치를 받지 못하면(예: 시간 초과) 온보딩을 보여줍니다', async () => {
      failWithCode(POSITION_ERROR_TIMEOUT);

      const { result } = renderOnboardingEntry();

      await waitFor(() => expect(result.current.entry.isDeciding).toBe(false));
      expect(result.current.pathname).toBe('/');
      expect(getSavedReferencePoint()).toBeNull();
    });
  });

  describe('위치 권한 상태를 확인하는 중일 때', () => {
    // 권한 조회가 끝나지 않은 상황이다
    beforeEach(() => {
      setupPermission('checking');
    });

    it('온보딩을 보여주지 않습니다', () => {
      const { result } = renderOnboardingEntry();

      expect(result.current.entry.isDeciding).toBe(true);
    });
  });

  describe('저장된 동네가 없고 위치 권한이 허용되지 않았을 때', () => {
    it.each<PermissionState>(['prompt', 'denied'])(
      '권한이 %s이면 위치를 요청하지 않고 온보딩을 보여줍니다',
      async (state) => {
        setupPermission(state);

        const { result } = renderOnboardingEntry();

        await waitFor(() =>
          expect(result.current.entry.isDeciding).toBe(false),
        );
        expect(result.current.pathname).toBe('/');
        expect(getCurrentPositionMock).not.toHaveBeenCalled();
      },
    );
  });

  describe('위치 허용하고 시작하기를 눌렀을 때', () => {
    // 온보딩이 보이는 상황(권한 미결정)에서 시작한다
    beforeEach(() => {
      setupPermission('prompt');
    });

    async function startWithLocation(
      result: ReturnType<typeof renderOnboardingEntry>['result'],
    ) {
      await waitFor(() => expect(result.current.entry.isDeciding).toBe(false));
      await act(async () => {
        await result.current.entry.startWithLocation();
      });
    }

    it('위치를 허용하면 현재 위치를 기준점으로 저장하고 지도 홈으로 이동합니다', async () => {
      succeedWithPosition();
      const { result } = renderOnboardingEntry();

      await startWithLocation(result);

      expect(getSavedReferencePoint()).toEqual({
        type: 'currentLocation',
        coordinates: COORDINATES,
      });
      expect(result.current.pathname).toBe('/map');
      expect(result.current.navigationType).toBe('REPLACE');
    });

    // 훅은 granted 인지만 보고 나머지 결과는 같게 처리하므로 대표 케이스 하나만 확인한다.
    // 실패 종류를 나누는 것은 useLocationPermission 테스트에서 검증한다
    it('위치를 받지 못하면(예: 거부) 기준점을 저장하지 않고 동네 고르기로 이동합니다', async () => {
      failWithCode(POSITION_ERROR_PERMISSION_DENIED);
      const { result } = renderOnboardingEntry();

      await startWithLocation(result);

      expect(getSavedReferencePoint()).toBeNull();
      expect(result.current.pathname).toBe('/neighborhood');
    });

    it('위치를 받는 중에 다시 누르면 새로 시작하지 않고 진행 중인 작업을 그대로 돌려줍니다', async () => {
      const releasePosition = holdPositionUntilReleased();
      const { result } = renderOnboardingEntry();
      await waitFor(() => expect(result.current.entry.isDeciding).toBe(false));

      let firstStart: Promise<void> | undefined;
      let secondStart: Promise<void> | undefined;
      act(() => {
        firstStart = result.current.entry.startWithLocation();
        secondStart = result.current.entry.startWithLocation();
      });
      await act(async () => {
        releasePosition();
        await firstStart;
      });

      expect(secondStart).toBe(firstStart);
    });

    it('앞선 작업이 끝난 뒤 다시 누르면 위치를 새로 요청합니다', async () => {
      failWithCode(POSITION_ERROR_TIMEOUT);
      const { result } = renderOnboardingEntry();

      await startWithLocation(result);
      await startWithLocation(result);

      expect(getCurrentPositionMock).toHaveBeenCalledTimes(2);
    });

    it('버튼을 누른 뒤 위치를 받기 전에 화면을 벗어나면 위치를 받아도 기준점을 저장하지 않습니다', async () => {
      const releasePosition = holdPositionUntilReleased();
      const { result, unmount } = renderOnboardingEntry();
      await waitFor(() => expect(result.current.entry.isDeciding).toBe(false));

      let start: Promise<void> | undefined;
      act(() => {
        start = result.current.entry.startWithLocation();
      });
      unmount();
      await act(async () => {
        releasePosition();
        await start;
      });

      expect(getSavedReferencePoint()).toBeNull();
    });
  });
});
