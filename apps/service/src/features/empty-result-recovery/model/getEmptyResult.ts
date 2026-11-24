import { getRadiusToWiden, type SearchedPlaceCount } from './getRadiusToWiden';

/*
 * wideningRadius: 반경 안에 장소가 없어 다음 반경으로 넓히는 중이다. 곧 다시 받으므로 화면은 로딩처럼 보여준다
 * noPlacesNearby: 가장 넓은 반경에서도 장소가 없다
 * noPlacesInCategories: 장소는 있지만 고른 카테고리에 맞는 장소가 없다. "전체 보기"로 회복한다
 */
export type EmptyResult =
  'wideningRadius' | 'noPlacesNearby' | 'noPlacesInCategories';

// 장소 목록이 비었을 때 어떤 빈 결과인지 알려준다. 비지 않았으면 null 이다
export function getEmptyResult({
  placeCount,
  categoryPlaceCount,
  radius,
}: SearchedPlaceCount & { categoryPlaceCount: number }): EmptyResult | null {
  if (placeCount === 0) {
    return getRadiusToWiden({ placeCount, radius }) === null
      ? 'noPlacesNearby'
      : 'wideningRadius';
  }
  if (categoryPlaceCount === 0) {
    return 'noPlacesInCategories';
  }

  return null;
}
