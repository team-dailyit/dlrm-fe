import type { Coordinates } from '@/shared/types';

export type Neighborhood = {
  neighborhoodId: number;
  name: string;
  coordinates: Coordinates;
  openPlaceCount: number;
};
