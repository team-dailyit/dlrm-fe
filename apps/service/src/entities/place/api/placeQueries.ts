import { queryOptions } from '@tanstack/react-query';

import type { PlaceSearch } from '../model/place';
import { getPlaces } from './placeApi';

// 응답에 지금 영업 중인지(is_open_now)가 들어 있어 계속 캐시해 두면 안 된다. 1분이 지나면 다시 받는다
const PLACE_STALE_TIME_MS = 60 * 1000;

export const placeQueries = {
  all: () => ['places'],

  lists: () => [...placeQueries.all(), 'list'],
  // 검색 조건(동네 또는 좌표, 반경)이 바뀌면 다른 목록으로 보고 새로 받는다
  list: (search: PlaceSearch) =>
    queryOptions({
      queryKey: [...placeQueries.lists(), search],
      queryFn: () => getPlaces(search),
      staleTime: PLACE_STALE_TIME_MS,
    }),
};
