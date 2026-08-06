import { addMonths } from 'date-fns';

import {
  fromCalendarDate,
  referenceMonth,
  toCalendarDate,
  withDayOfMonth,
  type CalendarDate,
} from '@/lib/date';
import { type Cents, subtract } from '@/lib/money';

export type CardCycle = {
  /** Dia do mês em que a fatura fecha. */
  closingDay: number;
  /** Dia do mês em que a fatura vence. */
  dueDay: number;
};

export type InvoicePeriod = {
  /** Mês de referência no formato `AAAA-MM`. */
  referenceMonth: string;
  closingDate: CalendarDate;
  dueDate: CalendarDate;
};

export class InvoiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvoiceError';
  }
}

function assertDay(day: number, label: string): void {
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new InvoiceError(`${label} inválido: ${day}`);
  }
}

/**
 * Em qual fatura uma compra cai.
 *
 * Compra feita depois do fechamento entra na fatura seguinte — é a regra que
 * mais confunde quem acompanha cartão, e errar aqui joga a despesa para o mês
 * errado em todo relatório.
 *
 * Quando o vencimento é anterior ao fechamento, ele pertence ao mês seguinte:
 * um cartão que fecha dia 28 e vence dia 5 vence no mês depois de fechar.
 */
export function invoiceFor(
  purchaseDate: CalendarDate,
  cycle: CardCycle,
): InvoicePeriod {
  assertDay(cycle.closingDay, 'Dia de fechamento');
  assertDay(cycle.dueDay, 'Dia de vencimento');

  const purchase = fromCalendarDate(purchaseDate);
  const closingThisMonth = withDayOfMonth(purchase, cycle.closingDay);

  const closing =
    purchase <= closingThisMonth
      ? closingThisMonth
      : withDayOfMonth(addMonths(purchase, 1), cycle.closingDay);

  const dueBase =
    cycle.dueDay > cycle.closingDay ? closing : addMonths(closing, 1);
  const due = withDayOfMonth(dueBase, cycle.dueDay);

  const closingDate = toCalendarDate(closing);

  return {
    // A fatura é identificada pelo mês em que fecha: é assim que ela aparece
    // no aplicativo do banco e é como as pessoas se referem a ela.
    referenceMonth: referenceMonth(closingDate),
    closingDate,
    dueDate: toCalendarDate(due),
  };
}

/** A fatura seguinte à informada. */
export function nextInvoice(
  period: InvoicePeriod,
  cycle: CardCycle,
): InvoicePeriod {
  const dayAfterClosing = fromCalendarDate(period.closingDate);
  dayAfterClosing.setDate(dayAfterClosing.getDate() + 1);

  return invoiceFor(toCalendarDate(dayAfterClosing), cycle);
}

/**
 * Limite ainda disponível no cartão.
 *
 * Nunca devolve negativo: gasto acima do limite é bloqueado pelo emissor, e
 * mostrar "disponível −R$ 200,00" só confunde. O estouro aparece como zero
 * disponível, e o valor gasto continua visível ao lado.
 */
export function availableLimit(creditLimit: Cents, used: Cents): Cents {
  const available = subtract(creditLimit, used);
  return available < 0 ? (0 as Cents) : available;
}

/** Fração do limite já usada, de 0 a 1 ou mais quando estourado. */
export function limitUsage(creditLimit: Cents, used: Cents): number {
  if (creditLimit <= 0) return 0;
  return used / creditLimit;
}

export const INVOICE_STATUS_LABELS = {
  open: 'Aberta',
  closed: 'Fechada',
  paid: 'Paga',
} as const;
