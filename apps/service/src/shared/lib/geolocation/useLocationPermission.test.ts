import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  type LocationResult,
  useLocationPermission,
} from './useLocationPermission';

const COORDINATES = { lat: 37.5445, lng: 127.056 };
const REQUEST_TIMEOUT_MS = 10_000;
const FALLBACK_TIMEOUT_MS = 15_000;

// GeolocationPositionError.code 값
const POSITION_ERROR_PERMISSION_DENIED = 1;
const POSITION_ERROR_POSITION_UNAVAILABLE = 2;
const POSITION_ERROR_TIMEOUT = 3;

type NavigatorSetup = {
  hasGeolocation?: boolean;
  permissions?:
    | { state: PermissionState }
    | { queryError: Error }
    | 'pending'
    | 'unsupported';
};

// jsdom에는 Geolocation API가 없고, 실제 위치 요청을 보내지 않기 위해 getCurrentPosition을 mock으로 대신합니다
const getCurrentPositionMock = vi.fn<Geolocation['getCurrentPosition']>();

function positionStub(): GeolocationPosition {
  return {
    coords: { latitude: COORDINATES.lat, longitude: COORDINATES.lng },
  } as GeolocationPosition;
}

function positionErrorStub(code: number): GeolocationPositionError {
  return { code } as GeolocationPositionError;
}

// change 이벤트를 실제로 보낼 수 있도록 EventTarget에 state만 붙입니다
function permissionStatusStub(state: PermissionState) {
  return Object.assign(new EventTarget(), { state });
}

function defineNavigatorProperty(
  key: 'geolocation' | 'permissions',
  value: unknown,
) {
  Object.defineProperty(navigator, key, { value, configurable: true });
}

// jsdom에는 Geolocation·Permissions API가 없어 테스트마다 navigator에 stub을 넣습니다
function setupNavigator({
  hasGeolocation = true,
  permissions = 'unsupported',
}: NavigatorSetup = {}) {
  if (hasGeolocation) {
    defineNavigatorProperty('geolocation', {
      getCurrentPosition: getCurrentPositionMock,
    });
  }
  if (permissions === 'unsupported') {
    return null;
  }

  if (permissions === 'pending') {
    defineNavigatorProperty('permissions', {
      query: () => new Promise(() => {}),
    });
    return null;
  }
  if ('queryError' in permissions) {
    defineNavigatorProperty('permissions', {
      query: () => Promise.reject(permissions.queryError),
    });
    return null;
  }
  const permissionStatus = permissionStatusStub(permissions.state);
  defineNavigatorProperty('permissions', {
    query: () => Promise.resolve(permissionStatus),
  });
  return permissionStatus;
}

function succeedWithPosition() {
  getCurrentPositionMock.mockImplementation((success) => {
    success(positionStub());
  });
}

function failWithCode(code: number) {
  getCurrentPositionMock.mockImplementation((_success, error) => {
    error?.(positionErrorStub(code));
  });
}

function renderLocationPermission() {
  return renderHook(() => useLocationPermission());
}

async function requestLocationInAct(
  result: ReturnType<typeof renderLocationPermission>['result'],
): Promise<LocationResult | undefined> {
  let outcome: LocationResult | undefined;
  await act(async () => {
    outcome = await result.current.requestLocation();
  });
  return outcome;
}

// 테스트끼리 navigator stub, mock 응답, 가짜 타이머가 섞이지 않도록 매번 되돌리고 렌더한 훅을 정리합니다
afterEach(() => {
  Reflect.deleteProperty(navigator, 'geolocation');
  Reflect.deleteProperty(navigator, 'permissions');
  getCurrentPositionMock.mockReset();
  vi.useRealTimers();
  cleanup();
});

