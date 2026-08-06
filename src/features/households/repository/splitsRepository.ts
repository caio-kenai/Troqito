import { and, eq, isNull } from 'drizzle-orm';

import { db } from '@/database/client';
import {
  deletedRecordFields,
  enqueueMutation,
  newRecordFields,
  updatedRecordFields,
} from '@/database/mutations';
import { transactions, transactionSplits } from '@/database/schema';
import { type SplitMethod } from '@/database/schema/common';
import { cents, MoneyError } from '@/lib/money';

import { sharesAreBalanced, type Share } from '../domain/split';

export type TransactionSplit = typeof transactionSplits.$inferSelect;

export function listSplitsQuery(transactionId: string) {
  return db
    .select()
    .from(transactionSplits)
    .where(
      and(
        eq(transactionSplits.transactionId, transactionId),
        isNull(transactionSplits.deletedAt),
      ),
    );
}

/**
 * Grava a divisão de um lançamento.
 *
 * A divisão anterior é removida e a nova entra na mesma transação de banco, com
 * a marcação de compartilhado no próprio lançamento. Aplicar só parte disso
 * deixaria uma despesa marcada como dividida sem partes, ou partes órfãs
 * somando um valor que não corresponde a despesa alguma.
 *
 * A soma das partes é conferida aqui, e não só no formulário: este é o último
 * ponto antes do banco, e é o único por onde toda gravação passa.
 */
export function saveSplits(
  ownerId: string,
  transactionId: string,
  total: number,
  method: SplitMethod,
  shares: readonly Share[],
  paidByMemberId: string,
): void {
  if (!sharesAreBalanced(shares, cents(total))) {
    throw new MoneyError(
      'saveSplits: a soma das partes não corresponde ao total do lançamento',
    );
  }

  const removal = deletedRecordFields();

  const rows = shares.map((share) => ({
    ...newRecordFields(),
    ownerId,
    transactionId,
    memberId: share.memberId,
    method,
    amount: share.amount,
    percentage: share.percentage ?? null,
    settledAt: null,
  }));

  db.transaction((tx) => {
    tx.update(transactionSplits)
      .set(removal)
      .where(eq(transactionSplits.transactionId, transactionId))
      .run();

    if (rows.length > 0) {
      tx.insert(transactionSplits).values(rows).run();
      for (const row of rows) {
        enqueueMutation(tx, 'transaction_splits', row.id, 'insert', row);
      }
    }

    const patch = {
      ...updatedRecordFields(),
      isShared: true,
      paidById: paidByMemberId,
    };
    tx.update(transactions)
      .set(patch)
      .where(eq(transactions.id, transactionId))
      .run();
    enqueueMutation(tx, 'transactions', transactionId, 'update', patch);
  });
}

/** Desfaz a divisão: a despesa volta a ser individual. */
export function clearSplits(transactionId: string): void {
  const removal = deletedRecordFields();

  db.transaction((tx) => {
    tx.update(transactionSplits)
      .set(removal)
      .where(eq(transactionSplits.transactionId, transactionId))
      .run();
    enqueueMutation(tx, 'transaction_splits', transactionId, 'delete', {
      ...removal,
      transactionId,
    });

    const patch = {
      ...updatedRecordFields(),
      isShared: false,
      paidById: null,
    };
    tx.update(transactions)
      .set(patch)
      .where(eq(transactions.id, transactionId))
      .run();
    enqueueMutation(tx, 'transactions', transactionId, 'update', patch);
  });
}

/** Marca a parte de uma pessoa como acertada. */
export function settleSplit(id: string, settled: boolean): void {
  const patch = {
    ...updatedRecordFields(),
    settledAt: settled ? Date.now() : null,
  };

  db.transaction((tx) => {
    tx.update(transactionSplits)
      .set(patch)
      .where(eq(transactionSplits.id, id))
      .run();
    enqueueMutation(tx, 'transaction_splits', id, 'update', patch);
  });
}
