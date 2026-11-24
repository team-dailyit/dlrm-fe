import { describe, expect, it } from 'vitest';

import { toPlaceId } from './toPlaceId';

describe('toPlaceId', () => {
  it('경로의 장소 코드가 정수 표기면 장소 코드로 읽습니다', () => {
    expect(toPlaceId('9000000000101')).toBe(9_000_000_000_101);
  });

  // Number 로는 숫자로 읽히는 1e3 같은 표기도 정수 표기가 아니므로 함께 확인한다
  it.each(['abc', '1e3'])(
    '경로의 장소 코드가 %s 처럼 정수 표기가 아니면 null 을 돌려줍니다',
    (param) => {
      expect(toPlaceId(param)).toBeNull();
    },
  );
});
