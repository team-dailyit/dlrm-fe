import { describe, expect, it } from 'vitest';

import { getRadiusToWiden } from './getRadiusToWiden';

describe('getRadiusToWiden', () => {
  it('받은 장소가 0곳이면 한 단계 넓은 반경을 돌려줍니다', () => {
    expect(getRadiusToWiden({ placeCount: 0, radius: 500 })).toBe(1000);
  });

  it('가장 넓은 반경(2km)이면 더 넓힐 수 없어 null 을 돌려줍니다', () => {
    expect(getRadiusToWiden({ placeCount: 0, radius: 2000 })).toBeNull();
  });

  it('받은 장소가 있으면 넓히지 않아 null 을 돌려줍니다', () => {
    expect(getRadiusToWiden({ placeCount: 3, radius: 500 })).toBeNull();
  });
});
