import { apiClient } from '@/shared/api';

import type { Category } from '../model/category';

// 서버가 id 오름차순으로 정렬해 준다
export type CategoryResponse = {
  id: number;
  name: string;
  icon_url: string;
};

function toCategory({ id, name, icon_url }: CategoryResponse): Category {
  return { categoryId: id, name, iconUrl: icon_url };
}

export async function getCategories(): Promise<Category[]> {
  const categories = await apiClient.get<CategoryResponse[]>('/categories');

  return categories.map(toCategory);
}
