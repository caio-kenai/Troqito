import { differenceInCalendarMonths } from 'date-fns';

import { fromCalendarDate, type CalendarDate } from '@/lib/date';
import { add, type Cents, subtract, ZERO } from '@/lib/money';

export type GoalDefinition = {
  id: string;
  name: string;
  targetAmount: Cents;
  targetDate: CalendarDate | null;
};

export type Contribution = {
  /** Positivo aporta, negativo resgata. */
  amount: Cents;
  date: CalendarDate;
};

export type GoalProgress = {
  goal: GoalDefinition;
  saved: Cents;
  /** Quanto falta. Zero quando a meta foi alcançada. */
  missing: Cents;
  /** Fração alcançada, de 0 a 1. Passa de 1 quando se guarda além do alvo. */
  progress: number;
  achieved: boolean;
  /**
   * Quanto guardar por mês para chegar na data-alvo. Nulo quando não há data,
   * quando o prazo já passou ou quando a meta já foi alcançada — nesses casos
   * qualquer número seria inventado.
   */
  monthlyNeeded: Cents | null;
};

export function goalProgress(
  goal: GoalDefinition,
  contributions: readonly Contribution[],
  reference: CalendarDate,
): GoalProgress {
  const saved = contributions.reduce(
    (acc, contribution) => add(acc, contribution.amount),
    ZERO,
  );

  const achieved = saved >= goal.targetAmount;
  const missing = achieved ? ZERO : subtract(goal.targetAmount, saved);

  const progress =
    goal.targetAmount <= 0 ? 0 : Math.max(0, saved / goal.targetAmount);

  return {
    goal,
    saved,
    missing,
    progress,
    achieved,
    monthlyNeeded: monthlyNeeded(goal, missing, achieved, reference),
  };
}

function monthlyNeeded(
  goal: GoalDefinition,
  missing: Cents,
  achieved: boolean,
  reference: CalendarDate,
): Cents | null {
  if (achieved || goal.targetDate === null) return null;
  if (goal.targetDate <= reference) return null;

  const months = differenceInCalendarMonths(
    fromCalendarDate(goal.targetDate),
    fromCalendarDate(reference),
  );

  // Falta menos de um mês inteiro: o que falta precisa ser guardado agora, e
  // dividir por zero devolveria infinito.
  if (months < 1) return missing;

  // Arredondar para cima: guardar o valor exato dividido deixaria centavos
  // faltando no último mês e a meta não fecharia.
  return Math.ceil(missing / months) as Cents;
}

/** Estado de uma meta para efeito de ordenação e destaque na tela. */
export function goalUrgency(
  progress: GoalProgress,
  reference: CalendarDate,
): 'achieved' | 'overdue' | 'active' {
  if (progress.achieved) return 'achieved';
  if (progress.goal.targetDate && progress.goal.targetDate < reference) {
    return 'overdue';
  }
  return 'active';
}
