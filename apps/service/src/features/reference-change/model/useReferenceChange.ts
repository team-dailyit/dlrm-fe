import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

import { useReferencePointStore } from '@/entities/reference-point';
import { useLocationPermission } from '@/shared/lib/geolocation';

const NEIGHBORHOOD_SELECT_PATH = '/neighborhood';

type UseReferenceChangeOptions = {
  // 시트 열림 상태는 시트를 띄운 화면이 가지므로, 닫기는 콜백으로 받는다
  onClose: () => void;
};

/*
 * 지도 홈의 기준 변경 시트 동작. 고르는 즉시 기준을 바꾸고 시트를 닫는다.
 * 반경은 건드리지 않으므로 기준을 바꿔도 그대로 유지된다
 */
export function useReferenceChange({ onClose }: UseReferenceChangeOptions) {
  const navigate = useNavigate();
  const { isRequesting, requestLocation } = useLocationPermission();
  const referencePoint = useReferencePointStore(
    (state) => state.referencePoint,
  );
  const selectNeighborhood = useReferencePointStore(
    (state) => state.selectNeighborhood,
  );
  const selectCurrentLocation = useReferencePointStore(
    (state) => state.selectCurrentLocation,
  );
  const pendingChoiceRef = useRef<Promise<void> | null>(null);
  const isMountedRef = useRef(false);

  // 마운트될 때마다 true 로 다시 둔다. StrictMode 는 effect 를 정리했다가 다시 실행하므로 초기값만으로는 부족하다
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const selectedNeighborhoodId =
    referencePoint?.type === 'neighborhood'
      ? referencePoint.neighborhoodId
      : null;

  // 지금 기준과 같은 동네면 기준점을 새로 저장하지 않아, 기준점을 구독하는 화면이 괜히 다시 그려지지 않게 한다
  const chooseNeighborhood = useCallback(
    (neighborhoodId: number) => {
      if (neighborhoodId !== selectedNeighborhoodId) {
        selectNeighborhood(neighborhoodId);
      }
      onClose();
    },
    [selectedNeighborhoodId, selectNeighborhood, onClose],
  );

  /*
   * 위치를 받지 못하면(거부·시간 초과·미지원·오류) 기준은 그대로 두고 동네 고르기로 보낸다.
   * isRequesting 은 다음 렌더에야 바뀌어 빠르게 두 번 누르면 막지 못하므로, 진행 중인 작업을 ref 에 두고 함께 기다리게 해서 기준 변경·시트 닫기가 한 번만 일어나게 한다
   */
  const chooseCurrentLocation = useCallback((): Promise<void> => {
    if (pendingChoiceRef.current) {
      return pendingChoiceRef.current;
    }
    const pendingChoice = (async () => {
      const result = await requestLocation();
      // 위치를 기다리는 동안 시트가 사라졌으면, 그 사이 사용자가 고른 기준점을 덮어쓰거나 다른 화면으로 끌고 가지 않도록 아무것도 하지 않는다
      if (!isMountedRef.current) {
        return;
      }
      if (result.status === 'granted') {
        selectCurrentLocation(result.coordinates);
        onClose();
        return;
      }
      await navigate(NEIGHBORHOOD_SELECT_PATH);
    })().finally(() => {
      // 끝나면 비워야 시간 초과 뒤 다시 누를 수 있다
      pendingChoiceRef.current = null;
    });
    pendingChoiceRef.current = pendingChoice;

    return pendingChoice;
  }, [requestLocation, selectCurrentLocation, onClose, navigate]);

  return {
    isCurrentLocationSelected: referencePoint?.type === 'currentLocation',
    selectedNeighborhoodId,
    isLocating: isRequesting,
    chooseNeighborhood,
    chooseCurrentLocation,
  };
}
