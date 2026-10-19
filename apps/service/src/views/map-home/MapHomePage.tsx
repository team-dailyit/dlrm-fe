import { Outlet } from 'react-router';

// 지도 홈이 허브이므로 장소 상세는 하위 Outlet에 겹쳐 렌더해 지도가 다시 마운트되지 않게 한다
export default function MapHomePage() {
  return (
    <>
      <h1>지도 홈</h1>
      <Outlet />
    </>
  );
}
