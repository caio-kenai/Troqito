import { type CalendarDate } from '@/lib/date';
import { type Cents } from '@/lib/money';

import { toCsv, withBom } from './csv';

export type ExportableTransaction = {
  id: string;
  date: CalendarDate;
  kind: string;
  status: string;
  title: string;
  amount: Cents;
  categoryName: string | null;
  accountName: string | null;
  notes: string | null;
};

const HEADERS = [
  'Data',
  'Tipo',
  'Situação',
  'Descrição',
  'Categoria',
  'Conta',
  'Valor',
  'Observações',
] as const;

const KIND_LABELS: Record<string, string> = {
  income: 'Receita',
  expense: 'Despesa',
  transfer: 'Transferência',
};

/**
 * Valor em formato de planilha.
 *
 * Vai com vírgula decimal e sem símbolo de moeda: é o que o Excel em português
 * reconhece como número. Com "R$" na frente, a coluna vira texto e nenhuma soma
 * funciona do outro lado.
 */
export function amountForSheet(amount: Cents): string {
  const negative = amount < 0;
  const absolute = Math.abs(amount);
  const reais = Math.trunc(absolute / 100);
  const centavos = String(absolute % 100).padStart(2, '0');

  return `${negative ? '-' : ''}${reais},${centavos}`;
}

export function transactionsToCsv(
  transactions: readonly ExportableTransaction[],
): string {
  const rows = transactions.map((transaction) => [
    transaction.date,
    KIND_LABELS[transaction.kind] ?? transaction.kind,
    transaction.status,
    transaction.title,
    transaction.categoryName ?? '',
    transaction.accountName ?? '',
    amountForSheet(transaction.amount),
    transaction.notes ?? '',
  ]);

  return withBom(toCsv(HEADERS, rows));
}

export type Backup = {
  /** Versão do formato, para uma importação futura saber o que está lendo. */
  formatVersion: number;
  exportedAt: string;
  transactions: readonly unknown[];
  accounts: readonly unknown[];
  categories: readonly unknown[];
  households: readonly unknown[];
  budgets: readonly unknown[];
  goals: readonly unknown[];
};

export const BACKUP_FORMAT_VERSION = 1;

/**
 * Cópia completa dos dados, em JSON.
 *
 * O CSV serve para abrir em planilha; este arquivo serve para levar os dados
 * embora inteiros. Por isso não filtra nem formata nada: sai como está gravado.
 */
export function buildBackup(
  data: Omit<Backup, 'formatVersion' | 'exportedAt'>,
  now: Date = new Date(),
): string {
  const backup: Backup = {
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: now.toISOString(),
    ...data,
  };

  return JSON.stringify(backup, null, 2);
}

/** Nome de arquivo com a data, para exportações sucessivas não se sobreporem. */
export function exportFileName(
  prefix: string,
  extension: string,
  now: Date = new Date(),
): string {
  const stamp = now.toISOString().slice(0, 10);
  return `${prefix}-${stamp}.${extension}`;
}
