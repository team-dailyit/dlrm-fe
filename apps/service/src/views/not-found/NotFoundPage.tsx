import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <>
      <h1>페이지를 찾을 수 없어요</h1>
      <Link to="/map">지도 홈으로 이동</Link>
    </>
  );
}
