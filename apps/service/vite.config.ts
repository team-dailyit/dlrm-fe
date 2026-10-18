import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // 경로 alias 는 tsconfig.app.json 의 paths 한 곳에서 관리합니다.
    tsconfigPaths: true,
  },
});
