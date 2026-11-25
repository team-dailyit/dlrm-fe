import { useParams } from 'react-router';

import { PageNotFoundError } from '@/shared/config';

import { toPlaceId } from './model/toPlaceId';

export default function PlaceDetailPage() {
  const placeId = toPlaceId(useParams().id);
  // 장소 코드가 정수 표기가 아니면 조회하지 않고, 라우터가 지도 홈 대신 "페이지 없음"을 보여주도록 던진다
  if (placeId === null) {
    throw new PageNotFoundError();
  }

  return <h2>장소 상세</h2>;
}
