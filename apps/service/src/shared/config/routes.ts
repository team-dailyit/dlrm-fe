import { generatePath } from 'react-router';

// 라우터와 화면 이동·공유 링크가 같은 경로를 쓰도록 한 곳에 둔다
export const ROUTE_PATHS = {
  onboarding: '/',
  neighborhood: '/neighborhood',
  mapHome: '/map',
  placeDetail: '/map/place/:id',
} as const;

// 경로 모양은 맞지만 가리키는 대상이 잘못돼 "페이지 없음"을 보여줘야 할 때 화면이 던진다. 라우트 ErrorBoundary 가 받아 페이지 없음 화면으로 바꾼다
export class PageNotFoundError extends Error {
  constructor() {
    super('Page not found');
    this.name = 'PageNotFoundError';
  }
}

export function toPlaceDetailPath(placeId: number): string {
  return generatePath(ROUTE_PATHS.placeDetail, { id: String(placeId) });
}
