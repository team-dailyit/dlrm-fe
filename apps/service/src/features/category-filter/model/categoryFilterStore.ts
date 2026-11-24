import { create } from 'zustand';

type CategoryFilterState = {
  selectedCategoryIds: number[];
};

type CategoryFilterActions = {
  toggleCategory: (categoryId: number) => void;
  // "전체 보기". 고른 카테고리를 모두 풀어 전체 장소를 보여준다
  clearCategories: () => void;
};

const initialState: CategoryFilterState = {
  selectedCategoryIds: [],
};

/*
 * 칩과 장소 목록처럼 서로 다른 컴포넌트가 같은 선택을 보도록 스토어 하나에 둔다.
 * 새로고침하면 다시 전체로 시작해야 해서 persist 하지 않는다
 */
export const useCategoryFilterStore = create<
  CategoryFilterState & CategoryFilterActions
>()((set) => ({
  ...initialState,
  toggleCategory: (categoryId) =>
    set(({ selectedCategoryIds }) => ({
      selectedCategoryIds: selectedCategoryIds.includes(categoryId)
        ? selectedCategoryIds.filter((id) => id !== categoryId)
        : [...selectedCategoryIds, categoryId],
    })),
  clearCategories: () => set({ selectedCategoryIds: [] }),
}));
