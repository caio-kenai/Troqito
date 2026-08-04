import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { idColumn } from './common';

/**
 * Fila de mutações pendentes. É gravada na mesma transação SQLite que altera a
 * linha de origem — é isso que garante que nunca exista dado local sem
 * sincronização pendente correspondente.
 */
export const syncOutbox = sqliteTable(
  'sync_outbox',
  {
    id: idColumn,
    entity: text('entity').notNull(),
    entityId: text('entity_id').notNull(),
    /** `insert`, `update` ou `delete`. */
    operation: text('operation').notNull(),
    payload: text('payload', { mode: 'json' }).notNull(),

    /**
     * Identificador da mutação gerado no dispositivo. O servidor descarta ids
     * já aplicados, e é isso que impede duplicidade quando a resposta se perde
     * depois de o servidor já ter gravado.
     */
    clientMutationId: text('client_mutation_id').notNull().unique(),

    attempts: integer('attempts').notNull().default(0),
    lastAttemptAt: integer('last_attempt_at'),
    lastError: text('last_error'),
    /** Itens em quarentena param de ser reenviados e aparecem na interface. */
    quarantinedAt: integer('quarantined_at'),

    createdAt: integer('created_at').notNull(),
  },
  (table) => [
    index('sync_outbox_pending_idx').on(table.quarantinedAt, table.createdAt),
    index('sync_outbox_entity_idx').on(table.entity, table.entityId),
  ],
);

/** Posição de leitura por tabela, no relógio do servidor. */
export const syncCursors = sqliteTable('sync_cursors', {
  entity: text('entity').primaryKey(),
  serverUpdatedAt: integer('server_updated_at').notNull().default(0),
  lastSyncedAt: integer('last_synced_at'),
});
