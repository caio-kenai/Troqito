import { and, asc, eq, isNull } from 'drizzle-orm';

import { db } from '@/database/client';
import { newRecordFields } from '@/database/mutations';
import { categories } from '@/database/schema';

import { DEFAULT_CATEGORIES } from '../domain/defaultCategories';

export type Category = typeof categories.$inferSelect;

export function listCategories(ownerId: string, kind?: 'income' | 'expense') {
  return db
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.ownerId, ownerId),
        isNull(categories.deletedAt),
        isNull(categories.archivedAt),
        kind ? eq(categories.kind, kind) : undefined,
      ),
    )
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

/**
 * Cria as categorias iniciais na primeira abertura.
 *
 * É idempotente: se já existir qualquer categoria do dono, nada acontece. Sem
 * isso, uma segunda execução duplicaria a lista inteira.
 */
export function seedDefaultCategories(ownerId: string): number {
  const existing = db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.ownerId, ownerId))
    .limit(1)
    .all();

  if (existing.length > 0) return 0;

  const rows: (typeof categories.$inferInsert)[] = [];
  let order = 0;

  for (const category of DEFAULT_CATEGORIES) {
    const parent = {
      ...newRecordFields(),
      ownerId,
      name: category.name,
      kind: category.kind,
      icon: category.icon,
      color: category.color,
      sortOrder: order,
      isSystem: true,
    };
    rows.push(parent);
    order += 1;

    for (const child of category.children ?? []) {
      rows.push({
        ...newRecordFields(),
        ownerId,
        name: child,
        kind: category.kind,
        parentId: parent.id,
        icon: category.icon,
        color: category.color,
        sortOrder: order,
        isSystem: true,
      });
      order += 1;
    }
  }

  db.insert(categories).values(rows).run();
  return rows.length;
}
