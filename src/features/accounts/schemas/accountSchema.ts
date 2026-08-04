import { z } from 'zod';

import { ACCOUNT_TYPES } from '@/database/schema/common';
import { parseAmountToCents } from '@/lib/money';

export const ACCOUNT_TYPE_LABELS: Record<
  (typeof ACCOUNT_TYPES)[number],
  string
> = {
  checking: 'Conta-corrente',
  savings: 'Conta-poupança',
  cash: 'Dinheiro',
  digital_wallet: 'Carteira digital',
  meal_voucher: 'Vale-refeição',
  food_voucher: 'Vale-alimentação',
  investment: 'Investimento',
  other: 'Outra',
};

/**
 * O formulário trabalha com o texto digitado; a conversão para centavos
 * acontece aqui, na fronteira, para que nenhuma tela precise saber disso.
 */
const amountField = z.string().transform((value, ctx) => {
  const parsed = parseAmountToCents(value === '' ? '0' : value);
  if (parsed === null) {
    ctx.addIssue({ code: 'custom', message: 'Informe um valor válido' });
    return z.NEVER;
  }
  return parsed;
});

export const accountFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Dê um nome para a conta')
    .max(60, 'Use no máximo 60 caracteres'),
  type: z.enum(ACCOUNT_TYPES),
  institution: z
    .string()
    .trim()
    .max(60, 'Use no máximo 60 caracteres')
    .optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida'),
  initialBalance: amountField,
  includeInTotal: z.boolean(),
});

export type AccountFormInput = z.input<typeof accountFormSchema>;
export type AccountFormValues = z.output<typeof accountFormSchema>;
