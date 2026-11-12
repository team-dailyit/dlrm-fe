import type { PlaceSearch } from '@/entities/place';
import type { ReferencePoint } from '@/entities/reference-point';
import type { Radius } from '@/shared/model';

/**
 * 기준점과 반경으로 장소 검색 조건을 만든다.
 * 아직 장소를 찾을 수 없으면 null 이다. 기준점이 없거나, 새로고침 직후처럼 현재 위치 좌표를 다시 얻기 전인 경우다
 */
export function toPlaceSearch(
  referencePoint: ReferencePoint | null,
  radius: Radius,
): PlaceSearch | null {
  if (referencePoint?.type === 'neighborhood') {
    return { neighborhoodId: referencePoint.neighborhoodId, radius };
  }
  if (
    referencePoint?.type === 'currentLocation' &&
    referencePoint.coordinates
  ) {
    return { coordinates: referencePoint.coordinates, radius };
  }

  return null;
}
