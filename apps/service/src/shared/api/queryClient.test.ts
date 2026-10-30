import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, NetworkError } from './errors';
import { createQueryClient } from './queryClient';
import { MAX_RETRY_COUNT } from './retryPolicy';

// 지수 간격(300, 600, 1200ms)을 모두 지나도록 넉넉히 시간을 흘린다
const ALL_RETRY_DELAYS_MS = 300 + 600 + 1200;

function setupQuery(failures: Error[]) {
  const queryFn = vi.fn<() => Promise<{ ok: boolean }>>();
  failures.forEach((failure) => queryFn.mockRejectedValueOnce(failure));
  queryFn.mockResolvedValue({ ok: true });

  const result = createQueryClient()
    .fetchQuery({ queryKey: ['test'], queryFn })
    .catch((e: unknown) => e);

  return { queryFn, result };
}

describe('createQueryClient', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('재시도 대상 에러 뒤에 성공했을 때', () => {
    it('5xx와 네트워크 오류는 자동으로 재시도해 성공한 데이터를 반환합니다', async () => {
      const { queryFn, result } = setupQuery([
        new ApiError(503, '503 /api/neighborhoods'),
        new NetworkError('/api/neighborhoods'),
      ]);

      await vi.advanceTimersByTimeAsync(ALL_RETRY_DELAYS_MS);

      expect(await result).toEqual({ ok: true });
      expect(queryFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('4xx 에러가 났을 때', () => {
    it('재시도하지 않고 에러를 그대로 전달합니다', async () => {
      const notFound = new ApiError(404, '404 /api/places/unknown');
      const { queryFn, result } = setupQuery([notFound]);

      await vi.advanceTimersByTimeAsync(ALL_RETRY_DELAYS_MS);

      expect(await result).toBe(notFound);
      expect(queryFn).toHaveBeenCalledTimes(1);
    });
  });

  describe(`계속 실패해 재시도가 ${MAX_RETRY_COUNT}회를 넘었을 때`, () => {
    it(`최초 요청 이후 ${MAX_RETRY_COUNT}회까지만 재시도하고 마지막 에러를 전달합니다`, async () => {
      const failures = Array.from(
        { length: MAX_RETRY_COUNT + 1 },
        () => new ApiError(500, '500 /api/neighborhoods'),
      );
      const { queryFn, result } = setupQuery(failures);

      await vi.advanceTimersByTimeAsync(ALL_RETRY_DELAYS_MS);

      expect(await result).toBe(failures[MAX_RETRY_COUNT]);
      expect(queryFn).toHaveBeenCalledTimes(MAX_RETRY_COUNT + 1);
    });
  });
});
