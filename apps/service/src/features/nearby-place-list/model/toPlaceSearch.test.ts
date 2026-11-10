import { describe, expect, it } from 'vitest';

import { toPlaceSearch } from './toPlaceSearch';

const NEIGHBORHOOD_ID = 1_000_000_000_001;
const COORDINATES = { lat: 37.5445, lng: 127.0559 };

describe('toPlaceSearch', () => {
  describe('동네 기준일 때', () => {
    it('동네 코드와 반경으로 된 검색 조건을 돌려줍니다', () => {
      const search = toPlaceSearch(
        { type: 'neighborhood', neighborhoodId: NEIGHBORHOOD_ID },
        1000,
      );

      expect(search).toEqual({ neighborhoodId: NEIGHBORHOOD_ID, radius: 1000 });
    });
  });

  describe('현재 위치 기준일 때', () => {
    it('현재 위치 좌표와 반경으로 된 검색 조건을 돌려줍니다', () => {
      const search = toPlaceSearch(
        { type: 'currentLocation', coordinates: COORDINATES },
        500,
      );

      expect(search).toEqual({ coordinates: COORDINATES, radius: 500 });
    });

    it('새로고침 직후처럼 좌표를 아직 얻지 못했으면 검색 조건 없이 null을 돌려줍니다', () => {
      const search = toPlaceSearch(
        { type: 'currentLocation', coordinates: null },
        500,
      );

      expect(search).toBeNull();
    });
  });

  describe('기준점이 없을 때', () => {
    it('검색 조건 없이 null을 돌려줍니다', () => {
      expect(toPlaceSearch(null, 500)).toBeNull();
    });
  });
});
