import { http, HttpResponse } from 'msw';

import { toApiUrl } from '@/shared/api';

import type { NeighborhoodResponse } from './neighborhoodApi';

// 테스트와 개발 서버(MSW)가 함께 쓰는 동네 API 응답 예시다. 백엔드 스펙(GET /neighborhoods) 형태를 그대로 따른다
export const NEIGHBORHOOD_RESPONSES: NeighborhoodResponse[] = [
  {
    id: 1_000_000_000_001,
    station_name: '성수',
    lat: 37.5445,
    lng: 127.0559,
    open_place_count: 136,
  },
  {
    id: 1_000_000_000_002,
    station_name: '강남',
    lat: 37.4979,
    lng: 127.0276,
    open_place_count: 98,
  },
  {
    id: 1_000_000_000_003,
    station_name: '안국',
    lat: 37.5765,
    lng: 126.9854,
    open_place_count: 54,
  },
  {
    id: 1_000_000_000_004,
    station_name: '홍대',
    lat: 37.5572,
    lng: 126.9245,
    open_place_count: 121,
  },
];

export const neighborhoodsHandler = http.get(toApiUrl('/neighborhoods'), () =>
  HttpResponse.json(NEIGHBORHOOD_RESPONSES),
);
