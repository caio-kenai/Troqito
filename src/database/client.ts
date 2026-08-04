import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

import * as schema from './schema';

export const DATABASE_NAME = 'troqito.db';

let sqlite: SQLiteDatabase | null = null;

function openSqlite(): SQLiteDatabase {
  if (sqlite) return sqlite;

  sqlite = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });

  // `foreign_keys` não é ligado por padrão no SQLite e precisa ser pedido em
  // toda conexão. `WAL` melhora a leitura concorrente com a escrita, que é o
  // padrão de acesso do aplicativo: listas abertas enquanto se grava.
  sqlite.execSync('PRAGMA foreign_keys = ON;');
  sqlite.execSync('PRAGMA journal_mode = WAL;');

  return sqlite;
}

export const db = drizzle(openSqlite(), { schema });

export type Database = typeof db;

/** Fecha e esquece a conexão. Usado na exclusão de conta e nos testes. */
export function closeDatabase(): void {
  sqlite?.closeSync();
  sqlite = null;
}

export { schema };
