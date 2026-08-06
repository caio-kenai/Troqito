import { cents } from '@/lib/money';

import { buildTransferPair, TransferError } from '../transfer';

// Os bytes variam a cada chamada, como na fonte real: sem isso, dois
// identificadores gerados no mesmo milissegundo sairiam idênticos.
jest.mock('expo-crypto', () => {
  let call = 0;
  return {
    getRandomBytes: (length: number) => {
      call += 1;
      return Uint8Array.from(
        { length },
        (_, index) => (index * 53 + call * 31) % 256,
      );
    },
  };
});

const input = {
  amount: cents(30_000),
  date: '2026-03-05',
  fromAccountId: 'conta-corrente',
  toAccountId: 'poupanca',
};

describe('buildTransferPair', () => {
  it('cria duas pernas com o mesmo valor', () => {
    const [out, into] = buildTransferPair(input);

    expect(out.amount).toBe(30_000);
    expect(into.amount).toBe(30_000);
  });

  it('liga as duas pernas pelo mesmo grupo', () => {
    const [out, into] = buildTransferPair(input);

    expect(out.transferGroupId).toBe(into.transferGroupId);
    expect(out.id).not.toBe(into.id);
  });

  it('associa cada perna à sua conta e direção', () => {
    const [out, into] = buildTransferPair(input);

    expect(out).toMatchObject({
      accountId: 'conta-corrente',
      direction: 'out',
    });
    expect(into).toMatchObject({ accountId: 'poupanca', direction: 'in' });
  });

  // A direção precisa vir do campo, não do sinal, para o saldo não depender de
  // interpretar um valor negativo.
  it('mantém o valor positivo nas duas pernas', () => {
    const [out, into] = buildTransferPair(input);

    expect(out.amount).toBeGreaterThan(0);
    expect(into.amount).toBeGreaterThan(0);
  });

  it('recusa transferência para a mesma conta', () => {
    expect(() =>
      buildTransferPair({ ...input, toAccountId: 'conta-corrente' }),
    ).toThrow(TransferError);
  });

  it('recusa valor zero ou negativo', () => {
    expect(() => buildTransferPair({ ...input, amount: cents(0) })).toThrow(
      /maior que zero/,
    );
    expect(() => buildTransferPair({ ...input, amount: cents(-100) })).toThrow(
      /maior que zero/,
    );
  });

  it('normaliza observação vazia para nulo', () => {
    const [out] = buildTransferPair({ ...input, notes: '   ' });
    expect(out.notes).toBeNull();

    const [withNotes] = buildTransferPair({ ...input, notes: '  reserva  ' });
    expect(withNotes.notes).toBe('reserva');
  });

  it('usa a mesma data nas duas pernas', () => {
    const [out, into] = buildTransferPair(input);

    expect(out.date).toBe('2026-03-05');
    expect(into.date).toBe('2026-03-05');
  });
});
