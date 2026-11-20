import type { Place } from '@/entities/place';

/*
 * 출발지는 카카오맵이 사용자의 현재 위치로 정한다.
 * 카카오맵은 장소명에 쉼표(좌표 구분자)나 슬래시(경로 구분자)가 있으면 인코딩해도 길찾기를 열지 못해서 공백으로 바꾼다.
 * 그 밖의 문자는 encodeURIComponent 로 넘긴다. 한글·공백은 브라우저도 같게 인코딩하고, #·? 는 인코딩하지 않으면 주소가 잘린다
 */
export function toKakaoMapDirectionsUrl({
  name,
  coordinates,
}: Pick<Place, 'name' | 'coordinates'>): string {
  const linkName = name.replace(/[,/]/g, ' ').replace(/\s+/g, ' ').trim();

  return `https://map.kakao.com/link/to/${encodeURIComponent(linkName)},${coordinates.lat},${coordinates.lng}`;
}
