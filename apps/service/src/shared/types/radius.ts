// 기준점으로부터 장소를 찾는 범위(직선 거리, m). 기준점 스토어와 장소 검색 조건이 Radius 타입을 함께 쓰고, 타입이 값 목록에서 나오므로 상수도 함께 둔다
export const RADIUS_OPTIONS = [300, 500, 1000, 2000] as const;
export const DEFAULT_RADIUS = 500;

export type Radius = (typeof RADIUS_OPTIONS)[number];
