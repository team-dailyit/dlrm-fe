import { queryOptions } from '@tanstack/react-query';

import { getCategories } from './categoryApi';

// 카테고리는 운영 중에 거의 바뀌지 않아 장소 목록(1분)보다 길게 캐시한다
const CATEGORY_STALE_TIME_MS = 60 * 60 * 1000;

export const categoryQueries = {
  all: () => ['categories'],

  lists: () => [...categoryQueries.all(), 'list'],
  list: () =>
    queryOptions({
      queryKey: categoryQueries.lists(),
      queryFn: () => getCategories(),
      staleTime: CATEGORY_STALE_TIME_MS,
    }),
};
