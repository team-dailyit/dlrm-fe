const METERS_PER_KILOMETER = 1000;

// 1km 미만은 m 로, 1km 이상은 km 소수 한 자리로 표기한다. km 는 반올림하지 않고 100m 미만을 버린다(1375m → 1.3km)
export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < METERS_PER_KILOMETER) {
    return `${distanceMeters}m`;
  }
  // 100m 단위로 버린 뒤 km 로 바꾼다. 정수를 10으로 나누므로 소수 오차 없이 한 자리로 떨어진다
  const kilometers = Math.floor(distanceMeters / 100) / 10;

  return `${kilometers}km`;
}
