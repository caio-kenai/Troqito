/**
 * Mascaramento de valores na tela.
 *
 * Serve para conferir o aplicativo em lugar público sem expor quanto se tem. O
 * mascaramento é só de exibição: o valor continua íntegro na memória e no
 * banco, porque esconder na origem quebraria todo cálculo.
 */

const MASK_CHARACTER = '•';

/**
 * Substitui os algarismos por marcadores, preservando o resto.
 *
 * O símbolo da moeda, o separador e o sinal continuam visíveis: quem olha
 * precisa reconhecer que ali há um valor, e se ele é positivo ou negativo, sem
 * conseguir ler quanto.
 */
export function maskAmount(formatted: string): string {
  return formatted.replace(/\d/g, MASK_CHARACTER);
}

export function maybeMask(formatted: string, masked: boolean): string {
  return masked ? maskAmount(formatted) : formatted;
}

/**
 * Texto alternativo para leitor de tela quando o valor está mascarado.
 *
 * Ler os marcadores em voz alta não diria nada. A leitura anuncia que o valor
 * está oculto, o que é a informação verdadeira naquele momento.
 */
export function maskedAccessibilityLabel(label: string): string {
  return `${label}: valor oculto`;
}
