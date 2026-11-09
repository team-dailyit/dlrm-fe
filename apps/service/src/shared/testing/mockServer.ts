import { setupServer } from 'msw/node';

// 테스트에서 API 응답을 흉내 내는 MSW 서버다. 응답은 각 테스트가 mockServer.use 로 정한다.
// 테스트 전용이라 앱 코드가 import 하는 @/shared/api 배럴에는 넣지 않는다
export const mockServer = setupServer();
