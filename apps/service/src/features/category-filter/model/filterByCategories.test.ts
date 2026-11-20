import { describe, expect, it } from 'vitest';

import { filterByCategories } from './filterByCategories';

const EXHIBITION = 5_000_000_000_001;
const POPUP = 5_000_000_000_002;
const BOOKSTORE = 5_000_000_000_004;

// 서버가 가까운 순으로 준 장소 목록이다
const NEARBY_PLACES = [
  { placeId: 1, categoryId: POPUP },
  { placeId: 2, categoryId: BOOKSTORE },
  { placeId: 3, categoryId: EXHIBITION },
  { placeId: 4, categoryId: POPUP },
];

describe('filterByCategories', () => {
  describe('고른 카테고리가 없을 때', () => {
    it('장소를 거르지 않고 전부 돌려줍니다', () => {
      expect(filterByCategories(NEARBY_PLACES, [])).toEqual(NEARBY_PLACES);
    });
  });

  describe('카테고리를 여러 개 골랐을 때', () => {
    it('고른 카테고리 중 하나에 속한 장소만 가까운 순서 그대로 돌려줍니다', () => {
      const filtered = filterByCategories(NEARBY_PLACES, [EXHIBITION, POPUP]);

      expect(filtered.map(({ placeId }) => placeId)).toEqual([1, 3, 4]);
    });
  });
});
