import { cents } from '@/lib/money';

import { buildReport, lastMonthsRange, type ReportEntry } from '../report';

const RANGE = { start: '2026-01-01', end: '2026-03-31' };

function entry(partial: Partial<ReportEntry> = {}): ReportEntry {
  return {
    kind: 'expense',
    status: 'settled',
    amount: cents(100_00),
    date: '2026-02-10',
    categoryId: 'cat-1',
    accountId: 'acc-1',
    ...partial,
  };
}

describe('buildReport', () => {
  it('separa receitas de despesas', () => {
    const report = buildReport(
      [
        entry({ kind: 'income', amount: cents(500_00) }),
        entry({ amount: cents(200_00) }),
      ],
      RANGE,
    );

    expect(report.income).toBe(500_00);
    expect(report.expense).toBe(200_00);
    expect(report.result).toBe(300_00);
  });

  it('exclui transferências e cancelados', () => {
    const report = buildReport(
      [
        entry({ kind: 'transfer', amount: cents(900_00) }),
        entry({ status: 'canceled', amount: cents(900_00) }),
      ],
      RANGE,
    );

    expect(report.count).toBe(0);
    expect(report.expense).toBe(0);
  });

  it('exclui o que está fora do período', () => {
    const report = buildReport([entry({ date: '2025-12-31' })], RANGE);

    expect(report.count).toBe(0);
  });

  it('agrupa por categoria e ordena pelo maior movimento', () => {
    const report = buildReport(
      [
        entry({ categoryId: 'pequena', amount: cents(10_00) }),
        entry({ categoryId: 'grande', amount: cents(900_00) }),
      ],
      RANGE,
    );

    expect(report.byCategory[0]?.key).toBe('grande');
  });

  it('agrupa quem não tem categoria em um grupo próprio', () => {
    const report = buildReport([entry({ categoryId: null })], RANGE);

    expect(report.byCategory[0]?.key).toBe('sem-categoria');
  });

  it('agrupa por conta', () => {
    const report = buildReport(
      [entry({ accountId: 'acc-1' }), entry({ accountId: 'acc-2' })],
      RANGE,
    );

    expect(report.byAccount).toHaveLength(2);
  });

  it('agrupa por mês em ordem cronológica', () => {
    const report = buildReport(
      [
        entry({ date: '2026-03-05' }),
        entry({ date: '2026-01-05' }),
        entry({ date: '2026-02-05' }),
      ],
      RANGE,
    );

    expect(report.byMonth.map((month) => month.key)).toEqual([
      '2026-01',
      '2026-02',
      '2026-03',
    ]);
  });

  it('conta quantos lançamentos entraram em cada grupo', () => {
    const report = buildReport([entry(), entry(), entry()], RANGE);

    expect(report.byCategory[0]?.count).toBe(3);
  });

  it('calcula o resultado de cada grupo', () => {
    const report = buildReport(
      [
        entry({ kind: 'income', amount: cents(300_00), categoryId: 'c' }),
        entry({ amount: cents(100_00), categoryId: 'c' }),
      ],
      RANGE,
    );

    expect(report.byCategory[0]?.result).toBe(200_00);
  });

  it('devolve relatório vazio sem erro quando não há lançamento', () => {
    const report = buildReport([], RANGE);

    expect(report).toMatchObject({
      income: 0,
      expense: 0,
      result: 0,
      count: 0,
      byCategory: [],
      byAccount: [],
      byMonth: [],
    });
  });
});

describe('lastMonthsRange', () => {
  it('cobre os últimos meses até o fim do mês da referência', () => {
    expect(lastMonthsRange('2026-03-15', 3)).toEqual({
      start: '2026-01-01',
      end: '2026-03-31',
    });
  });

  it('atravessa a virada do ano', () => {
    expect(lastMonthsRange('2026-02-10', 6)).toEqual({
      start: '2025-09-01',
      end: '2026-02-28',
    });
  });

  it('respeita fevereiro em ano bissexto', () => {
    expect(lastMonthsRange('2028-02-10', 1).end).toBe('2028-02-29');
  });

  it('um mês devolve o próprio mês inteiro', () => {
    expect(lastMonthsRange('2026-07-20', 1)).toEqual({
      start: '2026-07-01',
      end: '2026-07-31',
    });
  });

  it('doze meses cobrem o ano fechado', () => {
    expect(lastMonthsRange('2026-12-31', 12)).toEqual({
      start: '2026-01-01',
      end: '2026-12-31',
    });
  });
});
