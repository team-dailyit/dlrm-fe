import { describe, expect, it } from 'vitest';

import { formatDistance } from './formatDistance';

describe('formatDistance', () => {
  it('1km 미만이면 m 로 표기합니다', () => {
    expect(formatDistance(320)).toBe('320m');
  });

  // m 와 km 가 바뀌는 경계다
  it('정확히 1km 이면 km 로 표기합니다', () => {
    expect(formatDistance(1000)).toBe('1km');
  });

  // 반올림하면 1.4km 가 되는 거리로, 100m 미만을 버리는지 확인한다
  it('1km 이상이면 100m 미만을 버리고 km 소수 한 자리로 표기합니다', () => {
    expect(formatDistance(1375)).toBe('1.3km');
  });

  it('km 소수 자리가 0이면 빼고 표기합니다', () => {
    expect(formatDistance(2000)).toBe('2km');
  });
});
