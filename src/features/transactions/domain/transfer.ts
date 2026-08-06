import { uuidv7 } from '@/lib/id';
import { type Cents } from '@/lib/money';
import { type CalendarDate } from '@/lib/date';

export type TransferLeg = {
  id: string;
  kind: 'transfer';
  title: string;
  amount: Cents;
  date: CalendarDate;
  accountId: string;
  transferGroupId: string;
  /** Distingue a perna que sai da que entra sem depender do sinal do valor. */
  direction: 'out' | 'in';
  notes: string | null;
};

export type TransferInput = {
  amount: Cents;
  date: CalendarDate;
  fromAccountId: string;
  toAccountId: string;
  notes?: string | undefined;
};

export class TransferError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransferError';
  }
}

/**
 * Monta as duas pernas de uma transferência.
 *
 * As duas compartilham `transferGroupId`, o que permite exibi-las como uma
 * única operação, desfazê-las juntas e mantê-las fora dos totais de receita e
 * despesa. O valor é o mesmo nas duas: o que muda é a direção.
 */
export function buildTransferPair(
  input: TransferInput,
): [TransferLeg, TransferLeg] {
  if (input.fromAccountId === input.toAccountId) {
    throw new TransferError('Origem e destino precisam ser contas diferentes');
  }
  if (input.amount <= 0) {
    throw new TransferError(
      'O valor da transferência precisa ser maior que zero',
    );
  }

  const transferGroupId = uuidv7();
  const notes = input.notes?.trim() ? input.notes.trim() : null;

  return [
    {
      id: uuidv7(),
      kind: 'transfer',
      title: 'Transferência enviada',
      amount: input.amount,
      date: input.date,
      accountId: input.fromAccountId,
      transferGroupId,
      direction: 'out',
      notes,
    },
    {
      id: uuidv7(),
      kind: 'transfer',
      title: 'Transferência recebida',
      amount: input.amount,
      date: input.date,
      accountId: input.toAccountId,
      transferGroupId,
      direction: 'in',
      notes,
    },
  ];
}
