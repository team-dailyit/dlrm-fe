import { defineConfig } from 'vitest/config';

// 경로는 각 앱 루트 기준으로 풀리므로, 앱마다 vitest.setup.ts 를 둔다.
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
