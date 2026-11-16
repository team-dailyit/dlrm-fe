import type { Place } from '@/entities/place';

// 출발지는 카카오맵이 사용자의 현재 위치로 정한다. 쉼표가 장소명·좌표 구분자라 장소명은 인코딩한다
export function toKakaoMapDirectionsUrl({
  name,
  coordinates,
}: Pick<Place, 'name' | 'coordinates'>): string {
  return `https://map.kakao.com/link/to/${encodeURIComponent(name)},${coordinates.lat},${coordinates.lng}`;
}
