import { useCallback, useEffect, useRef, useState } from 'react';

// 동네 단위 기준점이라 고정밀도(GPS)는 쓰지 않고, 실내 등 수신이 느린 상황을 고려해 10초까지 기다린다
const REQUEST_TIMEOUT_MS = 10_000;
// 일부 브라우저는 권한 팝업을 무시하거나 닫으면 콜백을 주지 않아, 브라우저 timeout과 별도로 요청을 끝낸다.
// 브라우저 timeout은 팝업에 답하는 시간을 세지 않으므로, 팝업을 보는 동안 먼저 끝나지 않게 여유를 둔다
const FALLBACK_TIMEOUT_MS = REQUEST_TIMEOUT_MS + 5_000;

// GeolocationPositionError.code 값
const POSITION_ERROR_PERMISSION_DENIED = 1;
const POSITION_ERROR_TIMEOUT = 3;

type Coordinates = {
  lat: number;
  lng: number;
};

// checking: 권한 상태를 조회하는 중이라 아직 알 수 없다
export type LocationPermissionState = PermissionState | 'checking';

export type LocationResult =
  | { status: 'granted'; coordinates: Coordinates }
  | { status: 'denied' }
  | { status: 'unsupported' }
  | { status: 'timeout' }
  | { status: 'error' };

function toFailureResult(error: GeolocationPositionError): LocationResult {
  if (error.code === POSITION_ERROR_PERMISSION_DENIED) {
    return { status: 'denied' };
  }
  if (error.code === POSITION_ERROR_TIMEOUT) {
    return { status: 'timeout' };
  }

  return { status: 'error' };
}

function getCurrentLocation(): Promise<LocationResult> {
  return new Promise((resolve) => {
    const fallbackTimer = setTimeout(
      () => resolve({ status: 'timeout' }),
      FALLBACK_TIMEOUT_MS,
    );
    const settle = (result: LocationResult) => {
      clearTimeout(fallbackTimer);
      resolve(result);
    };

    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        settle({
          status: 'granted',
          coordinates: { lat: coords.latitude, lng: coords.longitude },
        }),
      (error) => settle(toFailureResult(error)),
      { timeout: REQUEST_TIMEOUT_MS, enableHighAccuracy: false },
    );
  });
}

// Permissions API가 없으면 조회할 수 없으므로 미결정으로 시작한다
function getInitialPermissionState(): LocationPermissionState {
  return 'permissions' in navigator ? 'checking' : 'prompt';
}

export function useLocationPermission() {
  const [permissionState, setPermissionState] =
    useState<LocationPermissionState>(getInitialPermissionState);
  const [isRequesting, setIsRequesting] = useState(false);
  const pendingRequestRef = useRef<Promise<LocationResult> | null>(null);

  const requestLocation = useCallback((): Promise<LocationResult> => {
    // 요청 중에 다시 눌러도 브라우저 요청을 새로 만들지 않고 진행 중인 결과를 함께 기다린다
    if (pendingRequestRef.current) {
      return pendingRequestRef.current;
    }
    if (!('geolocation' in navigator)) {
      return Promise.resolve({ status: 'unsupported' });
    }
    // 이미 거부된 상태에서는 브라우저가 팝업을 다시 띄우지 않으므로 요청하지 않는다
    if (permissionState === 'denied') {
      return Promise.resolve({ status: 'denied' });
    }

    setIsRequesting(true);
    const pendingRequest = getCurrentLocation()
      .then((result) => {
        // Permissions API가 없어도 요청 결과로 권한 상태를 알 수 있다
        if (result.status === 'granted' || result.status === 'denied') {
          setPermissionState(result.status);
        }
        return result;
      })
      .finally(() => {
        // 요청이 끝나면 비워야 시간 초과 뒤 재시도할 때 새 요청을 보낼 수 있다
        pendingRequestRef.current = null;
        setIsRequesting(false);
      });
    pendingRequestRef.current = pendingRequest;

    return pendingRequest;
  }, [permissionState]);

  useEffect(() => {
    if (!('permissions' in navigator)) {
      return;
    }
    let isActive = true;
    let permissionStatus: PermissionStatus | null = null;
    const handlePermissionChange = () => {
      if (permissionStatus) {
        setPermissionState(permissionStatus.state);
      }
    };

    navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => {
        if (!isActive) {
          return;
        }
        permissionStatus = status;
        setPermissionState(status.state);
        // 브라우저 설정에서 권한을 바꾸면 다시 마운트하지 않아도 반영한다
        status.addEventListener('change', handlePermissionChange);
      })
      .catch(() => {
        if (isActive) {
          setPermissionState('prompt');
        }
      });

    return () => {
      isActive = false;
      permissionStatus?.removeEventListener('change', handlePermissionChange);
    };
  }, []);

  return { permissionState, isRequesting, requestLocation };
}
