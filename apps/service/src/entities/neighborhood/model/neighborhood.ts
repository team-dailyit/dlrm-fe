import type { Coordinates } from '@/shared/model';

export type Neighborhood = {
  neighborhoodId: number;
  name: string;
  coordinates: Coordinates;
  openPlaceCount: number;
};
