import { apiClient } from '@/shared/api';

import type { Neighborhood } from '../model/neighborhood';

// GET /neighborhoods 응답 항목. 서버가 id 오름차순으로 정렬해 준다
export type NeighborhoodResponse = {
  id: number;
  station_name: string;
  lat: number;
  lng: number;
  open_place_count: number;
};

function toNeighborhood({
  id,
  station_name,
  lat,
  lng,
  open_place_count,
}: NeighborhoodResponse): Neighborhood {
  return {
    neighborhoodId: id,
    name: station_name,
    coordinates: { lat, lng },
    openPlaceCount: open_place_count,
  };
}

export async function getNeighborhoods(): Promise<Neighborhood[]> {
  const neighborhoods =
    await apiClient.get<NeighborhoodResponse[]>('/neighborhoods');

  return neighborhoods.map(toNeighborhood);
}
