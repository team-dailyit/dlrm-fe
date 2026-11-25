import { describe, expect, it } from 'vitest';

import { toCoordinatesBounds, toRadiusBounds } from './mapBounds';

// 성수역 부근 좌표다
const SEONGSU = { lat: 37.5446, lng: 127.0559 };

describe('toRadiusBounds', () => {
  it('기준점을 가운데 두고 반경 원을 감싸는 남서·북동 좌표를 돌려줍니다', () => {
    // 위도 1도는 약 111.2km, 경도 1도는 그 값에 cos(위도)를 곱한 약 88.2km 다
    const bounds = toRadiusBounds(SEONGSU, 500);

    expect(bounds.southWest.lat).toBeCloseTo(37.5401, 4);
    expect(bounds.northEast.lat).toBeCloseTo(37.5491, 4);
    expect(bounds.southWest.lng).toBeCloseTo(127.0502, 4);
    expect(bounds.northEast.lng).toBeCloseTo(127.0616, 4);
  });
});

describe('toCoordinatesBounds', () => {
  it('숫자 핀에 묶인 장소 좌표를 모두 감싸는 남서·북동 좌표를 돌려줍니다', () => {
    const bounds = toCoordinatesBounds([
      { lat: 37.545, lng: 127.057 },
      { lat: 37.543, lng: 127.059 },
      { lat: 37.546, lng: 127.056 },
    ]);

    expect(bounds).toEqual({
      southWest: { lat: 37.543, lng: 127.056 },
      northEast: { lat: 37.546, lng: 127.059 },
    });
  });
});
