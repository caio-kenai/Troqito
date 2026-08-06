import * as Notifications from 'expo-notifications';

import { type CalendarDate } from '@/lib/date';

import {
  buildReminders,
  isSchedulable,
  reminderTrigger,
  type DueTransaction,
} from '../domain/reminders';

export async function canNotify(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  // Só pede quando a pessoa liga o lembrete, e não na abertura do aplicativo:
  // pedido sem contexto é negado, e depois de negado não se pergunta de novo.
  if (!current.canAskAgain) return false;

  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/**
 * Reagenda todos os lembretes.
 *
 * Cancela tudo antes de agendar de novo. Agendar por cima deixaria avisos de
 * contas já pagas ou excluídas continuarem tocando, e não há como saber quais
 * remover sem manter um índice paralelo que dessincroniza.
 */
export async function rescheduleReminders(
  transactions: readonly DueTransaction[],
  from: CalendarDate,
): Promise<number> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const reminders = buildReminders(transactions, from);
  let scheduled = 0;

  for (const reminder of reminders) {
    const trigger = reminderTrigger(reminder.date);
    if (!isSchedulable(trigger)) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.body,
        data: { transactionId: reminder.transactionId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
      },
    });

    scheduled += 1;
  }

  return scheduled;
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
