import { QueryClient } from '@tanstack/react-query';

// 재시도는 apiClient가 맡으므로 React Query의 재시도는 꺼서 중복 재시도를 막는다.
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}