describe('useLocationPermission', () => {
  describe('위치를 요청하기 전', () => {
    it('위치 요청을 보내지 않습니다', async () => {
      setupNavigator({ permissions: { state: 'granted' } });

      const { result } = renderLocationPermission();
      await waitFor(() => {
        expect(result.current.permissionState).toBe('granted');
      });

      expect(getCurrentPositionMock).not.toHaveBeenCalled();
    });

    it('권한 상태를 조회하는 동안에는 checking으로 알려줍니다', () => {
      setupNavigator({ permissions: 'pending' });

      const { result } = renderLocationPermission();

      expect(result.current.permissionState).toBe('checking');
    });

    it.each<PermissionState>(['granted', 'denied', 'prompt'])(
      '브라우저 권한 상태가 %s이면 그대로 알려줍니다',
      async (state) => {
        setupNavigator({ permissions: { state } });

        const { result } = renderLocationPermission();

        await waitFor(() => {
          expect(result.current.permissionState).toBe(state);
        });
      },
    );

    it.each<[string, NavigatorSetup['permissions']]>([
      ['Permissions API가 없으면', 'unsupported'],
      [
        '권한 상태 조회에 실패하면',
        { queryError: new TypeError('unsupported') },
      ],
    ])('%s 권한 상태를 prompt로 알려줍니다', async (_label, permissions) => {
      setupNavigator({ permissions });

      const { result } = renderLocationPermission();

      await waitFor(() => {
        expect(result.current.permissionState).toBe('prompt');
      });
    });
  });

  describe('브라우저 설정에서 권한이 바뀌었을 때', () => {
    it('바뀐 권한 상태를 알려줍니다', async () => {
      const permissionStatus = setupNavigator({
        permissions: { state: 'denied' },
      });
      const { result } = renderLocationPermission();
      await waitFor(() => {
        expect(result.current.permissionState).toBe('denied');
      });

      act(() => {
        permissionStatus!.state = 'granted';
        permissionStatus!.dispatchEvent(new Event('change'));
      });

      expect(result.current.permissionState).toBe('granted');
    });
  });

  describe('위치 요청이 성공했을 때', () => {
    it('granted와 함께 좌표를 lat, lng로 돌려줍니다', async () => {
      setupNavigator();
      succeedWithPosition();
      const { result } = renderLocationPermission();

      const outcome = await requestLocationInAct(result);

      expect(outcome).toEqual({ status: 'granted', coordinates: COORDINATES });
    });
  });

  describe('위치 요청이 실패했을 때', () => {
    it.each([
      [POSITION_ERROR_PERMISSION_DENIED, 'denied'],
      [POSITION_ERROR_TIMEOUT, 'timeout'],
      [POSITION_ERROR_POSITION_UNAVAILABLE, 'error'],
    ])('오류 코드가 %i이면 %s를 돌려줍니다', async (code, status) => {
      setupNavigator();
      failWithCode(code);
      const { result } = renderLocationPermission();

      const outcome = await requestLocationInAct(result);

      expect(outcome).toEqual({ status });
    });
  });

  describe('Permissions API 없이 위치를 요청했을 때', () => {
    it.each<[string, () => void, PermissionState]>([
      ['허용하면', succeedWithPosition, 'granted'],
      [
        '거부하면',
        () => failWithCode(POSITION_ERROR_PERMISSION_DENIED),
        'denied',
      ],
    ])(
      '%s 요청 결과로 권한 상태를 %s로 바꿉니다',
      async (_label, respond, state) => {
        setupNavigator();
        respond();
        const { result } = renderLocationPermission();

        await requestLocationInAct(result);

        expect(result.current.permissionState).toBe(state);
      },
    );
  });

  describe('시간 초과 뒤 다시 요청했을 때', () => {
    it('새로 위치를 요청하고 성공하면 좌표를 돌려줍니다', async () => {
      setupNavigator();
      failWithCode(POSITION_ERROR_TIMEOUT);
      const { result } = renderLocationPermission();
      await requestLocationInAct(result);

      succeedWithPosition();
      const outcome = await requestLocationInAct(result);

      expect(getCurrentPositionMock).toHaveBeenCalledTimes(2);
      expect(outcome).toEqual({ status: 'granted', coordinates: COORDINATES });
    });
  });

  describe('브라우저가 끝내 응답하지 않을 때', () => {
    it('15초가 지나면 timeout을 돌려주고 다시 요청할 수 있습니다', async () => {
      vi.useFakeTimers();
      setupNavigator();
      const { result } = renderLocationPermission();

      let pending: Promise<LocationResult> | undefined;
      act(() => {
        pending = result.current.requestLocation();
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(FALLBACK_TIMEOUT_MS);
      });

      expect(await pending).toEqual({ status: 'timeout' });
      expect(result.current.isRequesting).toBe(false);

      succeedWithPosition();
      expect(await requestLocationInAct(result)).toEqual({
        status: 'granted',
        coordinates: COORDINATES,
      });
    });
  });

  describe('이미 권한이 거부된 상태일 때', () => {
    it('위치 요청 없이 denied를 돌려줍니다', async () => {
      setupNavigator({ permissions: { state: 'denied' } });
      const { result } = renderLocationPermission();
      await waitFor(() => {
        expect(result.current.permissionState).toBe('denied');
      });

      const outcome = await requestLocationInAct(result);

      expect(getCurrentPositionMock).not.toHaveBeenCalled();
      expect(outcome).toEqual({ status: 'denied' });
    });
  });

  describe('브라우저가 Geolocation을 지원하지 않을 때', () => {
    it('위치 요청 없이 unsupported를 돌려줍니다', async () => {
      setupNavigator({ hasGeolocation: false });
      const { result } = renderLocationPermission();

      const outcome = await requestLocationInAct(result);

      expect(outcome).toEqual({ status: 'unsupported' });
    });
  });

  describe('위치를 요청하는 중일 때', () => {
    // 응답 콜백을 바로 부르지 않고 붙잡아 두어 요청이 끝나지 않은 상태를 만듭니다
    function holdPositionResponse() {
      let respond = () => {};
      getCurrentPositionMock.mockImplementation((success) => {
        respond = () => success(positionStub());
      });
      return () => respond();
    }

    it('isRequesting이 true이고 끝나면 false가 됩니다', async () => {
      setupNavigator();
      const respond = holdPositionResponse();
      const { result } = renderLocationPermission();

      let pending: Promise<LocationResult> | undefined;
      act(() => {
        pending = result.current.requestLocation();
      });
      expect(result.current.isRequesting).toBe(true);

      await act(async () => {
        respond();
        await pending;
      });
      expect(result.current.isRequesting).toBe(false);
    });

    it('다시 호출해도 위치 요청은 한 번만 보냅니다', async () => {
      setupNavigator();
      const respond = holdPositionResponse();
      const { result } = renderLocationPermission();

      let first: Promise<LocationResult> | undefined;
      let second: Promise<LocationResult> | undefined;
      act(() => {
        first = result.current.requestLocation();
      });
      act(() => {
        second = result.current.requestLocation();
      });
      await act(async () => {
        respond();
        await Promise.all([first, second]);
      });

      expect(getCurrentPositionMock).toHaveBeenCalledTimes(1);
      expect(await second).toEqual(await first);
    });
  });

  it('10초 시간 초과와 고정밀도 미사용 옵션으로 요청합니다', async () => {
    setupNavigator();
    succeedWithPosition();
    const { result } = renderLocationPermission();

    await requestLocationInAct(result);

    expect(getCurrentPositionMock).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({
        timeout: REQUEST_TIMEOUT_MS,
        enableHighAccuracy: false,
      }),
    );
  });
});
