import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// globals 가 꺼져 있어 RTL 의 자동 cleanup 이 동작하지 않으므로, 테스트마다 렌더한 DOM 을 직접 정리합니다
afterEach(() => {
  cleanup();
});
