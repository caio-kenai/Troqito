import {
  addMonths,
  format,
  isValid,
  lastDayOfMonth,
  parse,
  setDate,
  subMonths,
} from 'date-fns';

/**
 * Datas de calendário do Troqito.
 *
 * Compra, vencimento e pagamento são datas civis, não instantes: o dia 5 de
 * março é o dia 5 de março em qualquer fuso. Por isso circulam como texto
 * `AAAA-MM-DD` e só viram `Date` — sempre no fuso local, à meia-noite — para
 * fazer conta de calendário.
 */

export type CalendarDate = string;

const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isCalendarDate(value: string): boolean {
  if (!ISO_PATTERN.test(value)) return false;
  const parsed = parse(value, 'yyyy-MM-dd', new Date());
  return isValid(parsed) && toCalendarDate(parsed) === value;
}

export function toCalendarDate(date: Date): CalendarDate {
  return format(date, 'yyyy-MM-dd');
}

export function fromCalendarDate(value: CalendarDate): Date {
  if (!isCalendarDate(value)) {
    throw new Error(`Data de calendário inválida: ${value}`);
  }
  return parse(value, 'yyyy-MM-dd', new Date());
}

export function today(now: Date = new Date()): CalendarDate {
  return toCalendarDate(now);
}

/** Formata para exibição no padrão brasileiro. */
export function formatBR(value: CalendarDate): string {
  return format(fromCalendarDate(value), 'dd/MM/yyyy');
}

/**
 * Aplica um dia do mês respeitando meses curtos: pedir o dia 31 em fevereiro
 * devolve o dia 28 ou 29. Sem isso, um vencimento no dia 31 pularia meses.
 */
export function withDayOfMonth(date: Date, day: number): Date {
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new Error(`Dia do mês inválido: ${day}`);
  }
  const limit = lastDayOfMonth(date).getDate();
  return setDate(date, Math.min(day, limit));
}

export type DateRange = { start: CalendarDate; end: CalendarDate };

/**
 * Período do ciclo financeiro que contém a data de referência.
 *
 * Quem recebe no dia 5 não vive o mês do dia 1 ao 31. Com `cycleStartDay = 5`,
 * o ciclo que contém o dia 3 de março vai de 5 de fevereiro a 4 de março.
 */
export function cycleRangeFor(
  reference: CalendarDate,
  cycleStartDay: number,
): DateRange {
  if (
    !Number.isInteger(cycleStartDay) ||
    cycleStartDay < 1 ||
    cycleStartDay > 31
  ) {
    throw new Error(`Dia de início do ciclo inválido: ${cycleStartDay}`);
  }

  const date = fromCalendarDate(reference);
  let start = withDayOfMonth(date, cycleStartDay);

  if (date < start) {
    start = withDayOfMonth(subMonths(date, 1), cycleStartDay);
  }

  const nextStart = withDayOfMonth(addMonths(start, 1), cycleStartDay);
  const end = new Date(nextStart);
  end.setDate(end.getDate() - 1);

  return { start: toCalendarDate(start), end: toCalendarDate(end) };
}

/** Mês de referência no formato `AAAA-MM`, usado nas faturas. */
export function referenceMonth(value: CalendarDate): string {
  return value.slice(0, 7);
}
