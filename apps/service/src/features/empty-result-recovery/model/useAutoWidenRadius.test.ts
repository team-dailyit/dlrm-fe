import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useReferencePointStore } from '@/entities/reference-point';
import type { Radius } from '@/shared/model';

import type { SearchedPlaceCount } from './getRadiusToWiden';
import { useAutoWidenRadius } from './useAutoWidenRadius';

const SEONGSU_ID = 1_000_000_000_001;
const GANGNAM_ID = 1_000_000_000_002;

function getRadius() {
  return useReferencePointStore.getState().radius;
}

function setRadius(radius: Radius) {
  act(() => useReferencePointStore.getState().setRadius(radius));
}

// 화면이 어느 반경으로 장소를 몇 곳 받았는지 넘기는 것처럼, 받은 결과를 바꿔 가며 다시 렌더할 수 있게 한다
function renderAutoWidenRadius(searchedPlaceCount: SearchedPlaceCount) {
  return renderHook((props: SearchedPlaceCount) => useAutoWidenRadius(props), {
    initialProps: searchedPlaceCount,
  });
}

// 테스트끼리 기준점과 반경이 남지 않도록 저장소와 스토어를 비우고, 성수 기준 300m 에서 시작한다
beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  useReferencePointStore.getState().reset();
  useReferencePointStore.getState().selectNeighborhood(SEONGSU_ID);
  useReferencePointStore.getState().setRadius(300);
});

describe('useAutoWidenRadius', () => {
  describe('받은 장소가 0곳일 때', () => {
    it('반경을 한 단계 넓히고, 처음 반경과 넓힌 반경을 알려줍니다', () => {
      const { result } = renderAutoWidenRadius({ placeCount: 0, radius: 300 });

      expect(getRadius()).toBe(500);
      expect(result.current.widenedRadius).toEqual({ from: 300, to: 500 });
    });

    // 넓힌 반경으로 받기 전에 지난 결과로 또 넓히면 한 번에 2km 까지 넓어진다
    it('넓힌 반경으로 장소를 받기 전에 다시 렌더되어도 더 넓히지 않습니다', () => {
      const { rerender } = renderAutoWidenRadius({
        placeCount: 0,
        radius: 300,
      });

      rerender({ placeCount: 0, radius: 300 });

      expect(getRadius()).toBe(500);
    });

    it('넓힌 반경에서도 0곳이면 2km 까지 이어서 넓히고, 처음 반경은 그대로 알려줍니다', () => {
      const { result, rerender } = renderAutoWidenRadius({
        placeCount: 0,
        radius: 300,
      });

      rerender({ placeCount: 0, radius: 500 });
      rerender({ placeCount: 0, radius: 1000 });
      rerender({ placeCount: 0, radius: 2000 });

      expect(getRadius()).toBe(2000);
      expect(result.current.widenedRadius).toEqual({ from: 300, to: 2000 });
    });

    // 사용자가 넓히는 중에 반경을 되돌리면 지난 결과가 그대로 다시 들어온다
    it('넓히는 중에 사용자가 이전 반경으로 돌아가도 다시 넓힙니다', () => {
      renderAutoWidenRadius({ placeCount: 0, radius: 300 });

      setRadius(300);

      expect(getRadius()).toBe(500);
    });

    // 새 반경으로 받기 전에는 지난 결과가 그대로 남아 있어, 그 결과로 사용자가 고른 반경을 덮어쓰면 안 된다
    it('넓히는 중에 사용자가 다른 반경을 고르면 그 반경을 지킵니다', () => {
      renderAutoWidenRadius({ placeCount: 0, radius: 300 });

      setRadius(2000);

      expect(getRadius()).toBe(2000);
    });
  });

  describe('받은 장소가 있을 때', () => {
    it('반경을 넓히지 않습니다', () => {
      const { result } = renderAutoWidenRadius({ placeCount: 3, radius: 300 });

      expect(getRadius()).toBe(300);
      expect(result.current.widenedRadius).toBeNull();
    });
  });

  describe('넓힌 뒤 사용자가 반경을 직접 바꿨을 때', () => {
    it('넓혔다는 안내를 지우고, 넓힌 반경으로 돌아와도 다시 알리지 않습니다', () => {
      const { result, rerender } = renderAutoWidenRadius({
        placeCount: 0,
        radius: 300,
      });
      rerender({ placeCount: 3, radius: 500 });

      setRadius(1000);
      setRadius(500);

      expect(result.current.widenedRadius).toBeNull();
    });
  });

  describe('넓힌 뒤 기준점을 바꿨을 때', () => {
    it('지난 안내를 지우고, 새 기준점에서 0곳이면 지금 반경부터 다시 셉니다', () => {
      const { result, rerender } = renderAutoWidenRadius({
        placeCount: 0,
        radius: 300,
      });
      rerender({ placeCount: 3, radius: 500 });

      act(() =>
        useReferencePointStore.getState().selectNeighborhood(GANGNAM_ID),
      );
      expect(result.current.widenedRadius).toBeNull();

      rerender({ placeCount: 0, radius: 500 });

      expect(result.current.widenedRadius).toEqual({ from: 500, to: 1000 });
    });
  });
});
