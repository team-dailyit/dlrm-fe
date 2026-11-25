import { describe, expect, it } from 'vitest';

import { ApiError, isNotFoundError } from './errors';

describe('isNotFoundError', () => {
  it('서버가 404 를 주면 찾을 수 없는 오류로 봅니다', () => {
    expect(isNotFoundError(new ApiError(404, 'Not Found', 'NOT_FOUND'))).toBe(
      true,
    );
  });

  it('404 가 아닌 서버 오류는 찾을 수 없는 오류로 보지 않습니다', () => {
    expect(
      isNotFoundError(new ApiError(500, 'Server Error', 'INTERNAL_ERROR')),
    ).toBe(false);
  });
});
