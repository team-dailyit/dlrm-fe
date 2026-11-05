import { describe, expect, it } from 'vitest';

import { getNeighborhoodById } from './neighborhoodApi';

describe('getNeighborhoodById', () => {
  describe('서비스 동네 코드가 주어졌을 때', () => {
    it('그 동네의 이름과 대표 좌표를 돌려줍니다', async () => {
      const neighborhood = await getNeighborhoodById('seongsu');

      expect(neighborhood).toEqual({
        neighborhoodId: 'seongsu',
        name: '성수',
        coordinates: { lat: 37.5445, lng: 127.056 },
      });
    });
  });

  describe('없는 동네 코드가 주어졌을 때', () => {
    it('null을 돌려줍니다', async () => {
      const neighborhood = await getNeighborhoodById('unknown');

      expect(neighborhood).toBeNull();
    });
  });
});
