import { cents } from '@/lib/money';

import { type SummaryEntry } from '../summary';
import {
  categorySlices,
  compare,
  comparePeriods,
  cumulativeByDay,
} from '../trends';

const PERIOD = { start: '2026-03-01', end: '2026-03-31' };
const PREVIOUS = { start: '2026-02-01', end: '2026-02-28' };

function entry(partial: Partial<SummaryEntry> = {}): SummaryEntry {
  return {
    kind: 'expense',
    amount: cents(1000),
    date: '2026-03-10',
    status: 'settled',
    ...partial,
  };
}

describe('compare', () => {
  it('calcula a diferença absoluta e a relativa', () => {
    const result = compare(cents(150_00), cents(100_00));

    expect(result.variation).toBe(50_00);
    expect(result.ratio).toBeCloseTo(0.5, 5);
  });

  it('devolve variação relativa nula quando o anterior foi zero', () => {
    // Dividir por zero daria infinito, e "aumentou infinito por cento" não
    // informa nada a quem lê.
    expect(compare(cents(100_00), cents(0)).ratio).toBeNull();
  });

  it('usa o módulo do anterior, para queda a partir de negativo não inverter', () => {
    const result = compare(cents(-50_00), cents(-100_00));

    expect(result.variation).toBe(50_00);
    expect(result.ratio).toBeCloseTo(0.5, 5);
  });
});

describe('comparePeriods', () => {
  it('separa os lançamentos de cada período', () => {
    const entries = [
      entry({ kind: 'income', amount: cents(300_00), date: '2026-03-05' }),
      entry({ kind: 'expense', amount: cents(100_00), date: '2026-03-06' }),
      entry({ kind: 'income', amount: cents(200_00), date: '2026-02-05' }),
      entry({ kind: 'expense', amount: cents(50_00), date: '2026-02-06' }),
    ];

    const result = comparePeriods(entries, PERIOD, PREVIOUS);

    expect(result.income.current).toBe(300_00);
    expect(result.income.previous).toBe(200_00);
    expect(result.expense.variation).toBe(50_00);
    expect(result.result.current).toBe(200_00);
    expect(result.result.previous).toBe(150_00);
  });
});

describe('cumulativeByDay', () => {
  it('começa em zero no primeiro dia do período', () => {
    const points = cumulativeByDay([], PERIOD);

    expect(points[0]).toEqual({ date: '2026-03-01', cumulative: 0 });
  });

  it('acumula receitas e despesas em ordem de data', () => {
    const points = cumulativeByDay(
      [
        entry({ kind: 'income', amount: cents(500_00), date: '2026-03-05' }),
        entry({ kind: 'expense', amount: cents(200_00), date: '2026-03-10' }),
        entry({ kind: 'expense', amount: cents(100_00), date: '2026-03-10' }),
      ],
      PERIOD,
    );

    expect(points).toEqual([
      { date: '2026-03-01', cumulative: 0 },
      { date: '2026-03-05', cumulative: 500_00 },
      { date: '2026-03-10', cumulative: 200_00 },
      { date: '2026-03-31', cumulative: 200_00 },
    ]);
  });

  it('fecha o período mesmo sem movimento no último dia', () => {
    const points = cumulativeByDay(
      [entry({ kind: 'income', amount: cents(100_00), date: '2026-03-05' })],
      PERIOD,
    );

    expect(points[points.length - 1]).toEqual({
      date: '2026-03-31',
      cumulative: 100_00,
    });
  });

  it('não duplica o último ponto quando houve movimento no dia do fim', () => {
    const points = cumulativeByDay(
      [entry({ kind: 'income', amount: cents(100_00), date: '2026-03-31' })],
      PERIOD,
    );

    expect(points).toHaveLength(2);
    expect(points[1]).toEqual({ date: '2026-03-31', cumulative: 100_00 });
  });

  it('ignora transferências e lançamentos cancelados', () => {
    const points = cumulativeByDay(
      [
        entry({ kind: 'transfer', amount: cents(900_00), date: '2026-03-05' }),
        entry({
          kind: 'expense',
          amount: cents(900_00),
          date: '2026-03-06',
          status: 'canceled',
        }),
      ],
      PERIOD,
    );

    expect(points).toEqual([
      { date: '2026-03-01', cumulative: 0 },
      { date: '2026-03-31', cumulative: 0 },
    ]);
  });

  it('ignora o que está fora do período', () => {
    const points = cumulativeByDay(
      [entry({ kind: 'expense', amount: cents(100_00), date: '2026-02-28' })],
      PERIOD,
    );

    expect(points).toEqual([
      { date: '2026-03-01', cumulative: 0 },
      { date: '2026-03-31', cumulative: 0 },
    ]);
  });
});

describe('categorySlices', () => {
  const label = (id: string) => `Categoria ${id}`;

  it('devolve lista vazia quando não há despesa', () => {
    expect(categorySlices([], label)).toEqual([]);
  });

  it('ordena da maior para a menor e calcula a participação', () => {
    const slices = categorySlices(
      [
        { categoryId: 'a', total: cents(25_00) },
        { categoryId: 'b', total: cents(75_00) },
      ],
      label,
    );

    expect(slices.map((slice) => slice.categoryId)).toEqual(['b', 'a']);
    expect(slices[0]?.share).toBeCloseTo(0.75, 5);
    expect(slices[1]?.share).toBeCloseTo(0.25, 5);
  });

  it('agrupa o excedente em uma fatia de outras', () => {
    const totals = Array.from({ length: 8 }, (_unused, index) => ({
      categoryId: `c${index}`,
      total: cents((8 - index) * 10_00),
    }));

    const slices = categorySlices(totals, label, 3);

    expect(slices).toHaveLength(4);
    expect(slices[3]?.categoryId).toBe('outras');
    // As cinco categorias restantes: 50 + 40 + 30 + 20 + 10.
    expect(slices[3]?.total).toBe(150_00);
  });

  it('mantém a soma das participações em um inteiro', () => {
    const slices = categorySlices(
      [
        { categoryId: 'a', total: cents(33_33) },
        { categoryId: 'b', total: cents(33_33) },
        { categoryId: 'c', total: cents(33_34) },
      ],
      label,
    );

    const sum = slices.reduce((acc, slice) => acc + slice.share, 0);
    expect(sum).toBeCloseTo(1, 10);
  });
});
