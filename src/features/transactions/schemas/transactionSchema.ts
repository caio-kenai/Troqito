import { z } from 'zod';

import { TRANSACTION_STATUSES } from '@/database/schema/common';
import { isCalendarDate } from '@/lib/date';
import { parseAmountToCents } from '@/lib/money';

const calendarDateField = z
  .string()
  .refine(isCalendarDate, 'Informe uma data válida');

/**
 * O valor chega como texto digitado e sai em centavos. Zero é recusado porque
 * um lançamento de valor nulo não representa nada e só polui os relatórios.
 */
const positiveAmountField = z.string().transform((value, ctx) => {
  const parsed = parseAmountToCents(value);

  if (parsed === null) {
    ctx.addIssue({ code: 'custom', message: 'Informe um valor' });
    return z.NEVER;
  }
  if (parsed === 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'O valor precisa ser maior que zero',
    });
    return z.NEVER;
  }

  // O sinal vem do tipo do lançamento, nunca do valor digitado.
  return Math.abs(parsed);
});

export const entryFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Descreva o lançamento')
    .max(80, 'Use no máximo 80 caracteres'),
  amount: positiveAmountField,
  date: calendarDateField,
  categoryId: z.string().min(1, 'Escolha uma categoria'),
  accountId: z.string().min(1, 'Escolha uma conta'),
  status: z.enum(TRANSACTION_STATUSES),
  notes: z.string().trim().max(500, 'Use no máximo 500 caracteres').optional(),
});

export type EntryFormInput = z.input<typeof entryFormSchema>;
export type EntryFormValues = z.output<typeof entryFormSchema>;

export const transferFormSchema = z
  .object({
    amount: positiveAmountField,
    date: calendarDateField,
    fromAccountId: z.string().min(1, 'Escolha a conta de origem'),
    toAccountId: z.string().min(1, 'Escolha a conta de destino'),
    notes: z
      .string()
      .trim()
      .max(500, 'Use no máximo 500 caracteres')
      .optional(),
  })
  .refine((values) => values.fromAccountId !== values.toAccountId, {
    message: 'Origem e destino precisam ser contas diferentes',
    path: ['toAccountId'],
  });

export type TransferFormInput = z.input<typeof transferFormSchema>;
export type TransferFormValues = z.output<typeof transferFormSchema>;

export const STATUS_LABELS: Record<
  (typeof TRANSACTION_STATUSES)[number],
  string
> = {
  planned: 'Prevista',
  pending: 'Pendente',
  settled: 'Concluída',
  overdue: 'Atrasada',
  canceled: 'Cancelada',
};
