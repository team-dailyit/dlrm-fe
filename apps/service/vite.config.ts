import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const stylesDir = path.resolve(import.meta.dirname, './src/app/styles');

export default defineConfig({
  plugins: [react()],
  resolve: {
    // tsconfig.app.json 의 paths 와 동일하게 유지해야 합니다.
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // `@use 'abstracts' as *` 가 styles/abstracts 로 해석되도록.
        loadPaths: [stylesDir],
        // abstracts 는 CSS 를 출력하지 않으므로 모든 SCSS 에 주입해도 중복이 없습니다.
        // 단, abstracts 자기 자신에는 주입하지 않아야 순환 로드가 안 납니다.
        additionalData: (source: string, filename: string) => {
          const normalized = filename.replace(/\\/g, '/');
          if (normalized.includes('/app/styles/abstracts/')) return source;
          return `@use 'abstracts' as *;\n${source}`;
        },
      },
    },
  },
});
