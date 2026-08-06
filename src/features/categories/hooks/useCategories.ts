import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';

import {
  type Category,
  listCategories,
} from '../repository/categoriesRepository';

export type CategoriesResult = {
  categories: Category[];
  /** Apenas as categorias de primeiro nível, para a escolha inicial. */
  roots: Category[];
  byId: Map<string, Category>;
  isLoading: boolean;
};

export function useCategories(
  ownerId: string,
  kind?: 'income' | 'expense',
): CategoriesResult {
  const { data, error } = useLiveQuery(listCategories(ownerId, kind));

  if (error) throw error;

  return useMemo(() => {
    const categories = data ?? [];

    return {
      categories,
      roots: categories.filter((category) => category.parentId === null),
      byId: new Map(categories.map((category) => [category.id, category])),
      isLoading: data === undefined,
    };
  }, [data]);
}
