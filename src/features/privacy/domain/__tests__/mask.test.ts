import { cents, formatCents } from '@/lib/money';

import { maskAmount, maskedAccessibilityLabel, maybeMask } from '../mask';

describe('maskAmount', () => {
  it('esconde os algarismos', () => {
    expect(maskAmount('R$ 1.234,56')).toBe('R$ •.•••,••');
  });

  it('preserva o símbolo da moeda e os separadores', () => {
    // Quem olha precisa reconhecer que ali há um valor, sem ler quanto.
    const masked = maskAmount(formatCents(cents(1_234_56)));

    expect(masked).toContain('R$');
    expect(masked).toContain('.');
    expect(masked).toContain(',');
  });

  it('preserva o sinal negativo', () => {
    const masked = maskAmount(formatCents(cents(-50_00)));

    expect(masked.startsWith('−')).toBe(true);
  });

  it('preserva o sinal positivo explícito', () => {
    const masked = maskAmount(
      formatCents(cents(50_00), { showPositiveSign: true }),
    );

    expect(masked.startsWith('+')).toBe(true);
  });

  it('não deixa passar nenhum algarismo', () => {
    expect(/\d/.test(maskAmount('R$ 9.876.543,21'))).toBe(false);
  });

  it('não altera texto sem número', () => {
    expect(maskAmount('sem valor')).toBe('sem valor');
  });
});

describe('maybeMask', () => {
  it('devolve o valor inteiro quando não está mascarado', () => {
    expect(maybeMask('R$ 10,00', false)).toBe('R$ 10,00');
  });

  it('esconde quando está mascarado', () => {
    expect(maybeMask('R$ 10,00', true)).toBe('R$ ••,••');
  });
});

describe('maskedAccessibilityLabel', () => {
  it('anuncia que o valor está oculto', () => {
    // Ler os marcadores em voz alta não diria nada a quem usa leitor de tela.
    expect(maskedAccessibilityLabel('Saldo total')).toBe(
      'Saldo total: valor oculto',
    );
  });
});
