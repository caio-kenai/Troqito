import { z } from 'zod';

import { parseAmountToCents } from '@/lib/money';

const amountField = z.string().transform((value, ctx) => {
  const parsed = parseAmountToCents(value === '' ? '0' : value);
  if (parsed === null) {
    ctx.addIssue({ code: 'custom', message: 'Informe um valor válido' });
    return z.NEVER;
  }
  return parsed;
});

/** Dia do mês digitado como texto, convertido e conferido aqui. */
const dayField = (label: string) =>
  z.string().transform((value, ctx) => {
    const parsed = Number(value.trim());

    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 31) {
      ctx.addIssue({ code: 'custom', message: `${label} entre 1 e 31` });
      return z.NEVER;
    }
    return parsed;
  });

export const cardFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Dê um nome para o cartão')
    .max(60, 'Use no máximo 60 caracteres'),
  brand: z.string().trim().max(40, 'Use no máximo 40 caracteres').optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida'),
  creditLimit: amountField,
  closingDay: dayField('Dia de fechamento'),
  dueDay: dayField('Dia de vencimento'),
  paymentAccountId: z.string().optional(),
});

export type CardFormInput = z.input<typeof cardFormSchema>;
export type CardFormValues = z.output<typeof cardFormSchema>;

export const CARD_COLORS = [
  '#0B7540',
  '#2E6FCC',
  '#8B1F24',
  '#C98A12',
  '#5FA82A',
  '#36413D',
] as const;
