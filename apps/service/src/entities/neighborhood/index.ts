// 화면은 조회 함수 대신 쿼리 팩토리로 동네를 읽는다. 백엔드 API로 바꿀 때 조회 함수만 교체하면 된다
export { neighborhoodQueries } from './api/neighborhoodQueries';
export { type Neighborhood } from './model/neighborhood';
