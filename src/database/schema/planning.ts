import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { calendarDate, idColumn, ownerColumn, syncColumns } from './common';

/**
 * Orçamento como teto por escopo e período, que é o modelo que a maioria das
 * pessoas já entende. A modelagem guarda o escopo de forma genérica para que um
 * modo de orçamento base zero possa ser acrescentado sem migração destrutiva.
 */
export const budgets = sqliteTable(
  'budgets',
  {
    id: idColumn,
    ownerId: ownerColumn,
    householdId: text('household_id'),

    name: text('name').notNull(),
    /** Valor planejado para o período, em centavos. */
    plannedAmount: integer('planned_amount').notNull(),

    /** `category`, `account`, `person`, `household` ou `overall`. */
    scope: text('scope').notNull(),
    /** Identificador do alvo do escopo; nulo quando o escopo é geral. */
    scopeId: text('scope_id'),

    /** `monthly`, `quarterly`, `annual` ou `custom`. */
    period: text('period').notNull().default('monthly'),
    startDate: calendarDate('start_date').notNull(),
    endDate: calendarDate('end_date'),

    /** Porcentagem em base 10.000 que dispara o alerta de proximidade. */
    alertThreshold: integer('alert_threshold').notNull().default(8000),
    archivedAt: integer('archived_at'),

    ...syncColumns,
  },
  (table) => [
    index('budgets_owner_idx').on(table.ownerId),
    index('budgets_scope_idx').on(table.scope, table.scopeId),
  ],
);

export const goals = sqliteTable(
  'goals',
  {
    id: idColumn,
    ownerId: ownerColumn,
    householdId: text('household_id'),

    name: text('name').notNull(),
    description: text('description'),
    /** Valor-alvo em centavos; o acumulado vem das contribuições. */
    targetAmount: integer('target_amount').notNull(),
    targetDate: calendarDate('target_date'),
    accountId: text('account_id'),

    color: text('color'),
    icon: text('icon'),
    achievedAt: integer('achieved_at'),
    archivedAt: integer('archived_at'),

    ...syncColumns,
  },
  (table) => [index('goals_owner_idx').on(table.ownerId)],
);

export const goalContributions = sqliteTable(
  'goal_contributions',
  {
    id: idColumn,
    ownerId: ownerColumn,
    goalId: text('goal_id').notNull(),

    /** Positivo aporta, negativo resgata. */
    amount: integer('amount').notNull(),
    date: calendarDate('date').notNull(),
    notes: text('notes'),
    /** Lançamento que originou a contribuição, quando houver. */
    transactionId: text('transaction_id'),

    ...syncColumns,
  },
  (table) => [index('goal_contributions_goal_idx').on(table.goalId)],
);
