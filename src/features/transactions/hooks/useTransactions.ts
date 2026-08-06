import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';

import { cycleRangeFor, today, type DateRange } from '@/lib/date';
import { cents } from '@/lib/money';

import { summarizePeriod, type PeriodSummary } from '../domain/summary';
import {
  listTransactionsQuery,
  type Transaction,
} from '../repository/transactionsRepository';

export type TransactionsResult = {
  transactions: Transaction[];
  isLoading: boolean;
};

export function useTransactions(ownerId: string): TransactionsResult {
  const { data, error } = useLiveQuery(listTransactionsQuery(ownerId));

  if (error) throw error;

  return { transactions: data ?? [], isLoading: data === undefined };
}

export type PeriodResult = PeriodSummary & { range: DateRange };

/** Resumo do ciclo financeiro que contém a data de referência. */
export function usePeriodSummary(
  transactions: readonly Transaction[],
  cycleStartDay: number,
  reference: string = today(),
): PeriodResult {
  return useMemo(() => {
    const range = cycleRangeFor(reference, cycleStartDay);

    const summary = summarizePeriod(
      transactions.map((item) => ({
        kind: item.kind as 'income' | 'expense' | 'transfer',
        amount: cents(item.amount),
        date: item.date,
        status: item.status,
      })),
      range,
    );

    return { ...summary, range };
  }, [transactions, cycleStartDay, reference]);
}
