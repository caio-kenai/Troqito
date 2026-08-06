import { eq } from 'drizzle-orm';

import { db } from '@/database/client';
import { enqueueMutation, updatedRecordFields } from '@/database/mutations';
import { profiles } from '@/database/schema';

export type PrivacySettings = {
  maskValues?: boolean;
  biometricLock?: boolean;
};

/**
 * Grava as preferências de privacidade no perfil.
 *
 * São preferências de exibição, não segredos: nenhuma senha, chave ou dado
 * biométrico passa por aqui. A biometria é conferida pelo próprio sistema, que
 * devolve apenas sim ou não.
 */
export function updatePrivacySettings(
  profileId: string,
  settings: PrivacySettings,
): void {
  const patch = { ...updatedRecordFields(), ...settings };

  db.transaction((tx) => {
    tx.update(profiles).set(patch).where(eq(profiles.id, profileId)).run();
    enqueueMutation(tx, 'profiles', profileId, 'update', patch);
  });
}
