import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { idColumn, ownerColumn, syncColumns } from './common';

export const accounts = sqliteTable(
  'accounts',
  {
    id: idColumn,
    ownerId: ownerColumn,
    householdId: text('household_id'),

    name: text('name').notNull(),
    type: text('type').notNull(),
    institution: text('institution'),
    color: text('color'),
    icon: text('icon'),
    currency: text('currency').notNull().default('BRL'),

    /** Saldo de abertura, em centavos. O saldo atual é sempre calculado. */
    initialBalance: integer('initial_balance').notNull().default(0),

    /**
     * Contas fora do saldo consolidado — investimento de terceiros, vale de
     * uso restrito — continuam registrando movimentações, mas não entram no
     * total exibido na tela inicial.
     */
    includeInTotal: integer('include_in_total', { mode: 'boolean' })
      .notNull()
      .default(true),
    archivedAt: integer('archived_at'),

    ...syncColumns,
  },
  (table) => [
    index('accounts_owner_idx').on(table.ownerId),
    index('accounts_household_idx').on(table.householdId),
  ],
);

export const creditCards = sqliteTable(
  'credit_cards',
  {
    id: idColumn,
    ownerId: ownerColumn,
    householdId: text('household_id'),

    name: text('name').notNull(),
    brand: text('brand'),
    color: text('color'),
    /** Limite total, em centavos. */
    creditLimit: integer('credit_limit').notNull().default(0),

    /** Dia do mês em que a fatura fecha e em que vence. */
    closingDay: integer('closing_day').notNull(),
    dueDay: integer('due_day').notNull(),

    /** Conta usada para pagar a fatura. */
    paymentAccountId: text('payment_account_id'),
    archivedAt: integer('archived_at'),

    ...syncColumns,
  },
  (table) => [
    index('credit_cards_owner_idx').on(table.ownerId),
    index('credit_cards_household_idx').on(table.householdId),
  ],
);

export const invoices = sqliteTable(
  'invoices',
  {
    id: idColumn,
    ownerId: ownerColumn,
    creditCardId: text('credit_card_id').notNull(),

    /** Mês de referência da fatura, no formato `AAAA-MM`. */
    referenceMonth: text('reference_month').notNull(),
    closingDate: text('closing_date').notNull(),
    dueDate: text('due_date').notNull(),

    /** `open`, `closed` ou `paid`. */
    status: text('status').notNull().default('open'),
    /** Total lançado e total já pago, ambos em centavos. */
    totalAmount: integer('total_amount').notNull().default(0),
    paidAmount: integer('paid_amount').notNull().default(0),
    paidAt: text('paid_at'),

    ...syncColumns,
  },
  (table) => [
    index('invoices_card_idx').on(table.creditCardId, table.referenceMonth),
    index('invoices_owner_idx').on(table.ownerId),
  ],
);

export const categories = sqliteTable(
  'categories',
  {
    id: idColumn,
    ownerId: ownerColumn,
    householdId: text('household_id'),

    name: text('name').notNull(),
    /** `income` ou `expense`: uma categoria não serve para os dois. */
    kind: text('kind').notNull(),
    /** Subcategoria aponta para a categoria mãe. */
    parentId: text('parent_id'),

    color: text('color'),
    icon: text('icon'),
    sortOrder: integer('sort_order').notNull().default(0),
    /** Categorias iniciais do sistema não podem ser excluídas, só arquivadas. */
    isSystem: integer('is_system', { mode: 'boolean' })
      .notNull()
      .default(false),
    archivedAt: integer('archived_at'),

    ...syncColumns,
  },
  (table) => [
    index('categories_owner_kind_idx').on(table.ownerId, table.kind),
    index('categories_parent_idx').on(table.parentId),
  ],
);
