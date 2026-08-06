import { type Profile } from '@/features/profile/repository/profileRepository';
import { type Transaction } from '@/features/transactions/repository/transactionsRepository';

/**
 * Fábricas para os testes de tela.
 *
 * As linhas do banco têm dezenas de colunas, das quais cada teste se importa
 * com três ou quatro. Repetir o resto em cada arquivo esconderia justamente o
 * que o teste está verificando.
 */

const NOW = Date.UTC(2026, 0, 15);

export function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'perfil-teste',
    name: 'Você',
    email: null,
    avatarUri: null,
    currency: 'BRL',
    themePreference: 'system',
    cycleStartDay: 1,
    monthClosingDay: 31,
    maskValues: false,
    biometricLock: false,
    createdAt: NOW,
    updatedAt: NOW,
    deletedAt: null,
    serverUpdatedAt: null,
    ...overrides,
  };
}

export function makeTransaction(
  overrides: Partial<Transaction> = {},
): Transaction {
  return {
    id: 'lancamento-teste',
    ownerId: 'perfil-teste',
    householdId: null,
    createdBy: 'perfil-teste',
    kind: 'expense',
    status: 'settled',
    title: 'Mercado',
    description: null,
    notes: null,
    merchant: null,
    amount: 1000,
    currency: 'BRL',
    categoryId: null,
    accountId: null,
    creditCardId: null,
    invoiceId: null,
    paymentMethod: null,
    date: '2026-01-10',
    dueDate: null,
    settledAt: '2026-01-10',
    transferGroupId: null,
    installmentPlanId: null,
    installmentNumber: null,
    recurrenceRuleId: null,
    paidById: null,
    isShared: false,
    createdAt: NOW,
    updatedAt: NOW,
    deletedAt: null,
    serverUpdatedAt: null,
    ...overrides,
  };
}
