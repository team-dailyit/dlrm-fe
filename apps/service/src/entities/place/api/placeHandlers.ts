import { http, HttpResponse } from 'msw';

import { toApiUrl } from '@/shared/api';

import type { PlaceDetailResponse, PlacesResponse } from './placeApi';

export const PLACES_URL = toApiUrl('/places');
export const PLACE_DETAIL_URL = toApiUrl('/places/:id');

// 테스트와 개발 서버(MSW)가 함께 쓰는 장소 목록 API 응답 예시다. 백엔드 스펙(GET /places) 형태를 그대로 따르고, 서버가 가까운 순으로 정렬해 주고, operating_hours 는 항상 월~일 7개를 준다
export const PLACES_RESPONSE: PlacesResponse = {
  places: [
    {
      id: 9_000_000_000_101,
      name: '슈퍼마리오 스페셜 팝업',
      thumbnail_url: 'https://images.test/mario.png',
      category_id: 5_000_000_000_002,
      lat: 37.5445,
      lng: 127.0559,
      distance_m: 320,
      is_open_now: true,
      operating_hours: [
        {
          day_of_week: 'MON',
          is_day_off: false,
          open_time: '10:00',
          close_time: '21:00',
        },
        {
          day_of_week: 'TUE',
          is_day_off: true,
          open_time: null,
          close_time: null,
        },
        {
          day_of_week: 'WED',
          is_day_off: false,
          open_time: '10:00',
          close_time: '21:00',
        },
        {
          day_of_week: 'THU',
          is_day_off: false,
          open_time: '10:00',
          close_time: '21:00',
        },
        {
          day_of_week: 'FRI',
          is_day_off: false,
          open_time: '10:00',
          close_time: '21:00',
        },
        {
          day_of_week: 'SAT',
          is_day_off: false,
          open_time: '10:00',
          close_time: '21:00',
        },
        {
          day_of_week: 'SUN',
          is_day_off: false,
          open_time: '10:00',
          close_time: '21:00',
        },
      ],
    },
    {
      id: 9_000_000_000_102,
      name: '성수 독립서점',
      thumbnail_url: 'https://images.test/bookstore.png',
      category_id: 5_000_000_000_004,
      lat: 37.5431,
      lng: 127.0548,
      distance_m: 480,
      is_open_now: false,
      operating_hours: [
        {
          day_of_week: 'MON',
          is_day_off: true,
          open_time: null,
          close_time: null,
        },
        {
          day_of_week: 'TUE',
          is_day_off: false,
          open_time: '12:00',
          close_time: '20:00',
        },
        {
          day_of_week: 'WED',
          is_day_off: false,
          open_time: '12:00',
          close_time: '20:00',
        },
        {
          day_of_week: 'THU',
          is_day_off: false,
          open_time: '12:00',
          close_time: '20:00',
        },
        {
          day_of_week: 'FRI',
          is_day_off: false,
          open_time: '12:00',
          close_time: '20:00',
        },
        {
          day_of_week: 'SAT',
          is_day_off: false,
          open_time: '12:00',
          close_time: '20:00',
        },
        {
          day_of_week: 'SUN',
          is_day_off: false,
          open_time: '12:00',
          close_time: '20:00',
        },
      ],
    },
  ],
};

export const placesHandler = http.get(PLACES_URL, () =>
  HttpResponse.json(PLACES_RESPONSE),
);

// 장소 목록 예시의 두 장소에 상세 정보를 더한 응답(GET /places/{id})이다. 두 번째 장소는 SNS·홈페이지·키워드가 없는 경우다
const [MARIO_POPUP, BOOKSTORE] = PLACES_RESPONSE.places.map(
  ({
    id,
    name,
    thumbnail_url,
    category_id,
    lat,
    lng,
    is_open_now,
    operating_hours,
  }) => ({
    id,
    name,
    thumbnail_url,
    category_id,
    lat,
    lng,
    is_open_now,
    operating_hours,
  }),
);
export const PLACE_DETAIL_RESPONSES: PlaceDetailResponse[] = [
  {
    ...MARIO_POPUP,
    address: '서울 성동구 연무장7길 10',
    sns_url: 'https://instagram.com/mario.popup',
    homepage_url: 'https://mario-popup.test',
    keywords: [
      { id: 7_000_000_000_001, name: '팝업스토어' },
      { id: 7_000_000_000_002, name: '가족과함께' },
    ],
  },
  {
    ...BOOKSTORE,
    address: '서울 성동구 성수이로 20',
    sns_url: null,
    homepage_url: null,
    keywords: [],
  },
];

// 없는 장소 코드면 서버처럼 404 를 준다
export const placeDetailHandler = http.get(PLACE_DETAIL_URL, ({ params }) => {
  const placeDetail = PLACE_DETAIL_RESPONSES.find(
    ({ id }) => String(id) === params.id,
  );

  return placeDetail
    ? HttpResponse.json(placeDetail)
    : new HttpResponse(null, { status: 404 });
});
