import { cents, MoneyError } from '@/lib/money';

import {
  buildInstallments,
  installmentLabel,
  MAX_INSTALLMENTS,
  remainingAmount,
} from '../installments';

describe('buildInstallments', () => {
  it('numera as parcelas a partir de um', () => {
    const parcels = buildInstallments(cents(300), 3, '2026-03-10');

    expect(parcels.map((parcel) => parcel.number)).toEqual([1, 2, 3]);
  });

  it('distribui o resto em vez de perdê-lo', () => {
    // R$ 100,00 em três: 33,34 + 33,33 + 33,33, somando exatamente 100,00.
    const parcels = buildInstallments(cents(100_00), 3, '2026-03-10');

    expect(parcels.map((parcel) => parcel.amount)).toEqual([3334, 3333, 3333]);
  });

  it('a soma das parcelas é sempre o total da compra', () => {
    for (const total of [1, 7, 99, 100_00, 1_234_56]) {
      for (const count of [1, 2, 3, 6, 12, 18]) {
        const parcels = buildInstallments(cents(total), count, '2026-01-15');
        const sum = parcels.reduce((acc, parcel) => acc + parcel.amount, 0);

        expect(sum).toBe(total);
      }
    }
  });

  it('avança o vencimento mês a mês', () => {
    const parcels = buildInstallments(cents(300), 3, '2026-03-10');

    expect(parcels.map((parcel) => parcel.dueDate)).toEqual([
      '2026-03-10',
      '2026-04-10',
      '2026-05-10',
    ]);
  });

  it('mantém o dia 31 depois de passar por um mês curto', () => {
    const parcels = buildInstallments(cents(400), 4, '2026-01-31');

    expect(parcels.map((parcel) => parcel.dueDate)).toEqual([
      '2026-01-31',
      '2026-02-28',
      '2026-03-31',
      '2026-04-30',
    ]);
  });

  it('aceita compra à vista como parcela única', () => {
    const parcels = buildInstallments(cents(50_00), 1, '2026-03-10');

    expect(parcels).toHaveLength(1);
    expect(parcels[0]?.amount).toBe(50_00);
  });

  it('recusa quantidade de parcelas inválida', () => {
    expect(() => buildInstallments(cents(100), 0, '2026-03-10')).toThrow(
      MoneyError,
    );
    expect(() => buildInstallments(cents(100), -2, '2026-03-10')).toThrow(
      MoneyError,
    );
    expect(() => buildInstallments(cents(100), 2.5, '2026-03-10')).toThrow(
      MoneyError,
    );
  });

  it('recusa parcelamento acima do limite', () => {
    expect(() =>
      buildInstallments(cents(100), MAX_INSTALLMENTS + 1, '2026-03-10'),
    ).toThrow(/limite/);
  });

  it('recusa parcelar valor zero', () => {
    expect(() => buildInstallments(cents(0), 3, '2026-03-10')).toThrow(/zero/);
  });

  it('parcela valor menor que a quantidade de parcelas sem criar negativo', () => {
    // Dois centavos em três parcelas: a última fica zerada, nenhuma negativa.
    const parcels = buildInstallments(cents(2), 3, '2026-03-10');

    expect(parcels.map((parcel) => parcel.amount)).toEqual([1, 1, 0]);
  });
});

describe('installmentLabel', () => {
  it('escreve como aparece em fatura', () => {
    expect(installmentLabel(3, 12)).toBe('3/12');
  });
});

describe('remainingAmount', () => {
  const parcels = buildInstallments(cents(300), 3, '2026-03-10');

  it('soma apenas o que ainda não venceu', () => {
    expect(remainingAmount(parcels, '2026-03-10')).toBe(200);
  });

  it('devolve zero quando tudo já venceu', () => {
    expect(remainingAmount(parcels, '2026-12-31')).toBe(0);
  });

  it('devolve o total quando nada venceu', () => {
    expect(remainingAmount(parcels, '2026-01-01')).toBe(300);
  });
});
