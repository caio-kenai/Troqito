import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';

import { cycleRangeFor, today, type CalendarDate } from '@/lib/date';
import { cents } from '@/lib/money';

import {
  budgetProgress,
  type BudgetProgress,
  type SpendingEntry,
} from '../domain/budget';
import { goalProgress, type GoalProgress } from '../domain/goal';
import {
  listBudgetsQuery,
  listContributionsQuery,
  listGoalsQuery,
} from '../repository/planningRepository';

export type BudgetsResult = {
  budgets: BudgetProgress[];
  isLoading: boolean;
};

export function useBudgets(
  ownerId: string,
  entries: readonly SpendingEntry[],
  cycleStartDay: number,
  reference: CalendarDate = today(),
): BudgetsResult {
  const { data, error } = useLiveQuery(listBudgetsQuery(ownerId));

  if (error) throw error;

  return useMemo(() => {
    const range = cycleRangeFor(reference, cycleStartDay);

    const budgets = (data ?? [])
      .filter((budget) => budget.archivedAt === null)
      .map((budget) =>
        budgetProgress(
          {
            id: budget.id,
            name: budget.name,
            plannedAmount: cents(budget.plannedAmount),
            scope: budget.scope as BudgetProgress['budget']['scope'],
            scopeId: budget.scopeId,
            alertThreshold: budget.alertThreshold,
          },
          entries,
          range,
        ),
      );

    return { budgets, isLoading: data === undefined };
  }, [data, entries, cycleStartDay, reference]);
}

export type GoalsResult = {
  goals: GoalProgress[];
  isLoading: boolean;
};

export function useGoals(
  ownerId: string,
  reference: CalendarDate = today(),
): GoalsResult {
  const { data, error } = useLiveQuery(listGoalsQuery(ownerId));
  const { data: contributions } = useLiveQuery(listContributionsQuery(ownerId));

  if (error) throw error;

  return useMemo(() => {
    const all = contributions ?? [];

    const goals = (data ?? [])
      .filter((goal) => goal.archivedAt === null)
      .map((goal) =>
        goalProgress(
          {
            id: goal.id,
            name: goal.name,
            targetAmount: cents(goal.targetAmount),
            targetDate: goal.targetDate,
          },
          all
            .filter((contribution) => contribution.goalId === goal.id)
            .map((contribution) => ({
              amount: cents(contribution.amount),
              date: contribution.date,
            })),
          reference,
        ),
      );

    return { goals, isLoading: data === undefined };
  }, [data, contributions, reference]);
}
