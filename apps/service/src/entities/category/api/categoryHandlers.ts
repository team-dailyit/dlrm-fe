import { http, HttpResponse } from 'msw';

import { toApiUrl } from '@/shared/api';

import type { CategoryResponse } from './categoryApi';

// 테스트와 개발 서버(MSW)가 함께 쓰는 카테고리 목록 API 응답 예시다. 백엔드 스펙(GET /categories) 형태를 그대로 따른다
export const CATEGORY_RESPONSES: CategoryResponse[] = [
  {
    id: 5_000_000_000_001,
    name: '전시',
    icon_url: 'https://images.test/category-exhibition.png',
  },
  {
    id: 5_000_000_000_002,
    name: '팝업',
    icon_url: 'https://images.test/category-popup.png',
  },
  {
    id: 5_000_000_000_003,
    name: '소품샵',
    icon_url: 'https://images.test/category-gift-shop.png',
  },
  {
    id: 5_000_000_000_004,
    name: '서점',
    icon_url: 'https://images.test/category-bookstore.png',
  },
  {
    id: 5_000_000_000_005,
    name: '오락',
    icon_url: 'https://images.test/category-arcade.png',
  },
];

export const categoriesHandler = http.get(toApiUrl('/categories'), () =>
  HttpResponse.json(CATEGORY_RESPONSES),
);
