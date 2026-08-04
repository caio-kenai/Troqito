import {
  abs,
  add,
  allocate,
  applyPercentage,
  basisPoints,
  cents,
  compare,
  fromReais,
  MAX_CENTS,
  MoneyError,
  multiply,
  negate,
  split,
  subtract,
  sum,
  toReais,
  ZERO,
} from '../money';

describe('construção', () => {
  it('rejeita centavos fracionados', () => {
    expect(() => cents(10.5)).toThrow(MoneyError);
  });

  it('rejeita valores não finitos', () => {
    expect(() => cents(Number.POSITIVE_INFINITY)).toThrow(MoneyError);
    expect(() => cents(Number.NaN)).toThrow(MoneyError);
  });

  it('rejeita valores além do limite seguro', () => {
    expect(() => cents(MAX_CENTS + 1)).toThrow(/limite seguro/);
  });

  // É a razão de existir deste módulo: 19.99 não é representável em binário.
  it('converte reais sem herdar o erro do ponto flutuante', () => {
    expect(fromReais(19.99)).toBe(1999);
    expect(fromReais(0.1) + fromReais(0.2)).toBe(fromReais(0.3));
    expect(fromReais(1234.56)).toBe(123456);
  });

  it('converte de volta para reais', () => {
    expect(toReais(cents(123456))).toBe(1234.56);
  });
});

describe('operações', () => {
  it('soma e subtrai sem perda', () => {
    expect(add(cents(1999), cents(1))).toBe(2000);
    expect(subtract(cents(1000), cents(1999))).toBe(-999);
  });

  it('soma uma lista, inclusive vazia', () => {
    expect(sum([cents(100), cents(250), cents(-50)])).toBe(300);
    expect(sum([])).toBe(ZERO);
  });

  it('multiplica apenas por inteiros', () => {
    expect(multiply(cents(1999), 12)).toBe(23988);
    expect(() => multiply(cents(100), 1.5)).toThrow(/inteiro/);
  });

  it('nega e toma o valor absoluto', () => {
    expect(negate(cents(500))).toBe(-500);
    expect(abs(cents(-500))).toBe(500);
  });

  it('compara valores', () => {
    expect(compare(cents(100), cents(200))).toBe(-1);
    expect(compare(cents(200), cents(100))).toBe(1);
    expect(compare(cents(100), cents(100))).toBe(0);
  });
});

describe('allocate', () => {
  // A propriedade que não pode ser violada em nenhuma hipótese.
  it('preserva o total exato ao dividir por três', () => {
    const parts = allocate(cents(10_000), [1, 1, 1]);
    expect(parts).toEqual([3334, 3333, 3333]);
    expect(sum(parts)).toBe(10_000);
  });

  it('distribui a sobra de forma determinística', () => {
    expect(allocate(cents(10), [1, 1, 1, 1])).toEqual([3, 3, 2, 2]);
  });

  it('respeita pesos diferentes', () => {
    const parts = allocate(cents(10_000), [50, 30, 20]);
    expect(parts).toEqual([5000, 3000, 2000]);
    expect(sum(parts)).toBe(10_000);
  });

  it('preserva o total com pesos que não dividem exato', () => {
    const parts = allocate(cents(10_000), [1, 2]);
    expect(sum(parts)).toBe(10_000);
    expect(parts).toEqual([3334, 6666]);
  });

  it('funciona com valores negativos', () => {
    const parts = allocate(cents(-10_000), [1, 1, 1]);
    expect(sum(parts)).toBe(-10_000);
    expect(parts).toEqual([-3334, -3333, -3333]);
  });

  it('aceita peso zero sem entregar centavos a ele', () => {
    const parts = allocate(cents(300), [1, 0, 1]);
    expect(sum(parts)).toBe(300);
    expect(parts[1]).toBe(0);
  });

  it('rejeita entradas inválidas', () => {
    expect(() => allocate(cents(100), [])).toThrow(/ao menos um peso/);
    expect(() => allocate(cents(100), [-1, 2])).toThrow(/não negativos/);
    expect(() => allocate(cents(100), [0, 0])).toThrow(/maior que zero/);
  });
});

describe('split', () => {
  it('divide em partes iguais preservando o total', () => {
    expect(split(cents(10_000), 3)).toEqual([3334, 3333, 3333]);
  });

  it('devolve o próprio valor quando há uma parte', () => {
    expect(split(cents(999), 1)).toEqual([999]);
  });

  it('rejeita quantidade inválida', () => {
    expect(() => split(cents(100), 0)).toThrow(/inteira e positiva/);
    expect(() => split(cents(100), 2.5)).toThrow(/inteira e positiva/);
  });

  // Cobre a regra em toda a faixa que um parcelamento pode assumir.
  it.each([1, 2, 3, 6, 7, 9, 11, 12, 18, 24, 36, 48])(
    'preserva o total em %i parcelas para qualquer valor',
    (parts) => {
      for (const total of [1, 7, 99, 100, 1999, 123_457, 999_999]) {
        const installments = split(cents(total), parts);
        expect(sum(installments)).toBe(total);
        expect(installments).toHaveLength(parts);
        // Nenhuma parcela pode diferir de outra em mais de um centavo.
        const maximum = Math.max(...installments);
        const minimum = Math.min(...installments);
        expect(maximum - minimum).toBeLessThanOrEqual(1);
      }
    },
  );
});

describe('applyPercentage', () => {
  it('aplica porcentagens exatas', () => {
    expect(applyPercentage(cents(10_000), basisPoints(50))).toBe(5000);
    expect(applyPercentage(cents(10_000), basisPoints(100))).toBe(10_000);
    expect(applyPercentage(cents(10_000), basisPoints(0))).toBe(0);
  });

  it('aceita casas decimais na porcentagem', () => {
    expect(applyPercentage(cents(100_000), basisPoints(33.33))).toBe(33_330);
  });

  it('arredonda para o centavo mais próximo', () => {
    expect(applyPercentage(cents(101), basisPoints(50))).toBe(51);
  });
});
