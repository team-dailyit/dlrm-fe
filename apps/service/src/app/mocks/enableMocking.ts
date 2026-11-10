// 백엔드 서버가 없을 때 개발 서버에서 API 응답을 MSW 로 흉내 낸다.
// 개발 모드이면서 VITE_ENABLE_MSW=true 일 때만 켜고, MSW 와 응답 예시는 동적 import 로 불러와 배포 번들에 넣지 않는다
export async function enableMocking() {
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW !== 'true') {
    return;
  }
  const [{ setupWorker }, { handlers }] = await Promise.all([
    import('msw/browser'),
    import('./handlers'),
  ]);

  // 핸들러가 없는 요청(카카오맵 SDK, 정적 파일 등)은 그대로 실제 네트워크로 보낸다
  await setupWorker(...handlers).start({ onUnhandledFrame: 'bypass' });
}
