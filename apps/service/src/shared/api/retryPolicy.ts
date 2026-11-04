import { ApiError, NetworkError } from './errors';

export const MAX_RETRY_COUNT = 3;
// 재시도 대기 시간은 RETRY_BASE_DELAY_MS 에서 시작해 재시도마다 2배씩 늘어난다 (300, 600, 1200ms)
const RETRY_BASE_DELAY_MS = 300;
const SERVER_ERROR_STATUS = 500;

// 일시적인 실패(5xx, 네트워크 오류)만 재시도한다. 4xx와 파싱 에러는 재시도해도 결과가 같다.
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRY_COUNT) {
    return false;
  }

  return (
    error instanceof NetworkError ||
    (error instanceof ApiError && error.status >= SERVER_ERROR_STATUS)
  );
}

export function getRetryDelay(attemptIndex: number): number {
  return RETRY_BASE_DELAY_MS * 2 ** attemptIndex;
}
