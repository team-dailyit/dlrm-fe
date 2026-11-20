import { generatePath } from 'react-router';

// 라우터와 화면 이동·공유 링크가 같은 경로를 쓰도록 한 곳에 둔다
export const ROUTE_PATHS = {
  onboarding: '/',
  neighborhood: '/neighborhood',
  mapHome: '/map',
  placeDetail: '/map/place/:id',
} as const;

export function toPlaceDetailPath(placeId: number): string {
  return generatePath(ROUTE_PATHS.placeDetail, { id: String(placeId) });
}
