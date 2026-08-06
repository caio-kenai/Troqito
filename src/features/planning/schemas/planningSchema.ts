import { z } from 'zod';

import { isCalendarDate } from '@/lib/date';
import { parseAmountToCents } from '@/lib/money';

const positiveAmountField = z.string().transform((value, ctx) => {
  const parsed = parseAmountToCents(value);

  if (parsed === null) {
    ctx.addIssue({ code: 'custom', message: 'Informe um valor' });
    return z.NEVER;
  }
  if (parsed <= 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'O valor precisa ser maior que zero',
    });
    return z.NEVER;
  }

  return parsed;
});

export const BUDGET_SCOPES = ['category', 'account', 'overall'] as const;
export const BUDGET_PERIODS = ['monthly', 'quarterly', 'annual'] as const;

export const budgetFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Dê um nome para o orçamento')
      .max(60, 'Use no máximo 60 caracteres'),
    plannedAmount: positiveAmountField,
    scope: z.enum(BUDGET_SCOPES),
    scopeId: z.string().optional(),
    period: z.enum(BUDGET_PERIODS),
    startDate: z.string().refine(isCalendarDate, 'Informe uma data válida'),
    /** Porcentagem de alerta, digitada como número inteiro de 1 a 100. */
    alertThreshold: z.string().transform((value, ctx) => {
      const parsed = Number(value.trim());

      if (!Number.isFinite(parsed) || parsed < 1 || parsed > 100) {
        ctx.addIssue({ code: 'custom', message: 'Use um valor de 1 a 100' });
        return z.NEVER;
      }
      return Math.round(parsed * 100);
    }),
  })
  // Um orçamento por categoria sem categoria escolhida somaria tudo, e a pessoa
  // veria um teto sendo consumido por gastos que não pretendia limitar.
  .refine((values) => values.scope === 'overall' || Boolean(values.scopeId), {
    message: 'Escolha o alvo do orçamento',
    path: ['scopeId'],
  });

export type BudgetFormInput = z.input<typeof budgetFormSchema>;
export type BudgetFormValues = z.output<typeof budgetFormSchema>;

export const goalFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Dê um nome para a meta')
    .max(60, 'Use no máximo 60 caracteres'),
  description: z
    .string()
    .trim()
    .max(200, 'Use no máximo 200 caracteres')
    .optional(),
  targetAmount: positiveAmountField,
  targetDate: z
    .string()
    .refine((value) => value === '' || isCalendarDate(value), {
      message: 'Informe uma data válida',
    })
    .transform((value) => (value === '' ? undefined : value))
    .optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida'),
});

export type GoalFormInput = z.input<typeof goalFormSchema>;
export type GoalFormValues = z.output<typeof goalFormSchema>;

export const PERIOD_LABELS: Record<(typeof BUDGET_PERIODS)[number], string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  annual: 'Anual',
};
