import { type TransactionKind } from '@/database/schema/common';
import { add, type Cents, subtract, sum, ZERO } from '@/lib/money';

export type BalanceEntry = {
  kind: TransactionKind;
  amount: Cents;
  /** Perna da transferência: `out` sai da conta, `in` entra nela. */
  transferDirection?: 'in' | 'out';
};

/**
 * Saldo de uma conta: saldo de abertura mais o efeito das movimentações.
 *
 * O valor de uma transação é sempre positivo — o sinal vem do tipo. Isso evita
 * a classe de erro em que um valor negativo somado a uma despesa acaba
 * aumentando o saldo.
 */
export function accountBalance(
  initialBalance: Cents,
  entries: readonly BalanceEntry[],
): Cents {
  return entries.reduce<Cents>((balance, entry) => {
    switch (entry.kind) {
      case 'income':
        return add(balance, entry.amount);
      case 'expense':
        return subtract(balance, entry.amount);
      case 'transfer':
        return entry.transferDirection === 'in'
          ? add(balance, entry.amount)
          : subtract(balance, entry.amount);
    }
  }, initialBalance);
}

export type ConsolidatedAccount = {
  balance: Cents;
  includeInTotal: boolean;
  archivedAt: number | null;
};

/**
 * Saldo consolidado exibido na tela inicial.
 *
 * Contas marcadas para ficar de fora e contas arquivadas não entram. Elas
 * continuam existindo e registrando movimentações — apenas não compõem o total,
 * que é o número que a pessoa usa para decidir se pode gastar.
 */
export function consolidatedBalance(
  accounts: readonly ConsolidatedAccount[],
): Cents {
  const included = accounts.filter(
    (account) => account.includeInTotal && account.archivedAt === null,
  );
  return included.length === 0 ? ZERO : sum(included.map((a) => a.balance));
}
