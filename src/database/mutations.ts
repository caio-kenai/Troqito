import { uuidv7 } from '@/lib/id';

import { syncOutbox } from './schema';

export type MutationOperation = 'insert' | 'update' | 'delete';

type OutboxWriter = {
  insert: (table: typeof syncOutbox) => {
    values: (row: typeof syncOutbox.$inferInsert) => { run: () => unknown };
  };
};

/**
 * Enfileira uma mutação para sincronização.
 *
 * Deve ser chamada **dentro da mesma transação** que alterou a linha de origem.
 * É isso que garante que nunca exista dado local sem sincronização pendente
 * correspondente: ou as duas escritas acontecem, ou nenhuma acontece.
 */
export function enqueueMutation(
  tx: OutboxWriter,
  entity: string,
  entityId: string,
  operation: MutationOperation,
  payload: unknown,
): void {
  tx.insert(syncOutbox)
    .values({
      id: uuidv7(),
      entity,
      entityId,
      operation,
      payload,
      // Identificador da tentativa. O servidor descarta ids já aplicados, o que
      // impede duplicidade quando a resposta se perde depois da gravação.
      clientMutationId: uuidv7(),
      createdAt: Date.now(),
    })
    .run();
}

/** Carimba os campos de auditoria de uma linha nova. */
export function newRecordFields(now: number = Date.now()) {
  return { id: uuidv7(now), createdAt: now, updatedAt: now };
}

/** Carimba a alteração de uma linha existente. */
export function updatedRecordFields(now: number = Date.now()) {
  return { updatedAt: now };
}

/** Marca a exclusão lógica, que é a única capaz de ser propagada. */
export function deletedRecordFields(now: number = Date.now()) {
  return { deletedAt: now, updatedAt: now };
}
