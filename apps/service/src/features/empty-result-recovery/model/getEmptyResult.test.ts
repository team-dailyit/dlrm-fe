import { describe, expect, it } from 'vitest';

import { getEmptyResult } from './getEmptyResult';

describe('getEmptyResult', () => {
  describe('반경 안에 장소가 0곳일 때', () => {
    it('더 넓힐 반경이 있으면 반경을 넓히는 중으로 알려줍니다', () => {
      expect(
        getEmptyResult({ placeCount: 0, categoryPlaceCount: 0, radius: 500 }),
      ).toBe('wideningRadius');
    });

    it('가장 넓은 반경이면 주변에 장소가 없다고 알려줍니다', () => {
      expect(
        getEmptyResult({ placeCount: 0, categoryPlaceCount: 0, radius: 2000 }),
      ).toBe('noPlacesNearby');
    });
  });

  describe('반경 안에 장소가 있을 때', () => {
    it('고른 카테고리로 거른 결과가 0곳이면 고른 카테고리에 맞는 장소가 없다고 알려줍니다', () => {
      expect(
        getEmptyResult({ placeCount: 3, categoryPlaceCount: 0, radius: 500 }),
      ).toBe('noPlacesInCategories');
    });

    it('거른 결과가 있으면 빈 결과가 아니라서 null 을 돌려줍니다', () => {
      expect(
        getEmptyResult({ placeCount: 3, categoryPlaceCount: 1, radius: 500 }),
      ).toBeNull();
    });
  });
});
