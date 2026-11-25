import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { mockServer } from '@/shared/testing/mockServer';

import { getPlaceDetail, getPlaces } from './placeApi';
import {
  placeDetailHandler,
  PLACES_RESPONSE,
  PLACES_URL,
} from './placeHandlers';

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
            openTime: null,
            closeTime: null,
          },
          {
            dayOfWeek: 'WED',
            isDayOff: false,
            openTime: '10:00',
            closeTime: '21:00',
          },
          {
            dayOfWeek: 'THU',
            isDayOff: false,
            openTime: '10:00',
            closeTime: '21:00',
          },
          {
            dayOfWeek: 'FRI',
            isDayOff: false,
            openTime: '10:00',
            closeTime: '21:00',
          },
          {
            dayOfWeek: 'SAT',
            isDayOff: false,
            openTime: '10:00',
            closeTime: '21:00',
          },
          {
            dayOfWeek: 'SUN',
            isDayOff: false,
            openTime: '10:00',
            closeTime: '21:00',
          },
        ],
      });
    });
  });
});

describe('getPlaceDetail', () => {
  // 요청한 장소 코드의 상세를 응답하는 MSW 핸들러를 등록한다. 다른 장소가 오면 장소 코드를 잘못 보낸 것이다
  beforeEach(() => {
    mockServer.use(placeDetailHandler);
  });

  // 영업시간 변환은 getPlaces 와 같은 함수를 쓰므로, 상세에만 있는 필드를 중심으로 본다
  it('장소 코드로 상세를 요청하고, 주소·SNS·홈페이지·키워드를 함께 바꿔 돌려줍니다', async () => {
    const placeDetail = await getPlaceDetail(9_000_000_000_101);

    expect(placeDetail).toMatchObject({
      placeId: 9_000_000_000_101,
      name: '슈퍼마리오 스페셜 팝업',
      thumbnailUrl: 'https://images.test/mario.png',
      categoryId: 5_000_000_000_002,
      coordinates: { lat: 37.5445, lng: 127.0559 },
      isOpenNow: true,
      address: '서울 성동구 연무장7길 10',
      snsUrl: 'https://instagram.com/mario.popup',
      homepageUrl: 'https://mario-popup.test',
      keywords: [
        { keywordId: 7_000_000_000_001, name: '팝업스토어' },
        { keywordId: 7_000_000_000_002, name: '가족과함께' },
      ],
    });
  });

  it('SNS·홈페이지가 없는 장소는 null 로, 키워드가 없는 장소는 빈 목록으로 돌려줍니다', async () => {
    const placeDetail = await getPlaceDetail(9_000_000_000_102);

    expect(placeDetail).toMatchObject({
      snsUrl: null,
      homepageUrl: null,
      keywords: [],
    });
  });
});
