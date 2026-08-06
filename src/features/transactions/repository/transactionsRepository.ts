import { and, desc, eq, isNull } from 'drizzle-orm';

import { db } from '@/database/client';
import {
  deletedRecordFields,
  enqueueMutation,
  newRecordFields,
} from '@/database/mutations';
import { transactions } from '@/database/schema';
import { type TransactionKind } from '@/database/schema/common';
import { cents } from '@/lib/money';

import { buildTransferPair } from '../domain/transfer';
import {
  type EntryFormValues,
  type TransferFormValues,
} from '../schemas/transactionSchema';

export type Transaction = typeof transactions.$inferSelect;

export function listTransactionsQuery(ownerId: string) {
  return db
    .select()
    .from(transactions)
    .where(
      and(eq(transactions.ownerId, ownerId), isNull(transactions.deletedAt)),
    )
    .orderBy(desc(transactions.date), desc(transactions.createdAt));
}

export function createEntry(
  ownerId: string,
  kind: Exclude<TransactionKind, 'transfer'>,
  values: EntryFormValues,
): string {
  const record: typeof transactions.$inferInsert = {
    ...newRecordFields(),
    ownerId,
    createdBy: ownerId,
    kind,
    status: values.status,
    title: values.title,
    amount: values.amount,
    date: values.date,
    categoryId: values.categoryId,
    accountId: values.accountId,
    notes: values.notes?.trim() ? values.notes.trim() : null,
    settledAt: values.status === 'settled' ? values.date : null,
  };

  db.transaction((tx) => {
    tx.insert(transactions).values(record).run();
    enqueueMutation(tx, 'transactions', record.id, 'insert', record);
  });

  return record.id;
}

/**
 * Grava as duas pernas da transferência em uma única transação.
 *
 * Meia transferência aplicada seria pior do que nenhuma: o dinheiro sumiria de
 * uma conta sem aparecer na outra.
 */
export function createTransfer(
  ownerId: string,
  values: TransferFormValues,
): string {
  const [out, into] = buildTransferPair({
    // O schema devolve um número simples; a marca de centavos é reaplicada aqui,
    // na fronteira, com a validação de limite que `cents` faz.
    amount: cents(values.amount),
    date: values.date,
    fromAccountId: values.fromAccountId,
    toAccountId: values.toAccountId,
    notes: values.notes,
  });

  const now = Date.now();

  const rows: (typeof transactions.$inferInsert)[] = [out, into].map((leg) => ({
    id: leg.id,
    createdAt: now,
    updatedAt: now,
    ownerId,
    createdBy: ownerId,
    kind: 'transfer',
    status: 'settled',
    title: leg.title,
    amount: leg.amount,
    date: leg.date,
    accountId: leg.accountId,
    transferGroupId: leg.transferGroupId,
    // A direção é guardada no método de pagamento por ora; a coluna dedicada
    // entra quando as transferências ganharem tela própria de edição.
    paymentMethod: leg.direction,
    notes: leg.notes,
    settledAt: leg.date,
  }));

  db.transaction((tx) => {
    tx.insert(transactions).values(rows).run();
    for (const row of rows) {
      enqueueMutation(tx, 'transactions', row.id, 'insert', row);
    }
  });

  return out.transferGroupId;
}

/**
 * Exclui um lançamento. Quando ele faz parte de uma transferência, as duas
 * pernas são excluídas juntas — deixar uma sozinha desequilibraria os saldos.
 */
export function deleteTransaction(transaction: Transaction): void {
  const patch = deletedRecordFields();

  db.transaction((tx) => {
    if (transaction.transferGroupId) {
      tx.update(transactions)
        .set(patch)
        .where(eq(transactions.transferGroupId, transaction.transferGroupId))
        .run();
      enqueueMutation(
        tx,
        'transactions',
        transaction.transferGroupId,
        'delete',
        { ...patch, transferGroupId: transaction.transferGroupId },
      );
      return;
    }

    tx.update(transactions)
      .set(patch)
      .where(eq(transactions.id, transaction.id))
      .run();
    enqueueMutation(tx, 'transactions', transaction.id, 'delete', patch);
  });
}
