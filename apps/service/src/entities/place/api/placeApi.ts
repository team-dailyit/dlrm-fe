import { apiClient } from '@/shared/api';

import type {
  DayOfWeek,
  OperatingHour,
  Place,
  PlaceDetail,
  PlaceKeyword,
  PlaceSearch,
} from '../model/place';

type OperatingHourResponse = {
  day_of_week: DayOfWeek;
  is_day_off: boolean;
  open_time: string | null;
  close_time: string | null;
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

type PlaceKeywordResponse = {
  id: number;
  name: string;
};

// GET /places/{id} 응답
export type PlaceDetailResponse = Omit<PlaceResponse, 'distance_m'> & {
  address: string;
  sns_url: string | null;
  homepage_url: string | null;
  keywords: PlaceKeywordResponse[];
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

// 목록과 상세 응답에 함께 있는 필드를 바꾼다. 한쪽만 고쳐 둘이 달라지지 않도록 같이 쓴다
function toPlaceBase({
  id,
  name,
  thumbnail_url,
  category_id,
  lat,
  lng,
  is_open_now,
  operating_hours,
}: Omit<PlaceResponse, 'distance_m'>): Omit<Place, 'distanceMeters'> {
  return {
    placeId: id,
    name,
    thumbnailUrl: thumbnail_url,
    categoryId: category_id,
    coordinates: { lat, lng },
    isOpenNow: is_open_now,
    operatingHours: operating_hours.map(toOperatingHour),
  };
}

function toPlace(response: PlaceResponse): Place {
  return { ...toPlaceBase(response), distanceMeters: response.distance_m };
}

function toPlaceKeyword({ id, name }: PlaceKeywordResponse): PlaceKeyword {
  return { keywordId: id, name };
}

function toPlaceDetail(response: PlaceDetailResponse): PlaceDetail {
  const { address, sns_url, homepage_url, keywords } = response;

  return {
    ...toPlaceBase(response),
    address,
    snsUrl: sns_url,
    homepageUrl: homepage_url,
    keywords: keywords.map(toPlaceKeyword),
  };
}

export async function getPlaceDetail(placeId: number): Promise<PlaceDetail> {
  const response = await apiClient.get<PlaceDetailResponse>(
    `/places/${placeId}`,
  );

  return toPlaceDetail(response);
}

export async function getPlaces(search: PlaceSearch): Promise<Place[]> {
  const { places } = await apiClient.get<PlacesResponse>(
    '/places',
    toPlacesParams(search),
  );

  return places.map(toPlace);
}
