/**
 * Geração de CSV.
 *
 * O formato é simples até o dia em que um campo tem vírgula, aspas ou quebra de
 * linha — e uma descrição de despesa tem tudo isso. Sem escapar, o arquivo abre
 * com as colunas deslocadas e a pessoa só percebe depois de conferir tudo.
 */

/** Separador padrão de planilha em português: o Excel em pt-BR espera ponto e vírgula. */
export const DEFAULT_DELIMITER = ';';

export function escapeField(value: string, delimiter: string): string {
  const needsQuotes =
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r');

  if (!needsQuotes) return value;

  // Aspas dentro do campo são dobradas, como manda o RFC 4180.
  return `"${value.replace(/"/g, '""')}"`;
}

export function toCsv(
  headers: readonly string[],
  rows: readonly (readonly string[])[],
  delimiter: string = DEFAULT_DELIMITER,
): string {
  const line = (fields: readonly string[]) =>
    fields.map((field) => escapeField(field, delimiter)).join(delimiter);

  return [line(headers), ...rows.map(line)].join('\r\n');
}

/**
 * Marca de ordem de bytes.
 *
 * Sem ela, o Excel abre o arquivo em codificação do sistema e todo acento vira
 * caractere estranho — a exportação parece corrompida sem estar.
 */
export const UTF8_BOM = '\ufeff';

export function withBom(content: string): string {
  return `${UTF8_BOM}${content}`;
}
