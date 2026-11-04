import react from 'eslint-config/react';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  ...react,
  {
    // 에디터는 여러 워크스페이스 config 를 한 프로세스에서 로드하므로 기준 경로를 명시합니다.
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
