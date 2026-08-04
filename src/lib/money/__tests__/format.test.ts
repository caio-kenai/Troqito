import { formatCents, parseAmountToCents } from '../format';
import { cents } from '../money';

describe('formatCents', () => {
  it.each([
    [0, 'R$ 0,00'],
    [1, 'R$ 0,01'],
    [99, 'R$ 0,99'],
    [100, 'R$ 1,00'],
    [1999, 'R$ 19,99'],
    [123456, 'R$ 1.234,56'],
    [100000000, 'R$ 1.000.000,00'],
  ])('formata %i centavos como %s', (value, expected) => {
    expect(formatCents(cents(value))).toBe(expected);
  });

  it('usa o sinal de menos tipográfico em valores negativos', () => {
    expect(formatCents(cents(-123456))).toBe('−R$ 1.234,56');
  });

  it('mostra o sinal positivo quando pedido, para receitas', () => {
    expect(formatCents(cents(4200), { showPositiveSign: true })).toBe(
      '+R$ 42,00',
    );
    expect(formatCents(cents(0), { showPositiveSign: true })).toBe('+R$ 0,00');
  });

  it('omite o símbolo quando pedido', () => {
    expect(formatCents(cents(123456), { showSymbol: false })).toBe('1.234,56');
  });
});

describe('parseAmountToCents', () => {
  it.each([
    ['1234,56', 123456],
    ['1.234,56', 123456],
    ['R$ 1.234,56', 123456],
    ['1234.56', 123456],
    ['0,01', 1],
    ['0,1', 10],
    ['10', 1000],
    ['1.234', 123400],
    ['1.234.567', 123456700],
    ['  42  ', 4200],
  ])('interpreta %s como %i centavos', (input, expected) => {
    expect(parseAmountToCents(input)).toBe(expected);
  });

  it('interpreta valores negativos', () => {
    expect(parseAmountToCents('-1234,56')).toBe(-123456);
    expect(parseAmountToCents('−42')).toBe(-4200);
    expect(parseAmountToCents('(42)')).toBe(-4200);
  });

  it('ignora casas decimais além da segunda', () => {
    expect(parseAmountToCents('1,999')).toBe(199900);
  });

  it.each(['', '   ', 'abc', 'R$', '12a3', '--'])(
    'devolve nulo para a entrada inválida %p',
    (input) => {
      expect(parseAmountToCents(input)).toBeNull();
    },
  );

  it('percorre o ciclo de formatar e interpretar sem perda', () => {
    for (const value of [0, 1, 99, 100, 1999, 123456, 100000000]) {
      const formatted = formatCents(cents(value));
      expect(parseAmountToCents(formatted)).toBe(value);
    }
  });
});
