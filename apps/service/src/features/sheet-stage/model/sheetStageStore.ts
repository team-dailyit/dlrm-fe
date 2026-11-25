import { create } from 'zustand';

import type { SheetStage } from './sheetStage';

type SheetStageState = {
  stage: SheetStage;
  // 장소 상세를 닫을 때 돌아갈 단계. 상세를 열 때의 단계를 기억해 둔다
  stageBeforeDetail: SheetStage;
};

type SheetStageActions = {
  setStage: (stage: SheetStage) => void;
  selectPin: () => void;
  openPlaceDetail: () => void;
  closePlaceDetail: () => void;
  reset: () => void;
};

const initialState: SheetStageState = {
  stage: 'half',
  stageBeforeDetail: 'half',
};

/*
 * 지도 홈과 그 위에 겹쳐 열리는 장소 상세(Outlet)가 같은 시트를 쓰므로 스토어 하나에 둔다.
 * 새로고침하면 다시 Half 로 시작해야 해서 persist 하지 않는다
 */
export const useSheetStageStore = create<SheetStageState & SheetStageActions>()(
  (set) => ({
    ...initialState,
    setStage: (stage) => set({ stage }),
    // 핀 요약이 보이도록 시트를 내린다
    selectPin: () => set({ stage: 'peek' }),
    openPlaceDetail: () =>
      set(({ stage }) => ({ stageBeforeDetail: stage, stage: 'half' })),
    closePlaceDetail: () =>
      set(({ stageBeforeDetail }) => ({ stage: stageBeforeDetail })),
    reset: () => set(initialState),
  }),
);
