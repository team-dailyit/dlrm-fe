// 고른 카테고리가 없으면 전체를 보여준다. 가까운 순서를 지키도록 받은 순서 그대로 거른다
export function filterByCategories<T extends { categoryId: number }>(
  items: T[],
  selectedCategoryIds: readonly number[],
): T[] {
  if (selectedCategoryIds.length === 0) {
    return items;
  }
  const selected = new Set(selectedCategoryIds);

  return items.filter(({ categoryId }) => selected.has(categoryId));
}
