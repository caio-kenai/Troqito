import { type CalendarDate } from '@/lib/date';
import { formatCents, type Cents } from '@/lib/money';

export type DueTransaction = {
  id: string;
  title: string;
  amount: Cents;
  dueDate: CalendarDate;
  kind: string;
  status: string;
};

export type Reminder = {
  transactionId: string;
  title: string;
  body: string;
  /** Dia em que a notificação deve aparecer. */
  date: CalendarDate;
};

/**
 * Lembretes de vencimento.
 *
 * Só entram lançamentos previstos ou pendentes: avisar sobre algo já pago é a
 * forma mais rápida de a pessoa desligar as notificações do aplicativo.
 *
 * O lembrete cai no próprio dia do vencimento. Antecipar em dias fixos gera
 * avisos para contas que a pessoa já programou, e o excesso tem o mesmo
 * destino do aviso inútil.
 */
export function buildReminders(
  transactions: readonly DueTransaction[],
  from: CalendarDate,
): Reminder[] {
  return transactions
    .filter((transaction) => {
      if (
        transaction.status !== 'planned' &&
        transaction.status !== 'pending'
      ) {
        return false;
      }
      // Vencimento passado não vira lembrete futuro: não há quando agendá-lo.
      return transaction.dueDate >= from;
    })
    .map((transaction) => ({
      transactionId: transaction.id,
      title:
        transaction.kind === 'income'
          ? 'Recebimento previsto'
          : 'Conta a pagar',
      body: `${transaction.title} — ${formatCents(transaction.amount)}`,
      date: transaction.dueDate,
    }));
}

/**
 * Momento de disparar o lembrete, no fuso do aparelho.
 *
 * Nove da manhã: cedo o bastante para dar tempo de pagar no mesmo dia, tarde o
 * bastante para não acordar ninguém.
 */
export const REMINDER_HOUR = 9;

export function reminderTrigger(date: CalendarDate): Date {
  const [year, month, day] = date.split('-').map(Number);

  return new Date(
    year ?? 1970,
    (month ?? 1) - 1,
    day ?? 1,
    REMINDER_HOUR,
    0,
    0,
    0,
  );
}

/** Lembretes que já passaram da hora não são agendados. */
export function isSchedulable(trigger: Date, now: Date = new Date()): boolean {
  return trigger.getTime() > now.getTime();
}
