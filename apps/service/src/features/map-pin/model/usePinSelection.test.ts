import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useMapPinStore } from './mapPinStore';
import { usePinSelection } from './usePinSelection';

const POPUP = 5_000_000_000_002;
const SEONGSU_ID = 1_000_000_000_001;
const GANGNAM_ID = 1_000_000_000_002;

// 카테고리로 거른 뒤 지도에 보이는 장소들이다. 서버가 가까운 순으로 준다
const VISIBLE_PLACES = [{ placeId: 1 }, { placeId: 2 }, { placeId: 3 }];

type Options = Parameters<typeof usePinSelection<{ placeId: number }>>[0];

const SEONGSU_500M: Options = {
  visiblePlaces: VISIBLE_PLACES,
  placeSearch: { neighborhoodId: SEONGSU_ID, radius: 500 },
  selectedCategoryIds: [],
};

// 지도 홈이 지금 장소와 조건으로 훅을 부른다. 화면에 그려진 값을 순서대로 보려고 렌더마다 결과를 남긴다
function renderPinSelection(options: Options = SEONGSU_500M) {
  const renders: ReturnType<typeof usePinSelection>[] = [];
  const view = renderHook(
    (current: Options) => {
      const selection = usePinSelection(current);
      renders.push(selection);
      return selection;
    },
    { initialProps: options },
  );
  return { ...view, renders };
}

// 스토어는 모듈에 하나만 있어서, 테스트끼리 고른 핀이 남지 않도록 비운다
beforeEach(() => {
  useMapPinStore.getState().clearPinSelection();
});

describe('usePinSelection', () => {
  describe('장소 핀을 눌렀을 때', () => {
    it('다른 핀을 누르면 핀 요약이 그 장소로 바뀝니다', () => {
      const { result } = renderPinSelection();

      act(() => result.current.selectPlacePin(1));
      act(() => result.current.selectPlacePin(2));

      expect(result.current.selectedPlace).toEqual({ placeId: 2 });
    });

    it('숫자 핀으로 거른 장소 목록은 그대로 둡니다', () => {
      const { result } = renderPinSelection();
      act(() => result.current.selectClusterPin([3, 1]));

      act(() => result.current.selectPlacePin(1));

      expect(result.current.listedPlaces).toEqual([
        { placeId: 1 },
        { placeId: 3 },
      ]);
    });

    it('같은 조건이어도 다시 받은 장소 목록에서 빠졌으면 핀 요약을 보여주지 않습니다', () => {
      const { result, rerender } = renderPinSelection();
      act(() => result.current.selectPlacePin(2));

      rerender({ ...SEONGSU_500M, visiblePlaces: [{ placeId: 1 }] });

      expect(result.current.selectedPlace).toBeNull();
    });
  });

  describe('숫자 핀을 눌렀을 때', () => {
    it('장소 목록을 묶인 장소로 가까운 순서 그대로 거르고, 고른 핀은 해제합니다', () => {
      const { result } = renderPinSelection();
      act(() => result.current.selectPlacePin(2));

      act(() => result.current.selectClusterPin([3, 1]));

      expect(result.current).toMatchObject({
        selectedPlace: null,
        listedPlaces: [{ placeId: 1 }, { placeId: 3 }],
      });
    });
  });

  describe('빈 지도를 눌렀을 때', () => {
    it('고른 핀과 숫자 핀 거르기를 모두 풉니다', () => {
      const { result } = renderPinSelection();
      act(() => result.current.selectClusterPin([3, 1]));
      act(() => result.current.selectPlacePin(1));

      act(() => result.current.clearPinSelection());

      expect(result.current).toMatchObject({
        selectedPlace: null,
        listedPlaces: VISIBLE_PLACES,
      });
    });
  });

  describe('기준점·반경·고른 카테고리가 바뀌었을 때', () => {
    it.each<[string, Options]>([
      [
        '기준점',
        {
          ...SEONGSU_500M,
          placeSearch: { neighborhoodId: GANGNAM_ID, radius: 500 },
        },
      ],
      [
        '반경',
        {
          ...SEONGSU_500M,
          placeSearch: { neighborhoodId: SEONGSU_ID, radius: 1000 },
        },
      ],
      ['고른 카테고리', { ...SEONGSU_500M, selectedCategoryIds: [POPUP] }],
    ])(
      '%s 값이 바뀐 첫 렌더부터 고른 핀과 숫자 핀 거르기가 보이지 않습니다',
      (_, changed) => {
        const { result, rerender, renders } = renderPinSelection();
        act(() => result.current.selectClusterPin([3, 1]));
        act(() => result.current.selectPlacePin(1));
        const rendersBeforeChange = renders.length;

        rerender(changed);

        expect(renders[rendersBeforeChange]).toMatchObject({
          selectedPlace: null,
          listedPlaces: VISIBLE_PLACES,
        });
      },
    );

    it('조건이 원래대로 돌아와도 예전 선택은 되살아나지 않습니다', () => {
      const { result, rerender } = renderPinSelection();
      act(() => result.current.selectPlacePin(1));

      rerender({ ...SEONGSU_500M, selectedCategoryIds: [POPUP] });
      rerender(SEONGSU_500M);

      expect(result.current.selectedPlace).toBeNull();
    });

    it('바뀐 뒤 장소 핀을 누르면 예전 숫자 핀 거르기는 되살아나지 않습니다', () => {
      const { result, rerender } = renderPinSelection();
      act(() => result.current.selectClusterPin([3, 1]));
      rerender({ ...SEONGSU_500M, selectedCategoryIds: [POPUP] });

      act(() => result.current.selectPlacePin(2));

      expect(result.current.listedPlaces).toEqual(VISIBLE_PLACES);
    });
  });

  describe('조건은 그대로일 때', () => {
    it('값이 같은 새 객체로 다시 렌더되어도 숫자 핀 거르기를 유지합니다', () => {
      const { result, rerender } = renderPinSelection();
      act(() => result.current.selectClusterPin([3, 1]));

      rerender(structuredClone(SEONGSU_500M));

      expect(result.current.listedPlaces).toEqual([
        { placeId: 1 },
        { placeId: 3 },
      ]);
    });

    it('지도 홈이 다시 마운트되어도 숫자 핀 거르기를 유지합니다', () => {
      const first = renderPinSelection();
      act(() => first.result.current.selectClusterPin([3, 1]));
      first.unmount();

      const { result } = renderPinSelection();

      expect(result.current.listedPlaces).toEqual([
        { placeId: 1 },
        { placeId: 3 },
      ]);
    });
  });
});
