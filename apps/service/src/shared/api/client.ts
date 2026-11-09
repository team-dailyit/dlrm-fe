import { createApiClient } from './apiClient';

// 서비스 전역에서 쓰는 API 클라이언트다. 주소는 환경 변수 VITE_API_BASE_URL 로 받는다
export const apiClient = createApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
});
