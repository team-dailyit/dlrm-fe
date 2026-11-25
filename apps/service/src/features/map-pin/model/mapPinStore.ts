import { create } from 'zustand';

type MapPinState = {
  // 핀 요약에 보여줄 장소
  selectedPlaceId: number | null;
  // 숫자 핀을 눌러 장소 목록을 거른 장소들. null 이면 거르지 않는다
  clusterPlaceIds: number[] | null;
  // 고를 때의 장소 검색 조건·고른 카테고리. 지금 조건과 다르면 고른 핀과 거르기를 없는 것으로 본다
  resetKey: string | null;
};

type MapPinActions = {
  selectPlacePin: (placeId: number, resetKey: string) => void;
  selectClusterPin: (placeIds: number[], resetKey: string) => void;
  clearPinSelection: () => void;
};

const initialState: MapPinState = {
  selectedPlaceId: null,
  clusterPlaceIds: null,
  resetKey: null,
};

/*
 * 지도 핀, 핀 요약, 장소 목록이 같은 선택을 보도록 스토어 하나에 둔다. 화면은 usePinSelection 으로만 읽고 바꾼다.
 * 새로고침하면 다시 고르지 않은 상태로 시작해야 해서 persist 하지 않는다
 */
export const useMapPinStore = create<MapPinState & MapPinActions>()((set) => ({
  ...initialState,
  // 숫자 핀으로 확대한 뒤 그 안의 장소를 골라도 장소 목록 거르기는 유지한다
  selectPlacePin: (placeId, resetKey) =>
    set({ selectedPlaceId: placeId, resetKey }),
  selectClusterPin: (placeIds, resetKey) =>
    set({ selectedPlaceId: null, clusterPlaceIds: placeIds, resetKey }),
  clearPinSelection: () => set(initialState),
}));
