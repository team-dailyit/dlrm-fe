import { describe, expect, it } from 'vitest';

import { ApiError, NetworkError } from './errors';
import { getRetryDelay, MAX_RETRY_COUNT, shouldRetry } from './retryPolicy';

describe('retryPolicy', () => {
  describe('shouldRetry', () => {
    describe(`실패 횟수가 ${MAX_RETRY_COUNT}회 미만일 때`, () => {
      it.each([
        ['5xx ApiError', new ApiError(503, '503 /api/neighborhoods')],
        ['NetworkError', new NetworkError('/api/neighborhoods')],
      ])('%s이면 재시도합니다', (_label, error) => {
        expect(shouldRetry(0, error)).toBe(true);
      });

      it.each([
        ['4xx ApiError', new ApiError(404, '404 /api/places/unknown')],
        ['JSON 파싱 에러', new SyntaxError('Unexpected token')],
        ['알 수 없는 에러', new Error('unknown')],
      ])('%s이면 재시도하지 않습니다', (_label, error) => {
        expect(shouldRetry(0, error)).toBe(false);
      });
    });

    describe(`실패 횟수가 ${MAX_RETRY_COUNT}회에 도달했을 때`, () => {
      it('재시도 대상 에러여도 더 이상 재시도하지 않습니다', () => {
        const error = new ApiError(500, '500 /api/neighborhoods');

        expect(shouldRetry(MAX_RETRY_COUNT - 1, error)).toBe(true);
        expect(shouldRetry(MAX_RETRY_COUNT, error)).toBe(false);
      });
    });
  });

  describe('getRetryDelay', () => {
    it('재시도마다 지수 간격(300, 600, 1200ms)으로 대기 시간을 늘립니다', () => {
      expect([0, 1, 2].map(getRetryDelay)).toEqual([300, 600, 1200]);
    });
  });
});
