import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { mockServer } from '@/shared/testing/mockServer';

// 테스트가 응답을 정하지 않은 API 요청은 실제 네트워크로 나가지 않고 실패하도록 MSW 서버를 켠다
beforeAll(() => {
  mockServer.listen({ onUnhandledFrame: 'error' });
});

// globals 가 꺼져 있어 RTL 의 자동 cleanup 이 동작하지 않으므로, 테스트마다 렌더한 DOM 을 직접 정리한다.
// 한 테스트에서 정한 API 응답이 다음 테스트에 남지 않도록 MSW 핸들러도 되돌린다
afterEach(() => {
  cleanup();
  mockServer.resetHandlers();
});

afterAll(() => {
  mockServer.close();
});
