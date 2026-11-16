import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useCategoryFilter } from './useCategoryFilter';

const EXHIBITION = 5_000_000_000_001;
const POPUP = 5_000_000_000_002;

describe('useCategoryFilter', () => {
  describe('처음 열었을 때', () => {
    it('고른 카테고리 없이 시작합니다', () => {
      const { result } = renderHook(() => useCategoryFilter());

      expect(result.current.selectedCategoryIds).toEqual([]);
    });
  });

  describe('칩을 눌렀을 때', () => {
    it('누른 카테고리를 고른 목록에 더합니다', () => {
      const { result } = renderHook(() => useCategoryFilter());

      act(() => result.current.toggleCategory(EXHIBITION));
      act(() => result.current.toggleCategory(POPUP));

      expect(result.current.selectedCategoryIds).toEqual([EXHIBITION, POPUP]);
    });

    it('이미 고른 카테고리를 다시 누르면 고른 목록에서 뺍니다', () => {
      const { result } = renderHook(() => useCategoryFilter());

      act(() => result.current.toggleCategory(EXHIBITION));
      act(() => result.current.toggleCategory(POPUP));
      act(() => result.current.toggleCategory(EXHIBITION));

      expect(result.current.selectedCategoryIds).toEqual([POPUP]);
    });
  });
});
