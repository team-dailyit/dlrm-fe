import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, NetworkError } from './errors';
import { createQueryClient } from './queryClient';

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
        new ApiError(503, '503 /neighborhoods', '네트워크 에러입니다'),
        new NetworkError('/neighborhoods'),
      ]);

      await vi.advanceTimersByTimeAsync(ALL_RETRY_DELAYS_MS);

      expect(await result).toEqual({ ok: true });
      expect(queryFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('4xx 에러가 났을 때', () => {
    it('재시도하지 않고 에러를 그대로 전달합니다', async () => {
      const notFound = new ApiError(
        404,
        '404 /places/unknown',
        '재시도하지 않고 에러를 반환합니다.',
      );
      const { queryFn, result } = setupQuery([notFound]);

      await vi.advanceTimersByTimeAsync(ALL_RETRY_DELAYS_MS);

      expect(await result).toBe(notFound);
      expect(queryFn).toHaveBeenCalledTimes(1);
    });
  });
});
