import { queryOptions } from '@tanstack/react-query';

import { getNeighborhoods } from './neighborhoodApi';

// 응답에 지금 열려 있는 장소 수가 들어 있어 계속 캐시해 두면 안 된다. 1분이 지나면 화면에 다시 들어올 때 새로 받는다
const NEIGHBORHOOD_STALE_TIME_MS = 60 * 1000;

export const neighborhoodQueries = {
  all: () => ['neighborhoods'],

  lists: () => [...neighborhoodQueries.all(), 'list'],
  list: () =>
    queryOptions({
      queryKey: neighborhoodQueries.lists(),
      queryFn: () => getNeighborhoods(),
      staleTime: NEIGHBORHOOD_STALE_TIME_MS,
    }),
};
