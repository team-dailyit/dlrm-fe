import { beforeEach, describe, expect, it } from 'vitest';

import { useSheetStageStore } from './sheetStageStore';

function getState() {
  return useSheetStageStore.getState();
}

// 스토어는 모듈에 하나만 있어서, 테스트끼리 시트 단계가 남지 않도록 처음 상태로 되돌린다
beforeEach(() => {
  getState().reset();
});

describe('useSheetStageStore', () => {
  describe('지도 홈에 처음 들어왔을 때', () => {
    it('시트는 Half에서 시작합니다', () => {
      expect(getState().stage).toBe('half');
    });
  });

  describe('핀을 눌렀을 때', () => {
    it('핀 요약이 보이도록 시트를 Peek로 내립니다', () => {
      getState().selectPin();

      expect(getState().stage).toBe('peek');
    });
  });
});
