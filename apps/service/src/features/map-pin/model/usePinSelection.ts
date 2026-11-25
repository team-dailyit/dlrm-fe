import { useEffect } from 'react';

import type { PlaceSearch } from '@/entities/place';

import { useMapPinStore } from './mapPinStore';

type UsePinSelectionOptions<T> = {
  // 카테고리로 거른 뒤 지도에 핀으로 올리는 장소들이다
  visiblePlaces: T[];
  placeSearch: PlaceSearch | null;
  selectedCategoryIds: readonly number[];
};

/**
 * 지도 홈의 핀 선택을 다룬다. 핀 요약에 보여줄 장소와 장소 목록(숫자 핀으로 거른 결과)을 돌려준다.
 * 기준점·반경·고른 카테고리가 바뀌면 고른 핀과 숫자 핀 거르기를 없는 것으로 본다.
 * 렌더 중에 고를 때의 조건과 비교해서, 조건이 바뀐 첫 렌더부터 예전 선택이 보이지 않는다
 */
export function usePinSelection<T extends { placeId: number }>({
  visiblePlaces,
  placeSearch,
  selectedCategoryIds,
}: UsePinSelectionOptions<T>) {
  // 렌더마다 새 객체가 와도 값이 같으면 같은 조건으로 보도록 값으로 만든다
  const resetKey = JSON.stringify([placeSearch, selectedCategoryIds]);
  const selectedPlaceId = useMapPinStore((state) => state.selectedPlaceId);
  const clusterPlaceIds = useMapPinStore((state) => state.clusterPlaceIds);
  const isCurrent = useMapPinStore((state) => state.resetKey === resetKey);
  const selectPlacePin = useMapPinStore((state) => state.selectPlacePin);
  const selectClusterPin = useMapPinStore((state) => state.selectClusterPin);
  const clearPinSelection = useMapPinStore((state) => state.clearPinSelection);

  // 렌더 중 비교는 화면에서만 가리므로, 조건이 원래대로 돌아와도 예전 선택이 되살아나지 않게 스토어에서도 지운다
  useEffect(() => {
    if (!isCurrent) {
      clearPinSelection();
    }
  }, [isCurrent, clearPinSelection]);

  // 같은 조건이어도 다시 받은 장소 목록에서 빠졌으면 핀 요약을 보여주지 않는다
  const selectedPlace = isCurrent
    ? (visiblePlaces.find(({ placeId }) => placeId === selectedPlaceId) ?? null)
    : null;
  const clustered = isCurrent && clusterPlaceIds && new Set(clusterPlaceIds);
  // 가까운 순서를 지키도록 받은 순서 그대로 거른다
  const listedPlaces = clustered
    ? visiblePlaces.filter(({ placeId }) => clustered.has(placeId))
    : visiblePlaces;

  return {
    selectedPlace,
    listedPlaces,
    selectPlacePin: (placeId: number) => selectPlacePin(placeId, resetKey),
    selectClusterPin: (placeIds: number[]) =>
      selectClusterPin(placeIds, resetKey),
    // 빈 지도를 눌렀을 때 부른다
    clearPinSelection,
  };
}
