import type { Coordinates } from '@/shared/types';

export type Neighborhood = {
  neighborhoodId: string;
  name: string;
  // 대표 좌표는 동네의 역 좌표다
  coordinates: Coordinates;
};
