import type { Neighborhood } from '../model/neighborhood';

// 백엔드 동네 API가 준비되기 전까지 쓰는 고정 데이터다. API로 바꿀 때는 아래 조회 함수만 교체한다
const NEIGHBORHOODS: Neighborhood[] = [
  {
    neighborhoodId: 'seongsu',
    name: '성수',
    coordinates: { lat: 37.5445, lng: 127.056 },
  },
  {
    neighborhoodId: 'gangnam',
    name: '강남',
    coordinates: { lat: 37.4979, lng: 127.0276 },
  },
  {
    neighborhoodId: 'anguk',
    name: '안국',
    coordinates: { lat: 37.5765, lng: 126.9854 },
  },
  {
    neighborhoodId: 'hongdae',
    name: '홍대',
    coordinates: { lat: 37.5572, lng: 126.9245 },
  },
];

export async function getNeighborhoods(): Promise<Neighborhood[]> {
  return NEIGHBORHOODS;
}

export async function getNeighborhoodById(
  neighborhoodId: string,
): Promise<Neighborhood | null> {
  return (
    NEIGHBORHOODS.find(
      (neighborhood) => neighborhood.neighborhoodId === neighborhoodId,
    ) ?? null
  );
}
