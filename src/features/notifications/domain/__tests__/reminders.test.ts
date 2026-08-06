import { cents } from '@/lib/money';

import {
  buildReminders,
  isSchedulable,
  REMINDER_HOUR,
  reminderTrigger,
  type DueTransaction,
} from '../reminders';

const HOJE = '2026-03-15';

function due(partial: Partial<DueTransaction> = {}): DueTransaction {
  return {
    id: 't1',
    title: 'Aluguel',
    amount: cents(1_500_00),
    dueDate: '2026-03-20',
    kind: 'expense',
    status: 'pending',
    ...partial,
  };
}

describe('buildReminders', () => {
  it('cria lembrete para conta pendente', () => {
    const reminders = buildReminders([due()], HOJE);

    expect(reminders).toHaveLength(1);
    expect(reminders[0]?.title).toBe('Conta a pagar');
    expect(reminders[0]?.body).toContain('Aluguel');
    expect(reminders[0]?.body).toContain('R$ 1.500,00');
  });

  it('cria lembrete para lançamento previsto', () => {
    expect(buildReminders([due({ status: 'planned' })], HOJE)).toHaveLength(1);
  });

  it('não avisa sobre o que já foi pago', () => {
    // Avisar sobre conta paga é a forma mais rápida de a pessoa desligar as
    // notificações do aplicativo.
    expect(buildReminders([due({ status: 'settled' })], HOJE)).toEqual([]);
  });

  it('não avisa sobre lançamento cancelado', () => {
    expect(buildReminders([due({ status: 'canceled' })], HOJE)).toEqual([]);
  });

  it('não cria lembrete para vencimento já passado', () => {
    expect(buildReminders([due({ dueDate: '2026-03-01' })], HOJE)).toEqual([]);
  });

  it('inclui o vencimento de hoje', () => {
    expect(buildReminders([due({ dueDate: HOJE })], HOJE)).toHaveLength(1);
  });

  it('distingue recebimento de pagamento', () => {
    const reminders = buildReminders([due({ kind: 'income' })], HOJE);

    expect(reminders[0]?.title).toBe('Recebimento previsto');
  });

  it('agenda no próprio dia do vencimento', () => {
    expect(buildReminders([due()], HOJE)[0]?.date).toBe('2026-03-20');
  });
});

describe('reminderTrigger', () => {
  it('dispara às nove da manhã', () => {
    const trigger = reminderTrigger('2026-03-20');

    expect(trigger.getHours()).toBe(REMINDER_HOUR);
    expect(trigger.getMinutes()).toBe(0);
  });

  it('usa o dia informado', () => {
    const trigger = reminderTrigger('2026-03-20');

    expect(trigger.getFullYear()).toBe(2026);
    expect(trigger.getMonth()).toBe(2);
    expect(trigger.getDate()).toBe(20);
  });
});

describe('isSchedulable', () => {
  it('aceita horário no futuro', () => {
    expect(
      isSchedulable(
        reminderTrigger('2026-03-20'),
        new Date(2026, 2, 15, 12, 0, 0),
      ),
    ).toBe(true);
  });

  it('recusa horário que já passou', () => {
    expect(
      isSchedulable(
        reminderTrigger('2026-03-15'),
        new Date(2026, 2, 15, 12, 0, 0),
      ),
    ).toBe(false);
  });
});
