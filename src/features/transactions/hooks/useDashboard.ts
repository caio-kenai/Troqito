import { useMemo } from 'react';

import {
  cycleRangeFor,
  fromCalendarDate,
  toCalendarDate,
  today,
  type DateRange,
} from '@/lib/date';
import { cents, type Cents } from '@/lib/money';

import { expensesByCategory, type SummaryEntry } from '../domain/summary';
import {
  categorySlices,
  comparePeriods,
  cumulativeByDay,
  type CategorySlice,
  type PeriodComparison,
} from '../domain/trends';
import { type Transaction } from '../repository/transactionsRepository';

export type Dashboard = {
  range: DateRange;
  previousRange: DateRange;
  comparison: PeriodComparison;
  /** Resultado acumulado ao longo do período, para o gráfico de evolução. */
  trend: Cents[];
  slices: CategorySlice[];
};

/** Período imediatamente anterior ao que contém a referência. */
function previousCycle(range: DateRange, cycleStartDay: number): DateRange {
  const dayBefore = fromCalendarDate(range.start);
  dayBefore.setDate(dayBefore.getDate() - 1);

  return cycleRangeFor(toCalendarDate(dayBefore), cycleStartDay);
}

/**
 * Recebe o mapa de categorias, e não uma função que traduz identificadores.
 *
 * Uma função criada na tela muda de identidade a cada render e refaria a conta
 * toda vez. O mapa vem memoizado de `useCategories` e é estável.
 */
export function useDashboard(
  transactions: readonly Transaction[],
  cycleStartDay: number,
  categoriesById: ReadonlyMap<string, { name: string }>,
  reference: string = today(),
): Dashboard {
  return useMemo(() => {
    const range = cycleRangeFor(reference, cycleStartDay);
    const previousRange = previousCycle(range, cycleStartDay);

    const entries: (SummaryEntry & { categoryId: string | null })[] =
      transactions.map((item) => ({
        kind: item.kind as 'income' | 'expense' | 'transfer',
        amount: cents(item.amount),
        date: item.date,
        status: item.status,
        categoryId: item.categoryId,
      }));

    const totals = expensesByCategory(entries, range);

    return {
      range,
      previousRange,
      comparison: comparePeriods(entries, range, previousRange),
      trend: cumulativeByDay(entries, range).map((point) => point.cumulative),
      slices: categorySlices(
        totals,
        (categoryId) => categoriesById.get(categoryId)?.name ?? 'Sem categoria',
      ),
    };
  }, [transactions, cycleStartDay, reference, categoriesById]);
}
