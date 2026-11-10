import type { Coordinates, Radius } from '@/shared/types';

export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export type OperatingHour = {
  dayOfWeek: DayOfWeek;
  isDayOff: boolean;
  // "10:00" 형식
  openTime: string;
  closeTime: string;
};

export type Place = {
  placeId: number;
  name: string;
  thumbnailUrl: string;
  categoryId: number;
  coordinates: Coordinates;
  // 서버가 기준점에서 계산한 직선 거리(m)
  distanceMeters: number;
  // 서버 기준 지금 영업 중인지
  isOpenNow: boolean;
  operatingHours: OperatingHour[];
};

// 장소 검색 조건. 동네 기준이면 동네 코드로, 현재 위치 기준이면 좌표로 찾는다
export type PlaceSearch =
  | { neighborhoodId: number; radius: Radius }
  | { coordinates: Coordinates; radius: Radius };
