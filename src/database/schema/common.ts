import { integer, text } from 'drizzle-orm/sqlite-core';

/**
 * Convenções obrigatórias em toda tabela sincronizada.
 *
 * - Identificador é UUID v7 gerado no dispositivo, porque registros nascem
 *   offline e não podem esperar o servidor.
 * - Instantes são inteiros em milissegundos desde a época, e não texto: são
 *   comparáveis e ordenáveis em SQL sem conversão.
 * - Exclusão é lógica (`deletedAt`). Uma linha apagada de verdade não teria
 *   como ser propagada aos outros dispositivos.
 * - `serverUpdatedAt` guarda o relógio do servidor, que é a autoridade na
 *   resolução de conflito. Fica nulo enquanto a linha só existe localmente.
 */
export const syncColumns = {
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  deletedAt: integer('deleted_at'),
  serverUpdatedAt: integer('server_updated_at'),
};

export const idColumn = text('id').primaryKey();

/** Dono do registro. Base de toda checagem de permissão. */
export const ownerColumn = text('owner_id').notNull();

/**
 * Datas de calendário — compra, vencimento, pagamento — são texto no formato
 * `AAAA-MM-DD`, não instantes. O dia 5 de março é o dia 5 de março
 * independentemente do fuso de quem lê, e guardar como instante faria a data
 * mudar ao atravessar o fuso.
 */
export function calendarDate(name: string) {
  return text(name);
}

export const TRANSACTION_KINDS = ['income', 'expense', 'transfer'] as const;
export type TransactionKind = (typeof TRANSACTION_KINDS)[number];

export const TRANSACTION_STATUSES = [
  'planned',
  'pending',
  'settled',
  'overdue',
  'canceled',
] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const ACCOUNT_TYPES = [
  'checking',
  'savings',
  'cash',
  'digital_wallet',
  'meal_voucher',
  'food_voucher',
  'investment',
  'other',
] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const HOUSEHOLD_ROLES = ['owner', 'admin', 'member', 'viewer'] as const;
export type HouseholdRole = (typeof HOUSEHOLD_ROLES)[number];

export const SPLIT_METHODS = ['equal', 'amount', 'percentage'] as const;
export type SplitMethod = (typeof SPLIT_METHODS)[number];

export const RECURRENCE_FREQUENCIES = [
  'daily',
  'weekly',
  'biweekly',
  'monthly',
  'bimonthly',
  'quarterly',
  'semiannual',
  'annual',
  'custom',
] as const;
export type RecurrenceFrequency = (typeof RECURRENCE_FREQUENCIES)[number];
