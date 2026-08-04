import { isNull } from 'drizzle-orm';

import { db } from '@/database/client';
import { newRecordFields } from '@/database/mutations';
import { profiles } from '@/database/schema';

export type Profile = typeof profiles.$inferSelect;

/**
 * Garante que existe um perfil no aparelho.
 *
 * Enquanto não há autenticação, o Troqito opera em modo local: um único perfil
 * é criado na primeira abertura e passa a ser o dono de tudo. Quando a
 * autenticação entrar, este perfil é vinculado à conta do servidor, e nenhum
 * dado precisa ser recriado.
 */
export function ensureLocalProfile(): Profile {
  const existing = db
    .select()
    .from(profiles)
    .where(isNull(profiles.deletedAt))
    .limit(1)
    .all();

  const [found] = existing;
  if (found) return found;

  const created: typeof profiles.$inferInsert = {
    ...newRecordFields(),
    name: 'Você',
  };

  db.insert(profiles).values(created).run();

  const [profile] = db.select().from(profiles).limit(1).all();
  if (!profile) {
    throw new Error('Não foi possível criar o perfil local');
  }
  return profile;
}
