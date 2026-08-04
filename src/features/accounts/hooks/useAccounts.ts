import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';

import { cents, type Cents } from '@/lib/money';

import { consolidatedBalance } from '../domain/balance';
import {
  type Account,
  accountBalances,
  listAccountsQuery,
} from '../repository/accountsRepository';

export type AccountWithBalance = Account & { balance: Cents };

export type AccountsResult = {
  accounts: AccountWithBalance[];
  total: Cents;
  isLoading: boolean;
};

/**
 * Lista de contas com o saldo já resolvido.
 *
 * `useLiveQuery` reexecuta a consulta quando a tabela muda, então a tela se
 * atualiza sozinha depois de um lançamento, sem cache para invalidar.
 */
export function useAccounts(ownerId: string): AccountsResult {
  const { data, error } = useLiveQuery(listAccountsQuery(ownerId));

  return useMemo(() => {
    if (error) throw error;

    const rows = data ?? [];
    const movements = accountBalances(ownerId);

    const accounts = rows.map((account) => ({
      ...account,
      balance: cents(account.initialBalance + (movements.get(account.id) ?? 0)),
    }));

    return {
      accounts,
      total: consolidatedBalance(accounts),
      isLoading: data === undefined,
    };
  }, [data, error, ownerId]);
}
