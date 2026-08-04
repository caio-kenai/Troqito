import { cents } from '@/lib/money';

import {
  accountBalance,
  type BalanceEntry,
  consolidatedBalance,
} from '../balance';

describe('accountBalance', () => {
  it('devolve o saldo de abertura quando não há movimentação', () => {
    expect(accountBalance(cents(50_000), [])).toBe(50_000);
  });

  it('soma receitas e subtrai despesas', () => {
    const entries: BalanceEntry[] = [
      { kind: 'income', amount: cents(420_000) },
      { kind: 'expense', amount: cents(187_045) },
      { kind: 'expense', amount: cents(9_990) },
    ];

    expect(accountBalance(cents(0), entries)).toBe(222_965);
  });

  it('trata as duas pernas da transferência conforme a direção', () => {
    expect(
      accountBalance(cents(100_000), [
        { kind: 'transfer', amount: cents(30_000), transferDirection: 'out' },
      ]),
    ).toBe(70_000);

    expect(
      accountBalance(cents(0), [
        { kind: 'transfer', amount: cents(30_000), transferDirection: 'in' },
      ]),
    ).toBe(30_000);
  });

  // Uma transferência entre contas próprias não pode alterar o patrimônio.
  it('não altera o total quando a transferência é entre contas próprias', () => {
    const origin = accountBalance(cents(100_000), [
      { kind: 'transfer', amount: cents(30_000), transferDirection: 'out' },
    ]);
    const destination = accountBalance(cents(20_000), [
      { kind: 'transfer', amount: cents(30_000), transferDirection: 'in' },
    ]);

    expect(origin + destination).toBe(120_000);
  });

  it('permite saldo negativo', () => {
    expect(
      accountBalance(cents(1_000), [{ kind: 'expense', amount: cents(2_500) }]),
    ).toBe(-1_500);
  });

  it('não perde centavos ao acumular muitos lançamentos', () => {
    const entries: BalanceEntry[] = Array.from({ length: 1_000 }, () => ({
      kind: 'expense' as const,
      amount: cents(1),
    }));

    expect(accountBalance(cents(1_000), entries)).toBe(0);
  });
});

describe('consolidatedBalance', () => {
  const account = (
    balance: number,
    includeInTotal = true,
    archivedAt: number | null = null,
  ) => ({ balance: cents(balance), includeInTotal, archivedAt });

  it('soma as contas incluídas', () => {
    expect(
      consolidatedBalance([account(100_000), account(25_050), account(-3_000)]),
    ).toBe(122_050);
  });

  it('ignora as contas marcadas para ficar de fora', () => {
    expect(
      consolidatedBalance([account(100_000), account(50_000, false)]),
    ).toBe(100_000);
  });

  it('ignora as contas arquivadas', () => {
    expect(
      consolidatedBalance([account(100_000), account(50_000, true, 1_700_000)]),
    ).toBe(100_000);
  });

  it('devolve zero quando não há conta alguma', () => {
    expect(consolidatedBalance([])).toBe(0);
    expect(consolidatedBalance([account(50_000, false)])).toBe(0);
  });
});
