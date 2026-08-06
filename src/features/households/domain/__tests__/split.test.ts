import { basisPoints, cents, MoneyError } from '@/lib/money';

import {
  settlement,
  sharesAreBalanced,
  splitByAmount,
  splitByPercentage,
  splitEqually,
} from '../split';

const TOTAL = cents(10_00);

describe('splitEqually', () => {
  it('divide em partes iguais quando o total é divisível', () => {
    const shares = splitEqually(cents(9_00), ['a', 'b', 'c']);

    expect(shares.map((share) => share.amount)).toEqual([300, 300, 300]);
  });

  it('distribui o centavo que sobra em vez de perdê-lo', () => {
    // R$ 10,00 entre três: 3,34 / 3,33 / 3,33. Somando, exatamente 10,00.
    const shares = splitEqually(TOTAL, ['a', 'b', 'c']);

    expect(shares.map((share) => share.amount)).toEqual([334, 333, 333]);
    expect(sharesAreBalanced(shares, TOTAL)).toBe(true);
  });

  it('mantém a soma exata em divisões difíceis', () => {
    for (const total of [1, 2, 7, 99, 101, 9_999, 123_45]) {
      for (const people of [2, 3, 6, 7, 11]) {
        const members = Array.from({ length: people }, (_u, i) => `m${i}`);
        const shares = splitEqually(cents(total), members);

        expect(sharesAreBalanced(shares, cents(total))).toBe(true);
      }
    }
  });

  it('recusa divisão sem participante', () => {
    expect(() => splitEqually(TOTAL, [])).toThrow(MoneyError);
  });

  it('divide valor que não dá para todo mundo sem deixar negativo', () => {
    // Dois centavos entre três pessoas: alguém fica com zero, ninguém fica
    // devendo, e a soma continua fechando.
    const shares = splitEqually(cents(2), ['a', 'b', 'c']);

    expect(shares.map((share) => share.amount)).toEqual([1, 1, 0]);
    expect(sharesAreBalanced(shares, cents(2))).toBe(true);
  });
});

describe('splitByPercentage', () => {
  it('reparte conforme as porcentagens informadas', () => {
    const shares = splitByPercentage(cents(100_00), [
      { memberId: 'a', percentage: basisPoints(70) },
      { memberId: 'b', percentage: basisPoints(30) },
    ]);

    expect(shares.map((share) => share.amount)).toEqual([70_00, 30_00]);
  });

  it('recusa porcentagens que não somam cem', () => {
    expect(() =>
      splitByPercentage(TOTAL, [
        { memberId: 'a', percentage: basisPoints(60) },
        { memberId: 'b', percentage: basisPoints(30) },
      ]),
    ).toThrow(/somam 90%/);
  });

  it('recusa porcentagens que passam de cem', () => {
    expect(() =>
      splitByPercentage(TOTAL, [
        { memberId: 'a', percentage: basisPoints(60) },
        { memberId: 'b', percentage: basisPoints(50) },
      ]),
    ).toThrow(/somam 110%/);
  });

  it('fecha o total mesmo com porcentagem de dízima', () => {
    const shares = splitByPercentage(cents(10_00), [
      { memberId: 'a', percentage: basisPoints(33.33) },
      { memberId: 'b', percentage: basisPoints(33.33) },
      { memberId: 'c', percentage: basisPoints(33.34) },
    ]);

    expect(sharesAreBalanced(shares, cents(10_00))).toBe(true);
  });

  it('guarda a porcentagem, para a edição poder voltar ao que foi digitado', () => {
    const shares = splitByPercentage(TOTAL, [
      { memberId: 'a', percentage: basisPoints(100) },
    ]);

    expect(shares[0]?.percentage).toBe(10_000);
  });
});

describe('splitByAmount', () => {
  it('aceita valores que fecham o total', () => {
    const shares = splitByAmount(TOTAL, [
      { memberId: 'a', amount: cents(6_00) },
      { memberId: 'b', amount: cents(4_00) },
    ]);

    expect(sharesAreBalanced(shares, TOTAL)).toBe(true);
  });

  it('avisa quanto falta para fechar', () => {
    expect(() =>
      splitByAmount(TOTAL, [{ memberId: 'a', amount: cents(6_00) }]),
    ).toThrow(/faltam 400 centavos/);
  });

  it('avisa quanto sobra além do total', () => {
    expect(() =>
      splitByAmount(TOTAL, [
        { memberId: 'a', amount: cents(6_00) },
        { memberId: 'b', amount: cents(5_00) },
      ]),
    ).toThrow(/sobram 100 centavos/);
  });

  it('recusa divisão sem participante', () => {
    expect(() => splitByAmount(TOTAL, [])).toThrow(MoneyError);
  });
});

describe('settlement', () => {
  const shares = [
    { memberId: 'ana', amount: cents(334) },
    { memberId: 'bia', amount: cents(333) },
    { memberId: 'caio', amount: cents(333) },
  ];

  it('não cria dívida de quem pagou consigo mesmo', () => {
    const debts = settlement(shares, 'ana');

    expect(debts.map((debt) => debt.memberId)).toEqual(['bia', 'caio']);
    expect(debts.every((debt) => debt.toMemberId === 'ana')).toBe(true);
  });

  it('omite quem ficou com parte zero', () => {
    // Linha de R$ 0,00 no acerto é ruído que esconde o que importa.
    const debts = settlement(
      [
        { memberId: 'ana', amount: cents(10_00) },
        { memberId: 'bia', amount: cents(0) },
      ],
      'ana',
    );

    expect(debts).toEqual([]);
  });

  it('soma das dívidas é o total menos a parte de quem pagou', () => {
    const debts = settlement(shares, 'ana');
    const owed = debts.reduce((acc, debt) => acc + debt.amount, 0);

    expect(owed).toBe(666);
  });
});
