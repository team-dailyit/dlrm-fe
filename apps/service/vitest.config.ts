import { mergeConfig } from 'vitest/config';
import reactTestConfig from 'vitest-config/react';

import viteConfig from './vite.config.ts';

// vite.config.ts 를 상속해 alias 등 빌드 설정을 그대로 씁니다.
// API 요청은 MSW 가 가로채므로, 실제 서버가 아닌 테스트용 주소를 둡니다.
export default mergeConfig(mergeConfig(viteConfig, reactTestConfig), {
  test: {
    env: { VITE_API_BASE_URL: 'https://api.test' },
  },
});
