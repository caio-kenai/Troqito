import { and, asc, eq, isNull, sql } from 'drizzle-orm';

import { db } from '@/database/client';
import {
  deletedRecordFields,
  enqueueMutation,
  newRecordFields,
  updatedRecordFields,
} from '@/database/mutations';
import { creditCards, transactions } from '@/database/schema';
import { cents, type Cents } from '@/lib/money';

import { type CardFormValues } from '../schemas/cardSchema';

export type CreditCard = typeof creditCards.$inferSelect;

export function listCardsQuery(ownerId: string) {
  return db
    .select()
    .from(creditCards)
    .where(and(eq(creditCards.ownerId, ownerId), isNull(creditCards.deletedAt)))
    .orderBy(asc(creditCards.archivedAt), asc(creditCards.name));
}

/**
 * Quanto está comprometido em cada cartão.
 *
 * Conta apenas o que ainda não foi pago: uma fatura quitada devolve o limite.
 * A soma acontece no banco, pelo mesmo motivo do saldo das contas — a
 * quantidade de lançamentos cresce sem limite.
 */
export function cardUsage(ownerId: string): Map<string, Cents> {
  const rows = db
    .select({
      creditCardId: transactions.creditCardId,
      total: sql<number>`coalesce(sum(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.ownerId, ownerId),
        isNull(transactions.deletedAt),
        eq(transactions.kind, 'expense'),
        sql`${transactions.status} <> 'canceled'`,
        isNull(transactions.settledAt),
      ),
    )
    .groupBy(transactions.creditCardId)
    .all();

  const usage = new Map<string, Cents>();
  for (const row of rows) {
    if (row.creditCardId) usage.set(row.creditCardId, cents(row.total));
  }
  return usage;
}

export function createCard(ownerId: string, values: CardFormValues): string {
  const record = {
    ...newRecordFields(),
    ownerId,
    name: values.name,
    brand: values.brand ?? null,
    color: values.color,
    creditLimit: values.creditLimit,
    closingDay: values.closingDay,
    dueDay: values.dueDay,
    paymentAccountId: values.paymentAccountId ?? null,
  };

  db.transaction((tx) => {
    tx.insert(creditCards).values(record).run();
    enqueueMutation(tx, 'credit_cards', record.id, 'insert', record);
  });

  return record.id;
}

export function updateCard(id: string, values: CardFormValues): void {
  const patch = {
    ...updatedRecordFields(),
    name: values.name,
    brand: values.brand ?? null,
    color: values.color,
    creditLimit: values.creditLimit,
    closingDay: values.closingDay,
    dueDay: values.dueDay,
    paymentAccountId: values.paymentAccountId ?? null,
  };

  db.transaction((tx) => {
    tx.update(creditCards).set(patch).where(eq(creditCards.id, id)).run();
    enqueueMutation(tx, 'credit_cards', id, 'update', patch);
  });
}

export function deleteCard(id: string): void {
  const patch = deletedRecordFields();

  db.transaction((tx) => {
    tx.update(creditCards).set(patch).where(eq(creditCards.id, id)).run();
    enqueueMutation(tx, 'credit_cards', id, 'delete', patch);
  });
}
