import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useSheetStageStore } from './sheetStageStore';
import { usePlaceDetailSheet } from './usePlaceDetailSheet';

const POPUP_PLACE_ID = 9_000_000_000_101;
const EXHIBITION_PLACE_ID = 9_000_000_000_102;

function getState() {
  return useSheetStageStore.getState();
}

// 장소 상세 화면이 열리면(마운트) 훅이 시작되고, 닫기·뒤로가기로 경로를 벗어나면(언마운트) 끝난다
function openPlaceDetail(placeId: number) {
  return renderHook(({ id }) => usePlaceDetailSheet(id), {
    initialProps: { id: placeId },
  });
}

// 스토어는 모듈에 하나만 있어서, 테스트끼리 시트 단계가 남지 않도록 처음 상태로 되돌린다
beforeEach(() => {
  getState().reset();
});

describe('usePlaceDetailSheet', () => {
  describe('장소 상세가 열렸을 때', () => {
    it.each(['peek', 'full'] as const)(
      '%s 단계에서 열어도 상세가 보이도록 시트를 Half로 맞춥니다',
      (stage) => {
        getState().setStage(stage);

        openPlaceDetail(POPUP_PLACE_ID);

        expect(getState().stage).toBe('half');
      },
    );
  });

  describe('장소 상세가 닫혔을 때', () => {
    it('Full로 펼쳐 둔 목록에서 열었으면 Full로 돌아갑니다', () => {
      getState().setStage('full');
      const { unmount } = openPlaceDetail(POPUP_PLACE_ID);

      unmount();

      expect(getState().stage).toBe('full');
    });

    it('상세를 Full로 펼쳤다 닫아도 상세를 열기 전 단계로 돌아갑니다', () => {
      getState().selectPin();
      const { unmount } = openPlaceDetail(POPUP_PLACE_ID);
      getState().setStage('full');

      unmount();

      expect(getState().stage).toBe('peek');
    });

    it('공유 링크로 바로 들어와 열었으면 목록 Half로 돌아갑니다', () => {
      const { unmount } = openPlaceDetail(POPUP_PLACE_ID);
      getState().setStage('full');

      unmount();

      expect(getState().stage).toBe('half');
    });
  });

  describe('상세가 열린 채 핀 요약에서 다른 장소를 골랐을 때', () => {
    // 목록에서 상세를 연 뒤, 지도 핀을 눌러 핀 요약(Peek)에서 다른 장소를 고른다
    function selectOtherPlaceFromPinSummary() {
      const detail = openPlaceDetail(POPUP_PLACE_ID);
      getState().selectPin();
      detail.rerender({ id: EXHIBITION_PLACE_ID });
      return detail;
    }

    it('새 장소 상세를 Half로 엽니다', () => {
      selectOtherPlaceFromPinSummary();

      expect(getState().stage).toBe('half');
    });

    it('닫으면 핀 요약(Peek)으로 돌아갑니다', () => {
      const { unmount } = selectOtherPlaceFromPinSummary();

      unmount();

      expect(getState().stage).toBe('peek');
    });
  });
});
