import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { calendarDate, idColumn, ownerColumn, syncColumns } from './common';

/**
 * Receita, despesa e transferência compartilham esta tabela, discriminadas por
 * `kind`. Foram modeladas juntas porque usam quase todos os mesmos campos, os
 * mesmos filtros e os mesmos relatórios; separá-las faria toda consulta de
 * fluxo de caixa virar UNION.
 */
export const transactions = sqliteTable(
  'transactions',
  {
    id: idColumn,
    ownerId: ownerColumn,
    householdId: text('household_id'),
    /** Quem registrou o lançamento, que pode não ser o dono da conta. */
    createdBy: text('created_by').notNull(),

    kind: text('kind').notNull(),
    status: text('status').notNull().default('settled'),

    title: text('title').notNull(),
    description: text('description'),
    notes: text('notes'),
    merchant: text('merchant'),

    /** Sempre positivo, em centavos. O sinal vem de `kind`, não do valor. */
    amount: integer('amount').notNull(),
    currency: text('currency').notNull().default('BRL'),

    categoryId: text('category_id'),
    accountId: text('account_id'),
    creditCardId: text('credit_card_id'),
    invoiceId: text('invoice_id'),
    paymentMethod: text('payment_method'),

    /** Data do fato gerador; as demais marcam o ciclo do lançamento. */
    date: calendarDate('date').notNull(),
    dueDate: calendarDate('due_date'),
    settledAt: calendarDate('settled_at'),

    /** Liga as duas pernas de uma transferência. */
    transferGroupId: text('transfer_group_id'),
    installmentPlanId: text('installment_plan_id'),
    installmentNumber: integer('installment_number'),
    recurrenceRuleId: text('recurrence_rule_id'),

    /** Quem pagou de fato, quando a despesa é compartilhada. */
    paidById: text('paid_by_id'),
    isShared: integer('is_shared', { mode: 'boolean' })
      .notNull()
      .default(false),

    ...syncColumns,
  },
  (table) => [
    index('transactions_owner_date_idx').on(table.ownerId, table.date),
    index('transactions_household_date_idx').on(table.householdId, table.date),
    index('transactions_account_idx').on(table.accountId),
    index('transactions_category_idx').on(table.categoryId),
    index('transactions_invoice_idx').on(table.invoiceId),
    index('transactions_transfer_group_idx').on(table.transferGroupId),
    index('transactions_installment_plan_idx').on(table.installmentPlanId),
    index('transactions_recurrence_idx').on(table.recurrenceRuleId),
    index('transactions_status_due_idx').on(table.status, table.dueDate),
  ],
);

export const transactionSplits = sqliteTable(
  'transaction_splits',
  {
    id: idColumn,
    ownerId: ownerColumn,
    transactionId: text('transaction_id').notNull(),
    /** Participante da divisão: membro da casa. */
    memberId: text('member_id').notNull(),

    /** `equal`, `amount` ou `percentage`. */
    method: text('method').notNull(),
    /**
     * Valor devido em centavos, já resolvido. A soma das divisões de um
     * lançamento é sempre exatamente igual ao valor dele.
     */
    amount: integer('amount').notNull(),
    /** Porcentagem em base 10.000, preenchida apenas no método percentual. */
    percentage: integer('percentage'),
    settledAt: integer('settled_at'),

    ...syncColumns,
  },
  (table) => [
    index('transaction_splits_transaction_idx').on(table.transactionId),
    index('transaction_splits_member_idx').on(table.memberId),
  ],
);

export const installmentPlans = sqliteTable(
  'installment_plans',
  {
    id: idColumn,
    ownerId: ownerColumn,

    title: text('title').notNull(),
    /** Total da compra e quantidade de parcelas geradas. */
    totalAmount: integer('total_amount').notNull(),
    installmentCount: integer('installment_count').notNull(),
    firstDueDate: calendarDate('first_due_date').notNull(),

    accountId: text('account_id'),
    creditCardId: text('credit_card_id'),
    categoryId: text('category_id'),
    canceledAt: integer('canceled_at'),

    ...syncColumns,
  },
  (table) => [index('installment_plans_owner_idx').on(table.ownerId)],
);

export const recurrenceRules = sqliteTable(
  'recurrence_rules',
  {
    id: idColumn,
    ownerId: ownerColumn,

    frequency: text('frequency').notNull(),
    /** Passo da frequência: 2 com `monthly` significa a cada dois meses. */
    interval: integer('interval').notNull().default(1),
    startDate: calendarDate('start_date').notNull(),
    endDate: calendarDate('end_date'),
    occurrenceLimit: integer('occurrence_limit'),

    /** Falso exige confirmação manual antes de materializar a ocorrência. */
    autoGenerate: integer('auto_generate', { mode: 'boolean' })
      .notNull()
      .default(true),
    /** Até onde as ocorrências já foram materializadas. */
    generatedUntil: calendarDate('generated_until'),
    endedAt: integer('ended_at'),

    ...syncColumns,
  },
  (table) => [index('recurrence_rules_owner_idx').on(table.ownerId)],
);

export const tags = sqliteTable(
  'tags',
  {
    id: idColumn,
    ownerId: ownerColumn,
    name: text('name').notNull(),
    color: text('color'),
    ...syncColumns,
  },
  (table) => [index('tags_owner_idx').on(table.ownerId)],
);

export const transactionTags = sqliteTable(
  'transaction_tags',
  {
    id: idColumn,
    ownerId: ownerColumn,
    transactionId: text('transaction_id').notNull(),
    tagId: text('tag_id').notNull(),
    ...syncColumns,
  },
  (table) => [
    index('transaction_tags_transaction_idx').on(table.transactionId),
    index('transaction_tags_tag_idx').on(table.tagId),
  ],
);

export const attachments = sqliteTable(
  'attachments',
  {
    id: idColumn,
    ownerId: ownerColumn,
    transactionId: text('transaction_id').notNull(),

    /** Caminho no dispositivo; a cópia remota entra com a sincronização. */
    localUri: text('local_uri').notNull(),
    remotePath: text('remote_path'),
    fileName: text('file_name').notNull(),
    mimeType: text('mime_type'),
    sizeBytes: integer('size_bytes'),
    /** Distingue comprovante de anexo comum nos relatórios. */
    isReceipt: integer('is_receipt', { mode: 'boolean' })
      .notNull()
      .default(false),

    ...syncColumns,
  },
  (table) => [index('attachments_transaction_idx').on(table.transactionId)],
);
