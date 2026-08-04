import { type Cents, MoneyError } from './money';

/**
 * Formatação monetária escrita à mão, e não com `Intl.NumberFormat`.
 *
 * O Hermes no Android e o Node nos testes não expõem o mesmo conjunto de dados
 * de internacionalização, então o `Intl` produz saídas sutilmente diferentes nos
 * dois ambientes — inclusive no caractere de espaço entre o símbolo e o número.
 * Um valor monetário precisa sair idêntico na tela, no relatório e no teste.
 */

export type CurrencyFormatOptions = {
  /** Omite o símbolo, útil em tabelas com o símbolo no cabeçalho. */
  showSymbol?: boolean;
  /** Força o sinal `+` em valores positivos, para receitas. */
  showPositiveSign?: boolean;
};

const GROUP_SEPARATOR = '.';
const DECIMAL_SEPARATOR = ',';
const SYMBOL = 'R$';
/** Sinal de menos tipográfico: alinha melhor que o hífen em coluna de valores. */
const MINUS = '−';

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEPARATOR);
}

export function formatCents(
  value: Cents,
  { showSymbol = true, showPositiveSign = false }: CurrencyFormatOptions = {},
): string {
  const negative = value < 0;
  const magnitude = Math.abs(value);

  const whole = Math.floor(magnitude / 100).toString();
  const fraction = (magnitude % 100).toString().padStart(2, '0');

  const number = `${groupThousands(whole)}${DECIMAL_SEPARATOR}${fraction}`;
  const body = showSymbol ? `${SYMBOL} ${number}` : number;

  if (negative) return `${MINUS}${body}`;
  if (showPositiveSign) return `+${body}`;
  return body;
}

/**
 * Interpreta o que a pessoa digitou. Aceita as formas usuais no Brasil e
 * também o ponto como separador decimal, comum em quem digita no teclado
 * numérico. Devolve `null` quando a entrada não representa um valor.
 */
export function parseAmountToCents(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;

  const withoutSymbol = trimmed.replace(/R\$/gi, '').replace(/\s/g, '');
  const negative = /^[-−(]/.test(withoutSymbol) || /\)$/.test(withoutSymbol);
  const digitsOnly = withoutSymbol.replace(/[-−()]/g, '');

  if (!/^[\d.,]+$/.test(digitsOnly)) return null;

  const lastComma = digitsOnly.lastIndexOf(',');
  const lastDot = digitsOnly.lastIndexOf('.');
  const decimalIndex = Math.max(lastComma, lastDot);

  let whole: string;
  let fraction: string;

  // Um separador só é decimal quando deixa no máximo dois dígitos à direita.
  // Assim "1.234" é interpretado como mil duzentos e trinta e quatro, e
  // "1.23" como um real e vinte e três centavos.
  if (decimalIndex === -1 || digitsOnly.length - decimalIndex - 1 > 2) {
    whole = digitsOnly.replace(/[.,]/g, '');
    fraction = '';
  } else {
    whole = digitsOnly.slice(0, decimalIndex).replace(/[.,]/g, '');
    fraction = digitsOnly.slice(decimalIndex + 1);
  }

  if (whole === '' && fraction === '') return null;

  const normalized = `${whole || '0'}${fraction.padEnd(2, '0').slice(0, 2)}`;
  const parsed = Number(normalized);

  if (!Number.isSafeInteger(parsed)) {
    throw new MoneyError('parseAmountToCents: valor excede o limite seguro');
  }

  return negative ? -parsed : parsed;
}
