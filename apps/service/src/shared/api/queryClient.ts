import { QueryClient } from '@tanstack/react-query';

import { getRetryDelay, shouldRetry } from './retryPolicy';

// 재시도는 React Query가 맡고 apiClient(ky)의 재시도는 꺼서 중복 재시도를 막는다.
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetry, retryDelay: getRetryDelay },
    },
  });
}
