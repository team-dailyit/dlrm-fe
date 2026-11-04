import { defineConfig } from 'vitest/config';

// React 앱(서비스, 어드민) 공통 테스트 설정입니다.
// 경로는 각 앱 루트 기준으로 풀리므로, 앱마다 vitest.setup.ts 를 둡니다.
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
