import { useCallback, useEffect, useRef, useState } from 'react';

import { useReferencePointStore } from '@/entities/reference-point';
import { useLocationPermission } from '@/shared/lib/geolocation';

type UseReferenceChangeOptions = {
  // 시트 열림 상태는 시트를 띄운 화면이 가지므로, 닫기는 콜백으로 받는다
  onClose: () => void;
};

/*
 * 지도 홈의 기준 변경 시트 동작. 고르는 즉시 기준을 바꾸고 시트를 닫는다. 반경은 건드리지 않는다.
 * 지금 기준이 무엇인지는 시트가 useReferencePointStore 에서 직접 읽는다.
 * 시트가 닫힌 뒤 도착한 위치가 기준점을 덮어쓰지 않도록, 시트 컴포넌트 안에서 호출한다
 */
export function useReferenceChange({ onClose }: UseReferenceChangeOptions) {
  const { isRequesting, requestLocation } = useLocationPermission();
  const [isLocationFailed, setIsLocationFailed] = useState(false);
  const pendingSelectionRef = useRef<Promise<void> | null>(null);
  const isMountedRef = useRef(false);

  // 마운트될 때마다 true 로 다시 둔다. StrictMode 는 effect 를 정리했다가 다시 실행하므로 초기값만으로는 부족하다
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 지금 기준과 같은 동네면 기준점을 새로 저장하지 않아, 기준점을 구독하는 화면이 괜히 다시 그려지지 않게 한다
  const selectNeighborhood = useCallback(
    (neighborhoodId: number) => {
      const { referencePoint, selectNeighborhood: saveNeighborhood } =
        useReferencePointStore.getState();
      const isSameNeighborhood =
        referencePoint?.type === 'neighborhood' &&
        referencePoint.neighborhoodId === neighborhoodId;
      if (!isSameNeighborhood) {
        saveNeighborhood(neighborhoodId);
      }
      onClose();
    },
    [onClose],
  );

  /*
   * 위치를 받지 못하면(거부·시간 초과·미지원·오류) 기준은 그대로 두고, 시트가 실패 안내와 다시 시도·동네 고르기를 보여주도록 알린다.
   * isRequesting 은 다음 렌더에야 바뀌어 빠르게 두 번 누르면 막지 못하므로, 진행 중인 작업을 ref 에 두고 함께 기다리게 해서 기준 변경·시트 닫기가 한 번만 일어나게 한다
   */
  const selectCurrentLocation = useCallback((): Promise<void> => {
    if (pendingSelectionRef.current) {
      return pendingSelectionRef.current;
    }
    setIsLocationFailed(false);
    const pendingSelection = (async () => {
      const result = await requestLocation();
      // 위치를 기다리는 동안 시트가 사라졌으면, 그 사이 사용자가 고른 기준점을 덮어쓰지 않도록 아무것도 하지 않는다
      if (!isMountedRef.current) {
        return;
      }
      if (result.status !== 'granted') {
        setIsLocationFailed(true);
        return;
      }
      useReferencePointStore
        .getState()
        .selectCurrentLocation(result.coordinates);
      onClose();
    })().finally(() => {
      // 끝나면 비워야 실패 뒤 다시 시도할 수 있다
      pendingSelectionRef.current = null;
    });
    pendingSelectionRef.current = pendingSelection;

    return pendingSelection;
  }, [requestLocation, onClose]);

  // 실패 안내에서 "동네 고르기"를 누르면 안내를 닫고 시트의 동네 목록으로 돌아간다
  const dismissLocationFailure = useCallback(() => {
    setIsLocationFailed(false);
  }, []);

  return {
    isLocating: isRequesting,
    isLocationFailed,
    selectNeighborhood,
    selectCurrentLocation,
    dismissLocationFailure,
  };
}
