import { generatePath, Navigate, useParams } from 'react-router';

// 공유 링크(/place/:id)는 지도 컨텍스트를 유지하는 /map/place/:id 로 보낸다
export default function RedirectToMapPlace() {
  // 라우트가 /place/:id 이므로 id 는 항상 존재한다
  const { id = '' } = useParams();

  // useParams 는 디코딩된 값을 주므로 generatePath 로 다시 인코딩해 ?, # 등이 경로를 깨지 않게 한다
  return <Navigate to={generatePath('/map/place/:id', { id })} replace />;
}
