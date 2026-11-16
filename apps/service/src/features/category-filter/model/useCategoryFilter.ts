import { useCallback, useState } from 'react';

// 고른 카테고리는 저장하지 않는다. 새로고침하면 다시 전체로 시작한다
export function useCategoryFilter() {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const toggleCategory = useCallback((categoryId: number) => {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  }, []);

  return { selectedCategoryIds, toggleCategory };
}
