import { and, asc, eq, isNull } from 'drizzle-orm';

import { db } from '@/database/client';
import {
  deletedRecordFields,
  enqueueMutation,
  newRecordFields,
  updatedRecordFields,
} from '@/database/mutations';
import { budgets, goalContributions, goals } from '@/database/schema';
import { type CalendarDate } from '@/lib/date';
import { type Cents } from '@/lib/money';

import {
  type BudgetFormValues,
  type GoalFormValues,
} from '../schemas/planningSchema';

export type Budget = typeof budgets.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type GoalContribution = typeof goalContributions.$inferSelect;

export function listBudgetsQuery(ownerId: string) {
  return db
    .select()
    .from(budgets)
    .where(and(eq(budgets.ownerId, ownerId), isNull(budgets.deletedAt)))
    .orderBy(asc(budgets.archivedAt), asc(budgets.name));
}

export function listGoalsQuery(ownerId: string) {
  return db
    .select()
    .from(goals)
    .where(and(eq(goals.ownerId, ownerId), isNull(goals.deletedAt)))
    .orderBy(asc(goals.archivedAt), asc(goals.name));
}

export function listContributionsQuery(ownerId: string) {
  return db
    .select()
    .from(goalContributions)
    .where(
      and(
        eq(goalContributions.ownerId, ownerId),
        isNull(goalContributions.deletedAt),
      ),
    )
    .orderBy(asc(goalContributions.date));
}

export function createBudget(
  ownerId: string,
  values: BudgetFormValues,
): string {
  const record = {
    ...newRecordFields(),
    ownerId,
    name: values.name,
    plannedAmount: values.plannedAmount,
    scope: values.scope,
    scopeId: values.scopeId ?? null,
    period: values.period,
    startDate: values.startDate,
    endDate: null,
    alertThreshold: values.alertThreshold,
  };

  db.transaction((tx) => {
    tx.insert(budgets).values(record).run();
    enqueueMutation(tx, 'budgets', record.id, 'insert', record);
  });

  return record.id;
}

export function updateBudget(id: string, values: BudgetFormValues): void {
  const patch = {
    ...updatedRecordFields(),
    name: values.name,
    plannedAmount: values.plannedAmount,
    scope: values.scope,
    scopeId: values.scopeId ?? null,
    period: values.period,
    startDate: values.startDate,
    alertThreshold: values.alertThreshold,
  };

  db.transaction((tx) => {
    tx.update(budgets).set(patch).where(eq(budgets.id, id)).run();
    enqueueMutation(tx, 'budgets', id, 'update', patch);
  });
}

export function deleteBudget(id: string): void {
  const patch = deletedRecordFields();

  db.transaction((tx) => {
    tx.update(budgets).set(patch).where(eq(budgets.id, id)).run();
    enqueueMutation(tx, 'budgets', id, 'delete', patch);
  });
}

export function createGoal(ownerId: string, values: GoalFormValues): string {
  const record = {
    ...newRecordFields(),
    ownerId,
    name: values.name,
    description: values.description ?? null,
    targetAmount: values.targetAmount,
    targetDate: values.targetDate ?? null,
    accountId: null,
    color: values.color,
    icon: null,
    achievedAt: null,
    archivedAt: null,
  };

  db.transaction((tx) => {
    tx.insert(goals).values(record).run();
    enqueueMutation(tx, 'goals', record.id, 'insert', record);
  });

  return record.id;
}

export function deleteGoal(id: string): void {
  const patch = deletedRecordFields();

  db.transaction((tx) => {
    tx.update(goals).set(patch).where(eq(goals.id, id)).run();
    enqueueMutation(tx, 'goals', id, 'delete', patch);

    // Os aportes saem junto: guardados sozinhos, apareceriam somando para uma
    // meta que não existe mais.
    tx.update(goalContributions)
      .set(patch)
      .where(eq(goalContributions.goalId, id))
      .run();
    enqueueMutation(tx, 'goal_contributions', id, 'delete', {
      ...patch,
      goalId: id,
    });
  });
}

/**
 * Registra um aporte ou resgate.
 *
 * Valor negativo é resgate, e é aceito de propósito: quem guarda dinheiro
 * também tira. Impedir o resgate faria a pessoa apagar a meta para corrigir, e
 * o histórico se perderia.
 */
export function addContribution(
  ownerId: string,
  goalId: string,
  amount: Cents,
  date: CalendarDate,
  notes?: string,
): string {
  const record = {
    ...newRecordFields(),
    ownerId,
    goalId,
    amount,
    date,
    notes: notes?.trim() ? notes.trim() : null,
    transactionId: null,
  };

  db.transaction((tx) => {
    tx.insert(goalContributions).values(record).run();
    enqueueMutation(tx, 'goal_contributions', record.id, 'insert', record);
  });

  return record.id;
}
