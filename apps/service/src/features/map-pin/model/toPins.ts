import type { Coordinates } from '@/shared/model';

// 화면에서 이 거리(px) 안에 모인 같은 카테고리 장소를 숫자 핀 하나로 묶는다
// TODO(FE-101): 핀 퍼블리싱 때 핀 크기를 보며 조정한다
const CLUSTER_DISTANCE_PX = 40;

type ScreenPoint = { x: number; y: number };

type PinnablePlace = {
  categoryId: number;
  coordinates: Coordinates;
  distanceMeters: number;
};

export type Pin<T> =
  | { type: 'place'; coordinates: Coordinates; place: T }
  | { type: 'cluster'; coordinates: Coordinates; places: T[] };

/**
 * 지도에 올릴 핀 목록을 만든다. 같은 카테고리 장소가 화면에서 가까이 모이면 숫자 핀으로 묶는다.
 * 지도에는 카테고리로 거른 장소를 넘긴다. 숫자 핀으로 거른 장소 목록을 넘기면 나머지 핀이 사라진다.
 * 묶임은 확대 수준에 따라 달라지므로 좌표를 지금 화면 위치로 바꾸는 함수(카카오맵 projection)를 받는다.
 * projection 객체는 확대해도 그대로이므로, 호출하는 쪽은 확대 레벨이 바뀔 때 다시 부른다
 */
export function toPins<T extends PinnablePlace>(
  places: readonly T[],
  toScreenPoint: (coordinates: Coordinates) => ScreenPoint,
): Pin<T>[] {
  // 기준점에 가까운 장소가 먼저 묶음을 만들어, 숫자 핀이 그 장소 위치에 놓이게 한다
  const byDistance = places.toSorted(
    (a, b) => a.distanceMeters - b.distanceMeters,
  );
  const groups: { anchor: ScreenPoint; places: T[] }[] = [];

  for (const place of byDistance) {
    const point = toScreenPoint(place.coordinates);
    const group = groups.find(
      ({ anchor, places: [first] }) =>
        first.categoryId === place.categoryId &&
        Math.hypot(anchor.x - point.x, anchor.y - point.y) <=
          CLUSTER_DISTANCE_PX,
    );

    if (group) {
      group.places.push(place);
    } else {
      groups.push({ anchor: point, places: [place] });
    }
  }

  return groups.map(({ places: grouped }): Pin<T> => {
    const [nearest] = grouped;
    return grouped.length === 1
      ? { type: 'place', coordinates: nearest.coordinates, place: nearest }
      : { type: 'cluster', coordinates: nearest.coordinates, places: grouped };
  });
}
