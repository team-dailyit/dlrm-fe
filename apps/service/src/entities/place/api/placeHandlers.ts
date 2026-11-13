import { http, HttpResponse } from 'msw';

import { toApiUrl } from '@/shared/api';

import type { PlacesResponse } from './placeApi';

export const PLACES_URL = toApiUrl('/places');

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
