import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // tsconfig.app.json 의 paths 와 동일하게 유지해야 합니다.
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
