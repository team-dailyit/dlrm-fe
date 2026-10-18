import { mergeConfig } from 'vitest/config';
import reactTestConfig from 'vitest-config/react';

import viteConfig from './vite.config.ts';

// vite.config.ts 를 상속해 alias 등 빌드 설정을 그대로 씁니다.
export default mergeConfig(viteConfig, reactTestConfig);
