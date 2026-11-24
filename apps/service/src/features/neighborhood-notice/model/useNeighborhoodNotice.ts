import { useCallback, useRef, useState } from 'react';

import {
  type ReferencePoint,
  useReferencePointStore,
} from '@/entities/reference-point';
import {
  useLocationPermission,
  useLocationResultHandler,
} from '@/shared/lib/geolocation';

import { useNeighborhoodNoticeStore } from './neighborhoodNoticeStore';

type UseNeighborhoodNoticeOptions = {
  // 기준 변경 시트 열림 상태는 지도 홈이 가지므로, 위치를 받지 못했을 때 시트를 여는 동작은 콜백으로 받는다
  onLocationFailed: () => void;
};

/*
 * 동네 기준으로 보고 있을 때 "내 위치로 보기"를 권하는 안내.
 * 위치를 받으면 동네 기준에서 벗어나 안내 배너가 사라지므로, 바꿨다는 안내 상태를 지키도록 배너가 아니라 지도 홈에서 호출한다
 */
export function useNeighborhoodNotice({
  onLocationFailed,
}: UseNeighborhoodNoticeOptions) {
  const { permissionState, isRequesting, requestLocation } =
    useLocationPermission();
  const isNeighborhoodReference = useReferencePointStore(
    (state) => state.referencePoint?.type === 'neighborhood',
  );
  const isDismissed = useNeighborhoodNoticeStore((state) => state.isDismissed);
  const dismissNotice = useNeighborhoodNoticeStore((state) => state.dismiss);
  const [hasSwitchedToCurrentLocation, setHasSwitchedToCurrentLocation] =
    useState(false);
  const requestedReferencePointRef = useRef<ReferencePoint | null>(null);

  // 다시 동네 기준으로 돌아가면 "내 위치 기준으로 바꿨어요"는 더 맞지 않는다
  if (hasSwitchedToCurrentLocation && isNeighborhoodReference) {
    setHasSwitchedToCurrentLocation(false);
  }

  /*
   * 위치를 받지 못하면(거부·시간 초과·미지원·오류) 기준은 그대로 두고 다른 기준을 고르도록 시트를 연다.
   * 지도 홈은 위치를 기다리는 동안에도 화면에 남아 있으므로, 그 사이 사용자가 다른 기준을 골랐으면 그 선택을 덮어쓰지 않는다
   */
  const applyLocationResult = useLocationResultHandler(
    requestLocation,
    (result) => {
      const { referencePoint, selectCurrentLocation } =
        useReferencePointStore.getState();
      if (referencePoint !== requestedReferencePointRef.current) {
        return;
      }
      if (result.status !== 'granted') {
        onLocationFailed();
        return;
      }
      selectCurrentLocation(result.coordinates);
      setHasSwitchedToCurrentLocation(true);
    },
  );

  const switchToCurrentLocation = useCallback((): Promise<void> => {
    requestedReferencePointRef.current =
      useReferencePointStore.getState().referencePoint;
    return applyLocationResult();
  }, [applyLocationResult]);

  return {
    isNoticeVisible: isNeighborhoodReference && !isDismissed,
    // 거부된 상태에서는 눌러도 위치를 받지 못하고 시트가 열리므로, 화면이 안내 문구를 다르게 쓸 수 있게 알린다
    isLocationDenied: permissionState === 'denied',
    isLocating: isRequesting,
    hasSwitchedToCurrentLocation,
    switchToCurrentLocation,
    dismissNotice,
  };
}
