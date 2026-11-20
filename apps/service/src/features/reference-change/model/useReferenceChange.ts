import { useCallback, useState } from 'react';

import { useReferencePointStore } from '@/entities/reference-point';
import {
  useLocationPermission,
  useLocationResultHandler,
} from '@/shared/lib/geolocation';

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

  // 위치를 받지 못하면(거부·시간 초과·미지원·오류) 기준은 그대로 두고, 시트가 실패 안내와 다시 시도·동네 고르기를 보여주도록 알린다
  const requestAndApplyLocation = useLocationResultHandler(
    requestLocation,
    (result) => {
      if (result.status !== 'granted') {
        setIsLocationFailed(true);
        return;
      }
      useReferencePointStore
        .getState()
        .selectCurrentLocation(result.coordinates);
      onClose();
    },
  );

  // 실패 안내에서 "위치 허용 다시 시도"를 눌러도 같은 함수를 부르므로, 시작할 때 안내를 지운다
  const selectCurrentLocation = useCallback((): Promise<void> => {
    setIsLocationFailed(false);
    return requestAndApplyLocation();
  }, [requestAndApplyLocation]);

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
