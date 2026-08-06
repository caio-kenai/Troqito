import { type TransactionKind } from '@/database/schema/common';
import { type CalendarDate } from '@/lib/date';
import { add, type Cents, subtract, ZERO } from '@/lib/money';

export type SummaryEntry = {
  kind: TransactionKind;
  amount: Cents;
  date: CalendarDate;
  status: string;
};

export type PeriodSummary = {
  income: Cents;
  expense: Cents;
  /** Receitas menos despesas. Negativo indica que se gastou mais do que entrou. */
  result: Cents;
};

/**
 * Resumo de um período.
 *
 * Transferências ficam de fora: mover dinheiro entre contas próprias não é
 * receita nem despesa, e contabilizá-las infla os dois totais do mês sem que
 * nada tenha entrado ou saído do patrimônio.
 *
 * Lançamentos cancelados também ficam de fora — foram registrados e desfeitos.
 */
export function summarizePeriod(
  entries: readonly SummaryEntry[],
  { start, end }: { start: CalendarDate; end: CalendarDate },
): PeriodSummary {
  let income = ZERO;
  let expense = ZERO;

  for (const entry of entries) {
    if (entry.date < start || entry.date > end) continue;
    if (entry.kind === 'transfer') continue;
    if (entry.status === 'canceled') continue;

    if (entry.kind === 'income') {
      income = add(income, entry.amount);
    } else {
      expense = add(expense, entry.amount);
    }
  }

  return { income, expense, result: subtract(income, expense) };
}

export type CategoryTotal = {
  categoryId: string;
  total: Cents;
};

/**
 * Total gasto por categoria, do maior para o menor. Serve ao gráfico de
 * distribuição e à lista de maiores despesas do dashboard.
 */
export function expensesByCategory(
  entries: readonly (SummaryEntry & { categoryId: string | null })[],
  { start, end }: { start: CalendarDate; end: CalendarDate },
): CategoryTotal[] {
  const totals = new Map<string, Cents>();

  for (const entry of entries) {
    if (entry.kind !== 'expense') continue;
    if (entry.status === 'canceled') continue;
    if (entry.date < start || entry.date > end) continue;

    const key = entry.categoryId ?? 'sem-categoria';
    totals.set(key, add(totals.get(key) ?? ZERO, entry.amount));
  }

  return [...totals.entries()]
    .map(([categoryId, total]) => ({ categoryId, total }))
    .sort((a, b) => b.total - a.total);
}
