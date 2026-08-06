import { z } from 'zod';

import { HOUSEHOLD_ROLES } from '@/database/schema/common';

export const householdFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Dê um nome para a casa')
    .max(60, 'Use no máximo 60 caracteres'),
});

export type HouseholdFormInput = z.input<typeof householdFormSchema>;
export type HouseholdFormValues = z.output<typeof householdFormSchema>;

export const memberFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'Informe o nome da pessoa')
    .max(60, 'Use no máximo 60 caracteres'),
  // O papel de dono não entra aqui: ele pertence a quem criou a casa e não é
  // atribuído em um cadastro de membro.
  role: z.enum(HOUSEHOLD_ROLES).refine((role) => role !== 'owner', {
    message: 'Escolha um papel para a pessoa',
  }),
});

export type MemberFormInput = z.input<typeof memberFormSchema>;
export type MemberFormValues = z.output<typeof memberFormSchema>;
