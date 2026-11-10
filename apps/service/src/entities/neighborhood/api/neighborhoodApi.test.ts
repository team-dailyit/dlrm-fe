import { beforeEach, describe, expect, it } from 'vitest';

import { mockServer } from '@/shared/testing/mockServer';

import { getNeighborhoods } from './neighborhoodApi';
import { neighborhoodsHandler } from './neighborhoodHandlers';

describe('getNeighborhoods', () => {
  describe('동네 목록을 받았을 때', () => {
    beforeEach(() => {
      mockServer.use(neighborhoodsHandler);
    });

    it('동네 코드·이름·대표 좌표·열린 장소 수로 바꿔 돌려줍니다', async () => {
      const [seongsu] = await getNeighborhoods();

      expect(seongsu).toEqual({
        neighborhoodId: 1_000_000_000_001,
        name: '성수',
        coordinates: { lat: 37.5445, lng: 127.0559 },
        openPlaceCount: 136,
      });
    });
  });
});
