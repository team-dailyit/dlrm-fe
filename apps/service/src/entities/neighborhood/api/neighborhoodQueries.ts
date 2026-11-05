import { queryOptions } from '@tanstack/react-query';

import { getNeighborhoodById, getNeighborhoods } from './neighborhoodApi';

// 서비스 동네는 자주 바뀌지 않으므로 화면에 다시 들어와도 새로 받지 않는다
const NEIGHBORHOOD_STALE_TIME = Infinity;

export const neighborhoodQueries = {
  all: () => ['neighborhoods'],

  lists: () => [...neighborhoodQueries.all(), 'list'],
  list: () =>
    queryOptions({
      queryKey: neighborhoodQueries.lists(),
      queryFn: () => getNeighborhoods(),
      staleTime: NEIGHBORHOOD_STALE_TIME,
    }),

  details: () => [...neighborhoodQueries.all(), 'detail'],
  // 동네 코드로 이름과 대표 좌표를 찾는다. 목록에 없는 코드면 null이다
  detail: (neighborhoodId: string) =>
    queryOptions({
      queryKey: [...neighborhoodQueries.details(), neighborhoodId],
      queryFn: () => getNeighborhoodById(neighborhoodId),
      staleTime: NEIGHBORHOOD_STALE_TIME,
    }),
};
