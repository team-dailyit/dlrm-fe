import { create } from 'zustand';

type NeighborhoodNoticeState = {
  isDismissed: boolean;
};

type NeighborhoodNoticeActions = {
  dismiss: () => void;
};

/*
 * 동네 기준 안내를 닫았는지. 지도 홈을 벗어났다 돌아와도 이번 방문 동안은 닫은 채로 두려고 컴포넌트 밖 스토어에 둔다.
 * 새로고침하면 다시 보여줘야 해서 persist 하지 않는다
 */
export const useNeighborhoodNoticeStore = create<
  NeighborhoodNoticeState & NeighborhoodNoticeActions
>()((set) => ({
  isDismissed: false,
  dismiss: () => set({ isDismissed: true }),
}));
