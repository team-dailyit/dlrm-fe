// 위·경도 좌표. 기준점, 동네 대표 좌표, 위치 권한 결과 등 여러 엔티티가 함께 쓰므로 shared 에 둔다
export type Coordinates = {
  lat: number;
  lng: number;
};
