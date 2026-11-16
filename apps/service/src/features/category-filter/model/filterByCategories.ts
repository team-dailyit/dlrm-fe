// 장소 목록과 지도 핀이 함께 쓰도록 categoryId 만 요구한다. 고른 카테고리가 없으면 전체를 보여준다
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
