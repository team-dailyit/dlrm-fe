import { beforeEach, describe, expect, it } from 'vitest';

import { useCategoryFilterStore } from './categoryFilterStore';

const EXHIBITION = 5_000_000_000_001;
const POPUP = 5_000_000_000_002;

function getState() {
  return useCategoryFilterStore.getState();
}

// 스토어는 모듈에 하나만 있어서, 테스트끼리 고른 카테고리가 남지 않도록 비운다
beforeEach(() => {
  getState().clearCategories();
});

describe('useCategoryFilterStore', () => {
  describe('처음 열었을 때', () => {
    it('고른 카테고리 없이 시작합니다', () => {
      expect(getState().selectedCategoryIds).toEqual([]);
    });
  });

  describe('칩을 눌렀을 때', () => {
    it('누른 카테고리를 고른 목록에 더합니다', () => {
      getState().toggleCategory(EXHIBITION);
      getState().toggleCategory(POPUP);

      expect(getState().selectedCategoryIds).toEqual([EXHIBITION, POPUP]);
    });

    it('이미 고른 카테고리를 다시 누르면 고른 목록에서 뺍니다', () => {
      getState().toggleCategory(EXHIBITION);
      getState().toggleCategory(POPUP);
      getState().toggleCategory(EXHIBITION);

      expect(getState().selectedCategoryIds).toEqual([POPUP]);
    });
  });

  describe('전체 보기를 눌렀을 때', () => {
    it('고른 카테고리를 모두 풉니다', () => {
      getState().toggleCategory(EXHIBITION);
      getState().toggleCategory(POPUP);

      getState().clearCategories();

      expect(getState().selectedCategoryIds).toEqual([]);
    });
  });
});
