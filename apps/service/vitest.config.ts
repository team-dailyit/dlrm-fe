import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config.ts';

// vite.config.ts 를 상속해 alias 등 빌드 설정을 그대로 씁니다.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  }),
);
