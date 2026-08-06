import { type CalendarDate, type DateRange } from '@/lib/date';
import { add, type Cents, negate, subtract, ZERO } from '@/lib/money';

import { type SummaryEntry, summarizePeriod } from './summary';

/**
 * Comparação entre dois períodos.
 *
 * `variation` é a diferença absoluta, em centavos. `ratio` é a variação
 * relativa, e vem nulo quando o período anterior foi zero — dividir por zero
 * daria infinito, e "aumentou infinito por cento" não informa nada.
 */
export type Comparison = {
  current: Cents;
  previous: Cents;
  variation: Cents;
  ratio: number | null;
};

export function compare(current: Cents, previous: Cents): Comparison {
  return {
    current,
    previous,
    variation: subtract(current, previous),
    ratio: previous === 0 ? null : (current - previous) / Math.abs(previous),
  };
}

export type PeriodComparison = {
  income: Comparison;
  expense: Comparison;
  result: Comparison;
};

/** Compara receitas, despesas e resultado entre o período atual e o anterior. */
export function comparePeriods(
  entries: readonly SummaryEntry[],
  current: DateRange,
  previous: DateRange,
): PeriodComparison {
  const now = summarizePeriod(entries, current);
  const before = summarizePeriod(entries, previous);

  return {
    income: compare(now.income, before.income),
    expense: compare(now.expense, before.expense),
    result: compare(now.result, before.result),
  };
}

export type DailyPoint = {
  date: CalendarDate;
  /** Resultado acumulado do início do período até este dia, inclusive. */
  cumulative: Cents;
};

/**
 * Resultado acumulado dia a dia dentro do período.
 *
 * Só aparecem os dias em que houve movimento, mais o primeiro e o último do
 * período. Um ponto por dia de calendário encheria o gráfico de trechos retos
 * sem informação e deixaria o traçado ilegível em um mês inteiro.
 */
export function cumulativeByDay(
  entries: readonly SummaryEntry[],
  { start, end }: DateRange,
): DailyPoint[] {
  const perDay = new Map<CalendarDate, Cents>();

  for (const entry of entries) {
    if (entry.date < start || entry.date > end) continue;
    if (entry.kind === 'transfer') continue;
    if (entry.status === 'canceled') continue;

    const signed =
      entry.kind === 'income' ? entry.amount : negate(entry.amount);

    perDay.set(entry.date, add(perDay.get(entry.date) ?? ZERO, signed));
  }

  const days = [...perDay.keys()].sort();
  const points: DailyPoint[] = [{ date: start, cumulative: ZERO }];

  let running = ZERO;
  for (const day of days) {
    running = add(running, perDay.get(day) ?? ZERO);
    points.push({ date: day, cumulative: running });
  }

  // O último ponto fecha o período mesmo sem movimento no dia, para o gráfico
  // não terminar no meio do mês e dar a impressão de que os dados acabaram.
  const last = points[points.length - 1];
  if (last && last.date !== end) {
    points.push({ date: end, cumulative: running });
  }

  return points;
}

export type CategorySlice = {
  categoryId: string;
  label: string;
  total: Cents;
  /** Fração do total de despesas, de 0 a 1. */
  share: number;
};

/**
 * Fatias de despesa por categoria, já com a participação calculada.
 *
 * As categorias além do limite viram uma fatia "Outras": um gráfico com vinte
 * fatias não é lido, é decorado.
 */
export function categorySlices(
  totals: readonly { categoryId: string; total: Cents }[],
  labelOf: (categoryId: string) => string,
  limit = 5,
): CategorySlice[] {
  const grandTotal = totals.reduce((acc, item) => acc + item.total, 0);
  if (grandTotal === 0) return [];

  const ordered = [...totals].sort((a, b) => b.total - a.total);
  const head = ordered.slice(0, limit);
  const tail = ordered.slice(limit);

  const slices: CategorySlice[] = head.map((item) => ({
    categoryId: item.categoryId,
    label: labelOf(item.categoryId),
    total: item.total,
    share: item.total / grandTotal,
  }));

  if (tail.length > 0) {
    const rest = tail.reduce((acc, item) => add(acc, item.total), ZERO);
    slices.push({
      categoryId: 'outras',
      label: 'Outras',
      total: rest,
      share: rest / grandTotal,
    });
  }

  return slices;
}
