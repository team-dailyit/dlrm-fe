import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app';
import { enableMocking } from '@/app/mocks/enableMocking';

// MSW 가 켜져 있으면 워커가 준비된 뒤에 그려야 첫 API 요청부터 가로챌 수 있다.
// 워커 등록에 실패해도(워커 파일 누락, 서비스 워커를 쓸 수 없는 환경 등) 앱은 그린다
void enableMocking()
  .catch((error: unknown) => {
    console.warn('MSW 를 시작하지 못해 실제 API 로 요청합니다.', error);
  })
  .then(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
