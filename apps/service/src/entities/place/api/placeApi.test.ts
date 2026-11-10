import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { mockServer } from '@/shared/testing/mockServer';

import { getPlaces } from './placeApi';
import { PLACES_RESPONSE, PLACES_URL } from './placeHandlers';

const NEIGHBORHOOD_ID = 1_000_000_000_001;
const COORDINATES = { lat: 37.5445, lng: 127.0559 };

let requestedParams: URLSearchParams | null;

// 어떤 쿼리 파라미터로 요청했는지 확인할 수 있도록, 요청을 기록하고 장소 목록을 응답하는 MSW 핸들러를 등록합니다
beforeEach(() => {
  requestedParams = null;
  mockServer.use(
    http.get(PLACES_URL, ({ request }) => {
      requestedParams = new URL(request.url).searchParams;
      return HttpResponse.json(PLACES_RESPONSE);
    }),
  );
});

describe('getPlaces', () => {
  describe('동네 기준으로 조회할 때', () => {
    it('동네 코드와 반경만 보내고 좌표는 보내지 않습니다', async () => {
      await getPlaces({ neighborhoodId: NEIGHBORHOOD_ID, radius: 1000 });

      expect(Object.fromEntries(requestedParams ?? [])).toEqual({
        neighborhood_id: String(NEIGHBORHOOD_ID),
        radius: '1000',
      });
    });
  });

  describe('현재 위치 기준으로 조회할 때', () => {
    it('위도·경도와 반경만 보내고 동네 코드는 보내지 않습니다', async () => {
      await getPlaces({ coordinates: COORDINATES, radius: 500 });

      expect(Object.fromEntries(requestedParams ?? [])).toEqual({
        lat: String(COORDINATES.lat),
        lng: String(COORDINATES.lng),
        radius: '500',
      });
    });
  });

  describe('장소 목록을 받았을 때', () => {
    it('장소 코드·이름·썸네일·카테고리·좌표·거리·영업 정보로 바꿔 돌려줍니다', async () => {
      const [place] = await getPlaces({
        neighborhoodId: NEIGHBORHOOD_ID,
        radius: 500,
      });

      expect(place).toEqual({
        placeId: 9_000_000_000_101,
        name: '슈퍼마리오 스페셜 팝업',
        thumbnailUrl: 'https://images.test/mario.png',
        categoryId: 5_000_000_000_002,
        coordinates: { lat: 37.5445, lng: 127.0559 },
        distanceMeters: 320,
        isOpenNow: true,
        operatingHours: [
          {
            dayOfWeek: 'MON',
            isDayOff: false,
            openTime: '10:00',
            closeTime: '21:00',
          },
          {
            dayOfWeek: 'TUE',
            isDayOff: true,
            openTime: '10:00',
            closeTime: '21:00',
          },
        ],
      });
    });
  });
});
