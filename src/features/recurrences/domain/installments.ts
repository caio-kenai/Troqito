import { addMonths } from 'date-fns';

import {
  fromCalendarDate,
  toCalendarDate,
  withDayOfMonth,
  type CalendarDate,
} from '@/lib/date';
import { add, allocate, type Cents, MoneyError, ZERO } from '@/lib/money';

export type Installment = {
  /** Começa em 1, como aparece em fatura: "3 de 12". */
  number: number;
  amount: Cents;
  dueDate: CalendarDate;
};

/** Quantidade máxima de parcelas aceita. */
export const MAX_INSTALLMENTS = 120;

/**
 * Divide uma compra em parcelas.
 *
 * O valor é repartido com distribuição de resto, então a soma das parcelas é
 * exatamente o total da compra. Uma compra de R$ 100,00 em 3 vezes vira
 * 33,34 + 33,33 + 33,33 — e não três parcelas de 33,33 com um centavo sumindo
 * na diferença entre o que se deve e o que se paga.
 *
 * O vencimento avança sempre a partir da primeira data, e não da parcela
 * anterior: somar um mês em cadeia faz o dia 31 cair para 28 em fevereiro e
 * nunca mais voltar.
 */
export function buildInstallments(
  total: Cents,
  count: number,
  firstDueDate: CalendarDate,
): Installment[] {
  if (!Number.isInteger(count) || count < 1) {
    throw new MoneyError(`Quantidade de parcelas inválida: ${count}`);
  }
  if (count > MAX_INSTALLMENTS) {
    throw new MoneyError(
      `Quantidade de parcelas acima do limite de ${MAX_INSTALLMENTS}`,
    );
  }
  if (total === 0) {
    throw new MoneyError('Parcelamento de valor zero não faz sentido');
  }

  const amounts = allocate(
    total,
    Array.from({ length: count }, () => 1),
  );

  const first = fromCalendarDate(firstDueDate);
  const anchorDay = first.getDate();

  return amounts.map((amount, index) => ({
    number: index + 1,
    amount,
    dueDate: toCalendarDate(withDayOfMonth(addMonths(first, index), anchorDay)),
  }));
}

/** Rótulo de parcela como aparece em fatura. */
export function installmentLabel(number: number, count: number): string {
  return `${number}/${count}`;
}

/**
 * Quanto ainda falta pagar de um parcelamento.
 *
 * Considera pagas as parcelas com vencimento até a data de referência, que é
 * como a pessoa enxerga: o que já venceu, já saiu.
 */
export function remainingAmount(
  installments: readonly Installment[],
  reference: CalendarDate,
): Cents {
  return installments
    .filter((installment) => installment.dueDate > reference)
    .reduce((acc, installment) => add(acc, installment.amount), ZERO);
}
