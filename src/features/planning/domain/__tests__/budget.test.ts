import { cents } from '@/lib/money';

import {
  budgetProgress,
  type BudgetDefinition,
  type SpendingEntry,
} from '../budget';

const RANGE = { start: '2026-03-01', end: '2026-03-31' };

function budget(partial: Partial<BudgetDefinition> = {}): BudgetDefinition {
  return {
    id: 'b1',
    name: 'Mercado',
    plannedAmount: cents(500_00),
    scope: 'category',
    scopeId: 'cat-mercado',
    alertThreshold: 8_000,
    ...partial,
  };
}

function entry(partial: Partial<SpendingEntry> = {}): SpendingEntry {
  return {
    amount: cents(100_00),
    date: '2026-03-10',
    status: 'settled',
    kind: 'expense',
    categoryId: 'cat-mercado',
    accountId: 'acc-1',
    ...partial,
  };
}

describe('budgetProgress', () => {
  it('soma apenas as despesas da categoria do orçamento', () => {
    const result = budgetProgress(
      budget(),
      [entry(), entry({ categoryId: 'cat-outra' })],
      RANGE,
    );

    expect(result.spent).toBe(100_00);
  });

  it('ignora receitas, transferências e cancelados', () => {
    const result = budgetProgress(
      budget(),
      [
        entry({ kind: 'income' }),
        entry({ kind: 'transfer' }),
        entry({ status: 'canceled' }),
      ],
      RANGE,
    );

    expect(result.spent).toBe(0);
  });

  it('ignora o que está fora do período', () => {
    const result = budgetProgress(
      budget(),
      [entry({ date: '2026-02-28' }), entry({ date: '2026-04-01' })],
      RANGE,
    );

    expect(result.spent).toBe(0);
  });

  it('calcula o que ainda cabe', () => {
    const result = budgetProgress(budget(), [entry()], RANGE);

    expect(result.remaining).toBe(400_00);
    expect(result.overspent).toBe(0);
    expect(result.status).toBe('within');
  });

  it('avisa quando chega ao limiar de alerta', () => {
    const result = budgetProgress(
      budget(),
      [entry({ amount: cents(400_00) })],
      RANGE,
    );

    expect(result.usage).toBeCloseTo(0.8, 5);
    expect(result.status).toBe('approaching');
  });

  it('não devolve sobra negativa quando estoura', () => {
    // "Restam −R$ 80,00" obriga quem lê a fazer a conta de cabeça.
    const result = budgetProgress(
      budget(),
      [entry({ amount: cents(580_00) })],
      RANGE,
    );

    expect(result.remaining).toBe(0);
    expect(result.overspent).toBe(80_00);
    expect(result.status).toBe('exceeded');
  });

  it('considera estouro apenas acima do teto, não no valor exato', () => {
    const result = budgetProgress(
      budget(),
      [entry({ amount: cents(500_00) })],
      RANGE,
    );

    expect(result.status).toBe('approaching');
    expect(result.overspent).toBe(0);
    expect(result.remaining).toBe(0);
  });

  it('orçamento por conta filtra pela conta', () => {
    const result = budgetProgress(
      budget({ scope: 'account', scopeId: 'acc-1' }),
      [entry(), entry({ accountId: 'acc-2' })],
      RANGE,
    );

    expect(result.spent).toBe(100_00);
  });

  it('orçamento geral soma todas as despesas', () => {
    const result = budgetProgress(
      budget({ scope: 'overall', scopeId: null }),
      [entry(), entry({ categoryId: 'cat-outra', accountId: 'acc-9' })],
      RANGE,
    );

    expect(result.spent).toBe(200_00);
  });

  it('não divide por zero em orçamento sem valor planejado', () => {
    const result = budgetProgress(
      budget({ plannedAmount: cents(0) }),
      [entry()],
      RANGE,
    );

    expect(result.usage).toBe(0);
    expect(result.status).toBe('exceeded');
  });
});
