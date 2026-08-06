import { addDays, addMonths } from 'date-fns';

import { type RecurrenceFrequency } from '@/database/schema/common';
import {
  fromCalendarDate,
  toCalendarDate,
  withDayOfMonth,
  type CalendarDate,
} from '@/lib/date';

export type Recurrence = {
  frequency: RecurrenceFrequency;
  /** Passo da frequência: 2 com `monthly` significa a cada dois meses. */
  interval: number;
  startDate: CalendarDate;
  endDate?: CalendarDate | null;
  /** Quantidade máxima de ocorrências, contando a primeira. */
  occurrenceLimit?: number | null;
};

/** Quantos meses cada frequência avança por passo. Zero indica passo em dias. */
const MONTHS_PER_STEP: Record<RecurrenceFrequency, number> = {
  daily: 0,
  weekly: 0,
  biweekly: 0,
  monthly: 1,
  bimonthly: 2,
  quarterly: 3,
  semiannual: 6,
  annual: 12,
  custom: 0,
};

const DAYS_PER_STEP: Record<RecurrenceFrequency, number> = {
  daily: 1,
  weekly: 7,
  biweekly: 14,
  monthly: 0,
  bimonthly: 0,
  quarterly: 0,
  semiannual: 0,
  annual: 0,
  custom: 1,
};

export class RecurrenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RecurrenceError';
  }
}

/**
 * Datas de uma recorrência, do início até o horizonte pedido.
 *
 * O avanço mensal parte sempre da data inicial, e não da ocorrência anterior.
 * Somar um mês repetidamente a partir da anterior faz um vencimento no dia 31
 * cair para 28 em fevereiro e nunca mais voltar ao 31 — o erro se acumula e a
 * série inteira desanda.
 */
export function occurrencesUntil(
  rule: Recurrence,
  horizon: CalendarDate,
): CalendarDate[] {
  if (!Number.isInteger(rule.interval) || rule.interval < 1) {
    throw new RecurrenceError(`Intervalo inválido: ${rule.interval}`);
  }
  if (
    rule.occurrenceLimit !== undefined &&
    rule.occurrenceLimit !== null &&
    (!Number.isInteger(rule.occurrenceLimit) || rule.occurrenceLimit < 1)
  ) {
    throw new RecurrenceError(
      `Quantidade de ocorrências inválida: ${rule.occurrenceLimit}`,
    );
  }

  const start = fromCalendarDate(rule.startDate);
  const anchorDay = start.getDate();
  const months = MONTHS_PER_STEP[rule.frequency] * rule.interval;
  const days = DAYS_PER_STEP[rule.frequency] * rule.interval;

  const limit = rule.occurrenceLimit ?? Number.POSITIVE_INFINITY;
  const dates: CalendarDate[] = [];

  for (let step = 0; dates.length < limit; step += 1) {
    const next =
      months > 0
        ? withDayOfMonth(addMonths(start, months * step), anchorDay)
        : addDays(start, days * step);

    const date = toCalendarDate(next);
    if (date > horizon) break;
    if (rule.endDate && date > rule.endDate) break;

    dates.push(date);

    // Salvaguarda contra regra que avance zero dias e gere série infinita.
    if (step > 10_000) {
      throw new RecurrenceError('Recorrência não avança no tempo');
    }
  }

  return dates;
}

/**
 * Ocorrências ainda não materializadas.
 *
 * `generatedUntil` guarda até onde a série já virou lançamento. Sem isso, abrir
 * o aplicativo duas vezes no mesmo dia criaria a mesma conta duas vezes.
 */
export function pendingOccurrences(
  rule: Recurrence,
  generatedUntil: CalendarDate | null,
  horizon: CalendarDate,
): CalendarDate[] {
  const all = occurrencesUntil(rule, horizon);
  return generatedUntil === null
    ? all
    : all.filter((date) => date > generatedUntil);
}

export const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  daily: 'Diária',
  weekly: 'Semanal',
  biweekly: 'Quinzenal',
  monthly: 'Mensal',
  bimonthly: 'Bimestral',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
  custom: 'Personalizada',
};
