import { describe, expect, it } from 'vitest';

import { toPins } from './toPins';

const EXHIBITION = 5_000_000_000_001;
const POPUP = 5_000_000_000_002;

// 테스트에서는 좌표를 그대로 화면 위치(px)로 본다. 실제로는 카카오맵 projection 이 바꿔 준다
const toScreenPointStub = ({ lat, lng }: { lat: number; lng: number }) => ({
  x: lng,
  y: lat,
});

function place(
  placeId: number,
  categoryId: number,
  [x, y]: [number, number],
  distanceMeters = placeId * 100,
) {
  return {
    placeId,
    categoryId,
    coordinates: { lat: y, lng: x },
    distanceMeters,
  };
}

describe('toPins', () => {
  describe('같은 카테고리 장소가 묶음 거리(40px) 안에 모였을 때', () => {
    it('숫자 핀 하나로 묶습니다', () => {
      const popupA = place(1, POPUP, [0, 0]);
      const popupB = place(2, POPUP, [30, 0]);

      expect(toPins([popupA, popupB], toScreenPointStub)).toEqual([
        {
          type: 'cluster',
          coordinates: popupA.coordinates,
          places: [popupA, popupB],
        },
      ]);
    });

    it('정확히 묶음 거리만큼 떨어져 있어도 묶습니다', () => {
      const pins = toPins(
        [place(1, POPUP, [0, 0]), place(2, POPUP, [0, 40])],
        toScreenPointStub,
      );

      expect(pins).toHaveLength(1);
    });

    it('숫자 핀은 묶인 장소 중 기준점에 가장 가까운 장소 위치에 둡니다', () => {
      const far = place(1, POPUP, [0, 0], 800);
      const nearest = place(2, POPUP, [20, 0], 300);

      const [pin] = toPins([far, nearest], toScreenPointStub);

      expect(pin.coordinates).toEqual(nearest.coordinates);
    });
  });

  describe('묶지 않을 때', () => {
    it('다른 카테고리 장소는 가까워도 각자 장소 핀으로 둡니다', () => {
      const popup = place(1, POPUP, [0, 0]);
      const exhibition = place(2, EXHIBITION, [10, 0]);

      expect(toPins([popup, exhibition], toScreenPointStub)).toEqual([
        { type: 'place', coordinates: popup.coordinates, place: popup },
        {
          type: 'place',
          coordinates: exhibition.coordinates,
          place: exhibition,
        },
      ]);
    });

    it('같은 카테고리여도 묶음 거리보다 멀면 각자 장소 핀으로 둡니다', () => {
      const pins = toPins(
        [place(1, POPUP, [0, 0]), place(2, POPUP, [41, 0])],
        toScreenPointStub,
      );

      expect(pins.map(({ type }) => type)).toEqual(['place', 'place']);
    });
  });
});
