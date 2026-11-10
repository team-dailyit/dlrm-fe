import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { createQueryClient } from '@/shared/api';
import { mockServer } from '@/shared/testing/mockServer';

import { PLACES_RESPONSE, PLACES_URL } from './placeHandlers';
import { placeQueries } from './placeQueries';

const NEIGHBORHOOD_ID = 1_000_000_000_001;

let requestedRadiuses: string[];

// 요청이 몇 번, 어떤 반경으로 나갔는지 확인할 수 있도록 요청을 기록하고 장소 목록을 응답하는 MSW 핸들러를 등록합니다
beforeEach(() => {
  requestedRadiuses = [];
  mockServer.use(
    http.get(PLACES_URL, ({ request }) => {
      requestedRadiuses.push(
        new URL(request.url).searchParams.get('radius') ?? '',
      );
      return HttpResponse.json(PLACES_RESPONSE);
    }),
  );
});

describe('placeQueries.list', () => {
  describe('검색 조건이 바뀌었을 때', () => {
    it('이전 목록을 재사용하지 않고 새 조건으로 다시 요청합니다', async () => {
      const queryClient = createQueryClient();

      await queryClient.fetchQuery(
        placeQueries.list({ neighborhoodId: NEIGHBORHOOD_ID, radius: 500 }),
      );
      await queryClient.fetchQuery(
        placeQueries.list({ neighborhoodId: NEIGHBORHOOD_ID, radius: 1000 }),
      );

      expect(requestedRadiuses).toEqual(['500', '1000']);
    });
  });

  describe('같은 검색 조건으로 다시 읽을 때', () => {
    it('staleTime 안에는 받아 둔 목록을 쓰고 다시 요청하지 않습니다', async () => {
      const queryClient = createQueryClient();

      await queryClient.fetchQuery(
        placeQueries.list({ neighborhoodId: NEIGHBORHOOD_ID, radius: 500 }),
      );
      await queryClient.fetchQuery(
        placeQueries.list({ neighborhoodId: NEIGHBORHOOD_ID, radius: 500 }),
      );

      expect(requestedRadiuses).toEqual(['500']);
    });
  });
});
