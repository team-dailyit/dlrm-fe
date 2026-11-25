import type { Coordinates } from '@/shared/model';

// 지구를 반지름 6,371km 구로 볼 때 위도 1도의 거리(m)다. 경도 1도는 여기에 cos(위도)를 곱한 거리다
const METERS_PER_LAT_DEGREE = (6_371_000 * Math.PI) / 180;

// 카카오맵 setBounds 에 넘길 남서·북동 좌표다
export type CoordinatesBounds = {
  southWest: Coordinates;
  northEast: Coordinates;
};

// 기준점을 가운데 두고 반경 원이 화면에 들어오도록 지도를 맞출 범위를 구한다
export function toRadiusBounds(
  center: Coordinates,
  radiusMeters: number,
): CoordinatesBounds {
  const latDelta = radiusMeters / METERS_PER_LAT_DEGREE;
  const lngDelta =
    radiusMeters /
    (METERS_PER_LAT_DEGREE * Math.cos((center.lat * Math.PI) / 180));

  return {
    southWest: { lat: center.lat - latDelta, lng: center.lng - lngDelta },
    northEast: { lat: center.lat + latDelta, lng: center.lng + lngDelta },
  };
}

// 숫자 핀을 눌렀을 때 묶인 장소들이 모두 화면에 들어오도록 확대할 범위를 구한다
export function toCoordinatesBounds(
  coordinatesList: readonly Coordinates[],
): CoordinatesBounds {
  const lats = coordinatesList.map(({ lat }) => lat);
  const lngs = coordinatesList.map(({ lng }) => lng);

  return {
    southWest: { lat: Math.min(...lats), lng: Math.min(...lngs) },
    northEast: { lat: Math.max(...lats), lng: Math.max(...lngs) },
  };
}
