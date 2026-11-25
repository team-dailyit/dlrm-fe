import { useRouteError } from 'react-router';

import { PageNotFoundError } from '@/shared/config';
import { NotFoundPage } from '@/views/not-found';

// 화면이 "페이지 없음"을 알리면 지도 홈까지 통째로 페이지 없음 화면으로 바꾼다. 그 밖의 오류는 위로 그대로 던진다
export function MapHomeErrorBoundary() {
  const error = useRouteError();
  if (error instanceof PageNotFoundError) {
    return <NotFoundPage />;
  }
  throw error;
}
