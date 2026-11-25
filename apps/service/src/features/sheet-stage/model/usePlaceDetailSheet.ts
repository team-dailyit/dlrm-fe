import { useEffect } from 'react';

import { useSheetStageStore } from './sheetStageStore';

/**
 * 장소 상세가 열려 있는 동안 시트를 Half 로 올리고, 닫히면 열기 전 단계로 돌려놓는다.
 * 닫기 버튼·뒤로가기·공유 링크 진입을 따로 다루지 않도록 장소 상세 화면이 마운트될 때 호출한다
 */
export function usePlaceDetailSheet(placeId: number) {
  // 상세가 열린 채 다른 장소로 바뀌면 화면이 다시 마운트되지 않으므로, 장소마다 그때의 단계를 기억하고 다시 연다
  useEffect(() => {
    useSheetStageStore.getState().openPlaceDetail();
  }, [placeId]);

  // 닫을 때는 마지막으로 연 장소의 열기 전 단계로 돌아간다
  useEffect(() => useSheetStageStore.getState().closePlaceDetail, []);
}
