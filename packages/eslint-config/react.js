import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

import base from './base.js';

// 브라우저에서 도는 React + Vite 앱(서비스, 어드민) 규칙입니다.
export default defineConfig([
  // 패턴은 이 설정을 쓰는 각 앱의 eslint.config.js 위치 기준으로 풀립니다.
  globalIgnores(['dist', 'coverage']),
  ...base,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: {
      globals: globals.browser,
    },
  },
]);
