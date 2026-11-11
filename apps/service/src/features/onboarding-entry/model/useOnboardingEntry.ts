import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { useReferencePointStore } from '@/entities/reference-point';
import { useLocationPermission } from '@/shared/lib/geolocation';

const MAP_HOME_PATH = '/map';
const NEIGHBORHOOD_SELECT_PATH = '/neighborhood';

/**
 * 앱에 들어왔을 때(`/`) 온보딩을 보여줄지, 바로 지도 홈으로 보낼지 정한다.
 * 1. 저장된 동네가 있으면 지도 홈으로 보낸다. 사용자가 마지막에 직접 고른 기준을 따르기 위해 위치 권한보다 먼저 본다
 * 2. 위치 권한이 이미 허용되어 있으면 위치를 받아 현재 위치 기준으로 지도 홈으로 보낸다
 * 3. 그 밖의 경우, 또는 2에서 위치를 받지 못하면 온보딩을 보여준다
 */
export function useOnboardingEntry() {
  const navigate = useNavigate();
  const { permissionState, isRequesting, requestLocation } =
    useLocationPermission();
  const hasSavedNeighborhood = useReferencePointStore(
    (state) => state.referencePoint?.type === 'neighborhood',
  );
  const selectCurrentLocation = useReferencePointStore(
    (state) => state.selectCurrentLocation,
  );
  const [hasAutoLocateFailed, setHasAutoLocateFailed] = useState(false);
  const pendingStartRef = useRef<Promise<void> | null>(null);
  const isMountedRef = useRef(false);

  const shouldAutoLocate =
    !hasSavedNeighborhood &&
    permissionState === 'granted' &&
    !hasAutoLocateFailed;
  // 진입 화면을 정하는 동안에는 온보딩이 잠깐 보였다가 사라지지 않도록 화면이 아무것도 그리지 않게 한다
  const isDeciding =
    hasSavedNeighborhood || permissionState === 'checking' || shouldAutoLocate;

  // 마운트될 때마다 true 로 다시 둔다. StrictMode 는 effect 를 정리했다가 다시 실행하므로 초기값만으로는 부족하다
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 자동으로 넘어가는 이동은 replace 로 해서, 뒤로 가기로 온보딩에 돌아오지 않게 한다
  useEffect(() => {
    if (hasSavedNeighborhood) {
      void navigate(MAP_HOME_PATH, { replace: true });
    }
  }, [hasSavedNeighborhood, navigate]);

  useEffect(() => {
    if (!shouldAutoLocate) {
      return;
    }
    let isActive = true;
    void requestLocation().then((result) => {
      if (!isActive) {
        return;
      }
      if (result.status === 'granted') {
        selectCurrentLocation(result.coordinates);
        void navigate(MAP_HOME_PATH, { replace: true });
        return;
      }
      setHasAutoLocateFailed(true);
    });

    return () => {
      isActive = false;
    };
  }, [shouldAutoLocate, requestLocation, selectCurrentLocation, navigate]);

  // "위치 허용하고 시작하기" 버튼 동작. 위치를 받지 못하면(거부·시간 초과·미지원·오류) 동네를 직접 고르게 한다.
  // isRequesting 은 다음 렌더에야 바뀌어 빠르게 두 번 누르면 막지 못하므로, 진행 중인 작업을 ref 에 두고 함께 기다리게 해서 저장·이동이 한 번만 일어나게 한다
  const startWithLocation = useCallback((): Promise<void> => {
    if (pendingStartRef.current) {
      return pendingStartRef.current;
    }
    const pendingStart = (async () => {
      const result = await requestLocation();
      // 위치를 기다리는 동안 화면을 벗어났으면, 그 사이 사용자가 고른 기준점을 덮어쓰거나 다른 화면으로 끌고 가지 않도록 아무것도 하지 않는다
      if (!isMountedRef.current) {
        return;
      }
      if (result.status === 'granted') {
        selectCurrentLocation(result.coordinates);
        await navigate(MAP_HOME_PATH, { replace: true });
        return;
      }
      await navigate(NEIGHBORHOOD_SELECT_PATH);
    })().finally(() => {
      // 끝나면 비워야 동네 고르기에서 뒤로 돌아온 뒤 다시 누를 수 있다
      pendingStartRef.current = null;
    });
    pendingStartRef.current = pendingStart;

    return pendingStart;
  }, [requestLocation, selectCurrentLocation, navigate]);

  return { isDeciding, isRequesting, startWithLocation };
}
