/**
 * Aritmética monetária do Troqito.
 *
 * Todo valor é um inteiro de centavos. Nenhuma operação usa ponto flutuante,
 * porque `0.1 + 0.2 !== 0.3` em IEEE 754 e, em um aplicativo de finanças, isso
 * vira divergência de centavo em fatura, divisão de despesa e orçamento.
 */

declare const centsBrand: unique symbol;

/** Inteiro de centavos. O tipo nominal impede somar centavos com reais. */
export type Cents = number & { readonly [centsBrand]: 'Cents' };

/** Porcentagem em milésimos de por cento: 10.000 equivale a 100%. */
declare const bpsBrand: unique symbol;
export type BasisPoints = number & { readonly [bpsBrand]: 'BasisPoints' };

export const BASIS_POINTS_SCALE = 10_000;

/**
 * Acima de `Number.MAX_SAFE_INTEGER` a soma de inteiros deixa de ser exata.
 * O limite equivale a cerca de noventa trilhões de reais, muito além de
 * qualquer uso legítimo, então estourá-lo indica erro de programação.
 */
export const MAX_CENTS = Number.MAX_SAFE_INTEGER;

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MoneyError';
  }
}

function assertSafe(value: number, context: string): void {
  if (!Number.isFinite(value)) {
    throw new MoneyError(`${context}: valor não é um número finito`);
  }
  if (!Number.isInteger(value)) {
    throw new MoneyError(`${context}: valor em centavos deve ser inteiro`);
  }
  if (Math.abs(value) > MAX_CENTS) {
    throw new MoneyError(`${context}: valor excede o limite seguro`);
  }
}

export function cents(value: number): Cents {
  assertSafe(value, 'cents');
  return value as Cents;
}

export const ZERO = cents(0);

/** Converte reais para centavos. Aceita apenas duas casas decimais. */
export function fromReais(value: number): Cents {
  if (!Number.isFinite(value)) {
    throw new MoneyError('fromReais: valor não é um número finito');
  }
  // O arredondamento absorve o erro de representação de valores como 19.99,
  // que em binário é 19.989999999999998.
  const result = Math.round(value * 100);
  assertSafe(result, 'fromReais');
  return result as Cents;
}

export function toReais(value: Cents): number {
  return value / 100;
}

export function add(a: Cents, b: Cents): Cents {
  return cents(a + b);
}

export function subtract(a: Cents, b: Cents): Cents {
  return cents(a - b);
}

export function negate(value: Cents): Cents {
  return cents(-value);
}

export function abs(value: Cents): Cents {
  return cents(Math.abs(value));
}

export function sum(values: readonly Cents[]): Cents {
  return values.reduce<Cents>((total, value) => add(total, value), ZERO);
}

/** Multiplica por uma quantidade inteira, como número de parcelas. */
export function multiply(value: Cents, factor: number): Cents {
  if (!Number.isInteger(factor)) {
    throw new MoneyError('multiply: o fator deve ser inteiro');
  }
  return cents(value * factor);
}

export function isZero(value: Cents): boolean {
  return value === 0;
}

export function isPositive(value: Cents): boolean {
  return value > 0;
}

export function isNegative(value: Cents): boolean {
  return value < 0;
}

export function compare(a: Cents, b: Cents): -1 | 0 | 1 {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function basisPoints(percent: number): BasisPoints {
  const value = Math.round(percent * 100);
  if (!Number.isFinite(value)) {
    throw new MoneyError('basisPoints: porcentagem inválida');
  }
  return value as BasisPoints;
}

/**
 * Distribui um valor entre participantes conforme pesos, sem perder nem criar
 * centavos. A sobra da divisão inteira é entregue um centavo por vez, na ordem
 * dos pesos, de modo que o resultado é determinístico e a soma das partes é
 * sempre exatamente igual ao total.
 */
export function allocate(total: Cents, weights: readonly number[]): Cents[] {
  if (weights.length === 0) {
    throw new MoneyError('allocate: é preciso ao menos um peso');
  }
  if (weights.some((weight) => !Number.isFinite(weight) || weight < 0)) {
    throw new MoneyError('allocate: pesos devem ser números não negativos');
  }

  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
  if (totalWeight <= 0) {
    throw new MoneyError('allocate: a soma dos pesos deve ser maior que zero');
  }

  const sign = total < 0 ? -1 : 1;
  const magnitude = Math.abs(total);

  const shares = weights.map((weight) =>
    Math.floor((magnitude * weight) / totalWeight),
  );

  let remainder = magnitude - shares.reduce((acc, share) => acc + share, 0);
  for (let index = 0; remainder > 0; index = (index + 1) % shares.length) {
    shares[index] = (shares[index] ?? 0) + 1;
    remainder -= 1;
  }

  return shares.map((share) => cents(share * sign));
}

/** Divide em partes iguais, distribuindo a sobra nas primeiras. */
export function split(total: Cents, parts: number): Cents[] {
  if (!Number.isInteger(parts) || parts < 1) {
    throw new MoneyError(
      'split: a quantidade de partes deve ser inteira e positiva',
    );
  }
  return allocate(total, new Array<number>(parts).fill(1));
}

/** Aplica uma porcentagem, arredondando para o centavo mais próximo. */
export function applyPercentage(value: Cents, percent: BasisPoints): Cents {
  const result = Math.round((value * percent) / BASIS_POINTS_SCALE);
  return cents(result);
}
