import base from 'eslint-config/base';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  ...base,
  {
    // 에디터는 여러 워크스페이스 config 를 한 프로세스에서 로드하므로 기준 경로를 명시한다.
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
