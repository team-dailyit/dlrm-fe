import { beforeEach, describe, expect, it } from 'vitest';

import { mockServer } from '@/shared/testing/mockServer';

import { getCategories } from './categoryApi';
import { categoriesHandler } from './categoryHandlers';

describe('getCategories', () => {
  describe('카테고리 목록을 받았을 때', () => {
    // 카테고리 목록 API 가 응답 예시를 돌려주도록 MSW 핸들러를 등록한다
    beforeEach(() => {
      mockServer.use(categoriesHandler);
    });

    it('카테고리 코드·이름·아이콘 주소로 바꿔 돌려줍니다', async () => {
      const [exhibition] = await getCategories();

      expect(exhibition).toEqual({
        categoryId: 5_000_000_000_001,
        name: '전시',
        iconUrl: 'https://images.test/category-exhibition.png',
      });
    });
  });
});
