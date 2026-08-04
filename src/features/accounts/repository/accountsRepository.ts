import { and, asc, eq, isNull, sql } from 'drizzle-orm';

import { db } from '@/database/client';
import {
  deletedRecordFields,
  enqueueMutation,
  newRecordFields,
  updatedRecordFields,
} from '@/database/mutations';
import { accounts, transactions } from '@/database/schema';
import { cents, type Cents } from '@/lib/money';

import { type AccountFormValues } from '../schemas/accountSchema';

export type Account = typeof accounts.$inferSelect;

export type AccountWithBalance = Account & { balance: Cents };

export function listAccountsQuery(ownerId: string) {
  return db
    .select()
    .from(accounts)
    .where(and(eq(accounts.ownerId, ownerId), isNull(accounts.deletedAt)))
    .orderBy(asc(accounts.archivedAt), asc(accounts.name));
}

/**
 * Saldo por conta calculado no banco.
 *
 * A soma acontece em SQL, e não em JavaScript, porque o número de lançamentos
 * cresce sem limite e carregar todos para somar no aplicativo ficaria lento
 * exatamente quando os dados começam a ter valor.
 */
export function accountBalances(ownerId: string): Map<string, Cents> {
  const rows = db
    .select({
      accountId: transactions.accountId,
      total: sql<number>`
        coalesce(sum(
          case
            when ${transactions.kind} = 'income' then ${transactions.amount}
            when ${transactions.kind} = 'expense' then -${transactions.amount}
            else 0
          end
        ), 0)
      `,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.ownerId, ownerId),
        isNull(transactions.deletedAt),
        eq(transactions.status, 'settled'),
      ),
    )
    .groupBy(transactions.accountId)
    .all();

  const balances = new Map<string, Cents>();
  for (const row of rows) {
    if (row.accountId) balances.set(row.accountId, cents(row.total));
  }
  return balances;
}

export function createAccount(
  ownerId: string,
  values: AccountFormValues,
): string {
  const record = {
    ...newRecordFields(),
    ownerId,
    name: values.name,
    type: values.type,
    institution: values.institution ?? null,
    color: values.color,
    initialBalance: values.initialBalance,
    includeInTotal: values.includeInTotal,
  };

  // A linha e o item da fila de sincronização entram na mesma transação: ou as
  // duas escritas acontecem, ou nenhuma acontece.
  db.transaction((tx) => {
    tx.insert(accounts).values(record).run();
    enqueueMutation(tx, 'accounts', record.id, 'insert', record);
  });

  return record.id;
}

export function updateAccount(id: string, values: AccountFormValues): void {
  const patch = {
    ...updatedRecordFields(),
    name: values.name,
    type: values.type,
    institution: values.institution ?? null,
    color: values.color,
    initialBalance: values.initialBalance,
    includeInTotal: values.includeInTotal,
  };

  db.transaction((tx) => {
    tx.update(accounts).set(patch).where(eq(accounts.id, id)).run();
    enqueueMutation(tx, 'accounts', id, 'update', patch);
  });
}

/**
 * Arquivar preserva o histórico; excluir apagaria o contexto de lançamentos
 * antigos. Por isso a interface só oferece arquivamento para contas em uso.
 */
export function setAccountArchived(id: string, archived: boolean): void {
  const patch = {
    ...updatedRecordFields(),
    archivedAt: archived ? Date.now() : null,
  };

  db.transaction((tx) => {
    tx.update(accounts).set(patch).where(eq(accounts.id, id)).run();
    enqueueMutation(tx, 'accounts', id, 'update', patch);
  });
}

export function deleteAccount(id: string): void {
  const patch = deletedRecordFields();

  db.transaction((tx) => {
    tx.update(accounts).set(patch).where(eq(accounts.id, id)).run();
    enqueueMutation(tx, 'accounts', id, 'delete', patch);
  });
}
