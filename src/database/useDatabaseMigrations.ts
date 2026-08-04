import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import { db } from './client';
import migrations from './migrations/migrations';

export type MigrationState =
  | { status: 'running' }
  | { status: 'ready' }
  | { status: 'failed'; error: Error };

/**
 * Executa as migrations pendentes na abertura do aplicativo. Enquanto não
 * terminarem, nenhuma tela pode consultar o banco: o schema ainda não é o que
 * o código espera.
 */
export function useDatabaseMigrations(): MigrationState {
  const { success, error } = useMigrations(db, migrations);

  if (error) return { status: 'failed', error };
  if (success) return { status: 'ready' };
  return { status: 'running' };
}
