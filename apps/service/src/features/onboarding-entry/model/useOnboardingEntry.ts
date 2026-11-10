import { useCallback, useEffect, useState } from 'react';
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

  const shouldAutoLocate =
    !hasSavedNeighborhood &&
    permissionState === 'granted' &&
    !hasAutoLocateFailed;
  // 진입 화면을 정하는 동안에는 온보딩이 잠깐 보였다가 사라지지 않도록 화면이 아무것도 그리지 않게 한다
  const isDeciding =
    hasSavedNeighborhood || permissionState === 'checking' || shouldAutoLocate;

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

  // "위치 허용하고 시작하기" 버튼 동작. 위치를 받지 못하면(거부·시간 초과·미지원·오류) 동네를 직접 고르게 한다
  const startWithLocation = useCallback(async () => {
    const result = await requestLocation();
    if (result.status === 'granted') {
      selectCurrentLocation(result.coordinates);
      await navigate(MAP_HOME_PATH, { replace: true });
      return;
    }
    await navigate(NEIGHBORHOOD_SELECT_PATH);
  }, [requestLocation, selectCurrentLocation, navigate]);

  return { isDeciding, isRequesting, startWithLocation };
}
