import type { Coordinates } from '@/shared/types';

export type Neighborhood = {
  neighborhoodId: number;
  // 동네 이름은 그 동네 지하철역 이름이다
  name: string;
  // 대표 좌표는 동네의 역 좌표다
  coordinates: Coordinates;
  // 서버 기준 지금 열려 있는 장소 수
  openPlaceCount: number;
};
