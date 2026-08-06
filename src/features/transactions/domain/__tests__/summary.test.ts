import { cents } from '@/lib/money';

import {
  expensesByCategory,
  summarizePeriod,
  type SummaryEntry,
} from '../summary';

const PERIOD = { start: '2026-03-01', end: '2026-03-31' };

const entry = (
  kind: SummaryEntry['kind'],
  amount: number,
  date: string,
  status = 'settled',
): SummaryEntry => ({ kind, amount: cents(amount), date, status });

describe('summarizePeriod', () => {
  it('devolve zeros quando não há lançamento', () => {
    expect(summarizePeriod([], PERIOD)).toEqual({
      income: 0,
      expense: 0,
      result: 0,
    });
  });

  it('soma receitas e despesas do período', () => {
    const summary = summarizePeriod(
      [
        entry('income', 420_000, '2026-03-05'),
        entry('expense', 187_045, '2026-03-10'),
        entry('expense', 9_990, '2026-03-28'),
      ],
      PERIOD,
    );

    expect(summary).toEqual({
      income: 420_000,
      expense: 197_035,
      result: 222_965,
    });
  });

  // A regra que mais distingue um app maduro de um imaturo.
  it('ignora transferências, que não são receita nem despesa', () => {
    const summary = summarizePeriod(
      [
        entry('income', 100_000, '2026-03-05'),
        entry('transfer', 50_000, '2026-03-06'),
        entry('transfer', 50_000, '2026-03-06'),
      ],
      PERIOD,
    );

    expect(summary).toEqual({ income: 100_000, expense: 0, result: 100_000 });
  });

  it('ignora lançamentos cancelados', () => {
    const summary = summarizePeriod(
      [
        entry('expense', 10_000, '2026-03-05'),
        entry('expense', 90_000, '2026-03-06', 'canceled'),
      ],
      PERIOD,
    );

    expect(summary.expense).toBe(10_000);
  });

  it('inclui lançamentos previstos, que compõem o planejamento', () => {
    const summary = summarizePeriod(
      [entry('expense', 10_000, '2026-03-05', 'planned')],
      PERIOD,
    );

    expect(summary.expense).toBe(10_000);
  });

  it('respeita os limites do período, inclusive as bordas', () => {
    const summary = summarizePeriod(
      [
        entry('expense', 100, '2026-02-28'),
        entry('expense', 200, '2026-03-01'),
        entry('expense', 400, '2026-03-31'),
        entry('expense', 800, '2026-04-01'),
      ],
      PERIOD,
    );

    expect(summary.expense).toBe(600);
  });

  it('devolve resultado negativo quando se gasta mais do que entra', () => {
    const summary = summarizePeriod(
      [
        entry('income', 100_000, '2026-03-05'),
        entry('expense', 150_000, '2026-03-06'),
      ],
      PERIOD,
    );

    expect(summary.result).toBe(-50_000);
  });

  it('mantém a identidade entre receitas, despesas e resultado', () => {
    const summary = summarizePeriod(
      [
        entry('income', 333_333, '2026-03-05'),
        entry('income', 1, '2026-03-06'),
        entry('expense', 111_111, '2026-03-07'),
      ],
      PERIOD,
    );

    expect(summary.income - summary.expense).toBe(summary.result);
  });
});

describe('expensesByCategory', () => {
  const withCategory = (
    amount: number,
    categoryId: string | null,
    date = '2026-03-10',
    kind: SummaryEntry['kind'] = 'expense',
    status = 'settled',
  ) => ({ ...entry(kind, amount, date, status), categoryId });

  it('agrupa e ordena do maior para o menor', () => {
    const totals = expensesByCategory(
      [
        withCategory(10_000, 'mercado'),
        withCategory(30_000, 'moradia'),
        withCategory(5_000, 'mercado'),
      ],
      PERIOD,
    );

    expect(totals).toEqual([
      { categoryId: 'moradia', total: 30_000 },
      { categoryId: 'mercado', total: 15_000 },
    ]);
  });

  it('agrupa lançamentos sem categoria em um balde próprio', () => {
    const totals = expensesByCategory([withCategory(7_000, null)], PERIOD);

    expect(totals).toEqual([{ categoryId: 'sem-categoria', total: 7_000 }]);
  });

  it('considera apenas despesas', () => {
    const totals = expensesByCategory(
      [
        withCategory(10_000, 'salario', '2026-03-05', 'income'),
        withCategory(3_000, 'mercado'),
      ],
      PERIOD,
    );

    expect(totals).toEqual([{ categoryId: 'mercado', total: 3_000 }]);
  });
});
