import { type SplitMethod } from '@/database/schema/common';
import {
  add,
  allocate,
  BASIS_POINTS_SCALE,
  type BasisPoints,
  type Cents,
  MoneyError,
  subtract,
  ZERO,
} from '@/lib/money';

export type Share = {
  memberId: string;
  amount: Cents;
  /** Preenchido apenas no método percentual, para a edição poder voltar. */
  percentage?: BasisPoints;
};

/**
 * Divisão de uma despesa entre participantes.
 *
 * A regra que não pode ser violada em nenhum método: a soma das partes é
 * exatamente igual ao total. Um centavo perdido no arredondamento vira
 * divergência permanente no acerto de contas entre as pessoas.
 */

export function splitEqually(
  total: Cents,
  memberIds: readonly string[],
): Share[] {
  if (memberIds.length === 0) {
    throw new MoneyError('splitEqually: nenhum participante');
  }

  // `allocate` distribui o resto de centavo de forma determinística, então
  // dividir R$ 10,00 entre três pessoas dá 3,34 / 3,33 / 3,33, e não 3,33
  // três vezes com um centavo sumindo.
  const amounts = allocate(
    total,
    memberIds.map(() => 1),
  );

  return memberIds.map((memberId, index) => ({
    memberId,
    amount: amounts[index] ?? ZERO,
  }));
}

export type PercentageInput = { memberId: string; percentage: BasisPoints };

export function splitByPercentage(
  total: Cents,
  inputs: readonly PercentageInput[],
): Share[] {
  if (inputs.length === 0) {
    throw new MoneyError('splitByPercentage: nenhum participante');
  }

  const sum = inputs.reduce((acc, input) => acc + input.percentage, 0);
  if (sum !== BASIS_POINTS_SCALE) {
    throw new MoneyError(
      `splitByPercentage: as porcentagens somam ${sum / 100}%, e precisam somar 100%`,
    );
  }

  const amounts = allocate(
    total,
    inputs.map((input) => input.percentage),
  );

  return inputs.map((input, index) => ({
    memberId: input.memberId,
    amount: amounts[index] ?? ZERO,
    percentage: input.percentage,
  }));
}

export type AmountInput = { memberId: string; amount: Cents };

export function splitByAmount(
  total: Cents,
  inputs: readonly AmountInput[],
): Share[] {
  if (inputs.length === 0) {
    throw new MoneyError('splitByAmount: nenhum participante');
  }

  const sum = inputs.reduce((acc, input) => add(acc, input.amount), ZERO);
  if (sum !== total) {
    const missing = subtract(total, sum);
    throw new MoneyError(
      missing > 0
        ? `splitByAmount: faltam ${missing} centavos para fechar o total`
        : `splitByAmount: sobram ${-missing} centavos além do total`,
    );
  }

  return inputs.map((input) => ({
    memberId: input.memberId,
    amount: input.amount,
  }));
}

export type Debt = {
  /** Quem deve. */
  memberId: string;
  /** Para quem deve: quem pagou a despesa. */
  toMemberId: string;
  amount: Cents;
};

/**
 * Quem deve quanto a quem, a partir de uma divisão já resolvida.
 *
 * A parte de quem pagou não vira dívida consigo mesmo, e participantes com
 * parte zero não aparecem: uma lista de acerto cheia de linhas de R$ 0,00 é
 * ruído que esconde o que importa.
 */
export function settlement(
  shares: readonly Share[],
  paidByMemberId: string,
): Debt[] {
  return shares
    .filter((share) => share.memberId !== paidByMemberId && share.amount !== 0)
    .map((share) => ({
      memberId: share.memberId,
      toMemberId: paidByMemberId,
      amount: share.amount,
    }));
}

/** Verifica a regra central da divisão: a soma das partes fecha o total. */
export function sharesAreBalanced(
  shares: readonly Share[],
  total: Cents,
): boolean {
  return shares.reduce((acc, share) => add(acc, share.amount), ZERO) === total;
}

export const SPLIT_METHOD_LABELS: Record<SplitMethod, string> = {
  equal: 'Igualmente',
  amount: 'Por valor',
  percentage: 'Por porcentagem',
};

export const SPLIT_METHOD_DESCRIPTIONS: Record<SplitMethod, string> = {
  equal: 'O total é dividido em partes iguais entre os escolhidos',
  amount: 'Você informa quanto cabe a cada pessoa',
  percentage: 'Você informa a fatia de cada pessoa, e elas somam 100%',
};
