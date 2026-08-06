import { type CalendarDate, type DateRange } from '@/lib/date';
import { add, type Cents, subtract, ZERO } from '@/lib/money';

export type ReportEntry = {
  kind: string;
  status: string;
  amount: Cents;
  date: CalendarDate;
  categoryId: string | null;
  accountId: string | null;
};

export type GroupTotal = {
  key: string;
  income: Cents;
  expense: Cents;
  result: Cents;
  /** Quantos lançamentos entraram no grupo. */
  count: number;
};

export type Report = {
  range: DateRange;
  income: Cents;
  expense: Cents;
  result: Cents;
  count: number;
  byCategory: GroupTotal[];
  byAccount: GroupTotal[];
  byMonth: GroupTotal[];
};

/** Transferência e cancelado ficam fora de todo relatório de resultado. */
function relevant(entry: ReportEntry, { start, end }: DateRange): boolean {
  if (entry.kind === 'transfer') return false;
  if (entry.status === 'canceled') return false;
  return entry.date >= start && entry.date <= end;
}

function group(
  entries: readonly ReportEntry[],
  keyOf: (entry: ReportEntry) => string,
): GroupTotal[] {
  const totals = new Map<string, GroupTotal>();

  for (const entry of entries) {
    const key = keyOf(entry);
    const current = totals.get(key) ?? {
      key,
      income: ZERO,
      expense: ZERO,
      result: ZERO,
      count: 0,
    };

    const income =
      entry.kind === 'income'
        ? add(current.income, entry.amount)
        : current.income;
    const expense =
      entry.kind === 'expense'
        ? add(current.expense, entry.amount)
        : current.expense;

    totals.set(key, {
      key,
      income,
      expense,
      result: subtract(income, expense),
      count: current.count + 1,
    });
  }

  // Maior movimento primeiro: é o que a pessoa procura ao abrir um relatório.
  return [...totals.values()].sort(
    (a, b) => b.income + b.expense - (a.income + a.expense),
  );
}

/**
 * Relatório do período, com os recortes que respondem às perguntas mais
 * frequentes: em que gastei, de onde saiu, e como foi mês a mês.
 */
export function buildReport(
  entries: readonly ReportEntry[],
  range: DateRange,
): Report {
  const relevantEntries = entries.filter((entry) => relevant(entry, range));

  const income = relevantEntries
    .filter((entry) => entry.kind === 'income')
    .reduce((acc, entry) => add(acc, entry.amount), ZERO);

  const expense = relevantEntries
    .filter((entry) => entry.kind === 'expense')
    .reduce((acc, entry) => add(acc, entry.amount), ZERO);

  return {
    range,
    income,
    expense,
    result: subtract(income, expense),
    count: relevantEntries.length,
    byCategory: group(
      relevantEntries,
      (entry) => entry.categoryId ?? 'sem-categoria',
    ),
    byAccount: group(
      relevantEntries,
      (entry) => entry.accountId ?? 'sem-conta',
    ),
    byMonth: group(relevantEntries, (entry) => entry.date.slice(0, 7)).sort(
      (a, b) => a.key.localeCompare(b.key),
    ),
  };
}

/** Período de N meses terminando no mês da referência, inclusive. */
export function lastMonthsRange(
  reference: CalendarDate,
  months: number,
): DateRange {
  const [yearText, monthText] = reference.split('-');
  const year = Number(yearText);
  const month = Number(monthText);

  // O mês da referência entra na conta: "últimos três meses" em março são
  // janeiro, fevereiro e março, e não dezembro a fevereiro.
  const startMonthIndex = month - months + 1;
  const startYear = year + Math.floor((startMonthIndex - 1) / 12);
  const startMonth = ((((startMonthIndex - 1) % 12) + 12) % 12) + 1;

  const lastDay = new Date(year, month, 0).getDate();

  return {
    start: `${startYear}-${String(startMonth).padStart(2, '0')}-01`,
    end: `${year}-${monthText}-${String(lastDay).padStart(2, '0')}`,
  };
}
