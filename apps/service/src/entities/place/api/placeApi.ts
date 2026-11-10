import { apiClient } from '@/shared/api';

import type {
  DayOfWeek,
  OperatingHour,
  Place,
  PlaceSearch,
} from '../model/place';

type OperatingHourResponse = {
  day_of_week: DayOfWeek;
  is_day_off: boolean;
  open_time: string;
  close_time: string;
};

type PlaceResponse = {
  id: number;
  name: string;
  thumbnail_url: string;
  category_id: number;
  lat: number;
  lng: number;
  distance_m: number;
  is_open_now: boolean;
  operating_hours: OperatingHourResponse[];
};

// GET /places 응답. 서버가 distance_m 오름차순(가까운 순)으로 정렬해 준다
export type PlacesResponse = {
  places: PlaceResponse[];
};

// 스펙상 lat/lng 와 neighborhood_id 중 하나만 보낸다
function toPlacesParams(search: PlaceSearch) {
  if ('neighborhoodId' in search) {
    return { neighborhood_id: search.neighborhoodId, radius: search.radius };
  }
  const { coordinates, radius } = search;

  return { lat: coordinates.lat, lng: coordinates.lng, radius };
}

function toOperatingHour({
  day_of_week,
  is_day_off,
  open_time,
  close_time,
}: OperatingHourResponse): OperatingHour {
  return {
    dayOfWeek: day_of_week,
    isDayOff: is_day_off,
    openTime: open_time,
    closeTime: close_time,
  };
}

function toPlace({
  id,
  name,
  thumbnail_url,
  category_id,
  lat,
  lng,
  distance_m,
  is_open_now,
  operating_hours,
}: PlaceResponse): Place {
  return {
    placeId: id,
    name,
    thumbnailUrl: thumbnail_url,
    categoryId: category_id,
    coordinates: { lat, lng },
    distanceMeters: distance_m,
    isOpenNow: is_open_now,
    operatingHours: operating_hours.map(toOperatingHour),
  };
}

export async function getPlaces(search: PlaceSearch): Promise<Place[]> {
  const { places } = await apiClient.get<PlacesResponse>(
    '/places',
    toPlacesParams(search),
  );

  return places.map(toPlace);
}
