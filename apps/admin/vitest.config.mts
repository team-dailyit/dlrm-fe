import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// ⚠️ async Server Component 는 Vitest 로 테스트할 수 없습니다. E2E 로 검증하세요.
export default defineConfig({
  plugins: [react()],
  resolve: {
    // tsconfig.json 의 paths 와 동일하게 유지해야 합니다.
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
