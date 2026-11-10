import react from 'eslint-config/react';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  ...react,
  // Storybook 정적 빌드 결과물과 MSW 가 생성한 서비스 워커는 린트하지 않는다
  globalIgnores(['storybook-static', 'public/mockServiceWorker.js']),
  {
    // 에디터는 여러 워크스페이스 config 를 한 프로세스에서 로드하므로 기준 경로를 명시합니다.
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // 스토리는 meta 와 story 객체를 export 하므로 컴포넌트만 export 하라는 규칙을 적용하지 않는다
    files: ['**/*.stories.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
]);
