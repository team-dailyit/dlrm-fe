import { type Radius, RADIUS_OPTIONS } from '@/shared/model';

// 어느 반경으로 장소를 몇 곳 받았는지. 받은 장소 수만으로는 어느 반경의 결과인지 알 수 없어 함께 다닌다
export type SearchedPlaceCount = {
  placeCount: number;
  radius: Radius;
};

// 받은 장소가 0곳이면 넓힐 다음 반경을 돌려준다. 장소가 있거나 가장 넓은 반경이면 null 이다
export function getRadiusToWiden({
  placeCount,
  radius,
}: SearchedPlaceCount): Radius | null {
  if (placeCount > 0) {
    return null;
  }

  return RADIUS_OPTIONS[RADIUS_OPTIONS.indexOf(radius) + 1] ?? null;
}
