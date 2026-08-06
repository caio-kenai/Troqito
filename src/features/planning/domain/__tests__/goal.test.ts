import { cents } from '@/lib/money';

import { goalProgress, goalUrgency, type GoalDefinition } from '../goal';

const HOJE = '2026-03-15';

function goal(partial: Partial<GoalDefinition> = {}): GoalDefinition {
  return {
    id: 'g1',
    name: 'Viagem',
    targetAmount: cents(5_000_00),
    targetDate: '2026-09-15',
    ...partial,
  };
}

describe('goalProgress', () => {
  it('soma os aportes', () => {
    const result = goalProgress(
      goal(),
      [
        { amount: cents(500_00), date: '2026-01-10' },
        { amount: cents(300_00), date: '2026-02-10' },
      ],
      HOJE,
    );

    expect(result.saved).toBe(800_00);
    expect(result.missing).toBe(4_200_00);
  });

  it('subtrai resgates, que entram como valor negativo', () => {
    const result = goalProgress(
      goal(),
      [
        { amount: cents(500_00), date: '2026-01-10' },
        { amount: cents(-200_00), date: '2026-02-10' },
      ],
      HOJE,
    );

    expect(result.saved).toBe(300_00);
  });

  it('marca como alcançada quando chega ao alvo', () => {
    const result = goalProgress(
      goal(),
      [{ amount: cents(5_000_00), date: '2026-02-10' }],
      HOJE,
    );

    expect(result.achieved).toBe(true);
    expect(result.missing).toBe(0);
    expect(result.monthlyNeeded).toBeNull();
  });

  it('passa de cem por cento quando se guarda além do alvo', () => {
    const result = goalProgress(
      goal(),
      [{ amount: cents(6_000_00), date: '2026-02-10' }],
      HOJE,
    );

    expect(result.progress).toBeCloseTo(1.2, 5);
  });

  it('calcula quanto guardar por mês até a data-alvo', () => {
    // Faltam seis meses e R$ 3.000,00: R$ 500,00 por mês.
    const result = goalProgress(
      goal(),
      [{ amount: cents(2_000_00), date: '2026-01-10' }],
      HOJE,
    );

    expect(result.monthlyNeeded).toBe(500_00);
  });

  it('arredonda o aporte mensal para cima', () => {
    // Arredondar para baixo deixaria centavos faltando no último mês.
    const result = goalProgress(
      goal({ targetAmount: cents(10_00), targetDate: '2026-06-15' }),
      [],
      HOJE,
    );

    expect(result.monthlyNeeded).toBe(334);
  });

  it('não devolve aporte mensal sem data-alvo', () => {
    const result = goalProgress(goal({ targetDate: null }), [], HOJE);

    expect(result.monthlyNeeded).toBeNull();
  });

  it('não devolve aporte mensal quando o prazo já passou', () => {
    // Qualquer número aqui seria inventado.
    const result = goalProgress(goal({ targetDate: '2026-01-01' }), [], HOJE);

    expect(result.monthlyNeeded).toBeNull();
  });

  it('pede tudo de uma vez quando falta menos de um mês', () => {
    const result = goalProgress(
      goal({ targetDate: '2026-03-30', targetAmount: cents(100_00) }),
      [],
      HOJE,
    );

    expect(result.monthlyNeeded).toBe(100_00);
  });

  it('não divide por zero em meta sem valor-alvo', () => {
    const result = goalProgress(goal({ targetAmount: cents(0) }), [], HOJE);

    expect(result.progress).toBe(0);
    expect(result.achieved).toBe(true);
  });
});

describe('goalUrgency', () => {
  it('marca a meta alcançada', () => {
    const progress = goalProgress(
      goal(),
      [{ amount: cents(5_000_00), date: '2026-01-01' }],
      HOJE,
    );

    expect(goalUrgency(progress, HOJE)).toBe('achieved');
  });

  it('marca a meta cujo prazo passou sem ser alcançada', () => {
    const progress = goalProgress(goal({ targetDate: '2026-01-01' }), [], HOJE);

    expect(goalUrgency(progress, HOJE)).toBe('overdue');
  });

  it('marca a meta em andamento', () => {
    expect(goalUrgency(goalProgress(goal(), [], HOJE), HOJE)).toBe('active');
  });
});
