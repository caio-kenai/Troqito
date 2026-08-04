import { getRandomBytes } from 'expo-crypto';

/**
 * UUID versão 7: 48 bits de tempo em milissegundos seguidos de bits
 * aleatórios. É gerado no dispositivo porque o aplicativo cria registros
 * offline e não pode esperar um identificador do servidor. Sendo ordenável no
 * tempo, também dá localidade aos índices, ao contrário do UUID v4.
 *
 * Layout conforme a RFC 9562:
 *   48 bits  timestamp em milissegundos
 *    4 bits  versão (7)
 *   12 bits  aleatório
 *    2 bits  variante (10)
 *   62 bits  aleatório
 */
export function uuidv7(now: number = Date.now()): string {
  const bytes = getRandomBytes(16);
  const timestamp = Math.floor(now);

  // Os seis primeiros bytes carregam o tempo, do mais significativo ao menos.
  bytes[0] = (timestamp / 2 ** 40) & 0xff;
  bytes[1] = (timestamp / 2 ** 32) & 0xff;
  bytes[2] = (timestamp / 2 ** 24) & 0xff;
  bytes[3] = (timestamp / 2 ** 16) & 0xff;
  bytes[4] = (timestamp / 2 ** 8) & 0xff;
  bytes[5] = timestamp & 0xff;

  // Versão 7 nos quatro bits altos do byte 6.
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x70;
  // Variante RFC nos dois bits altos do byte 8.
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function isUuidV7(value: string): boolean {
  return UUID_PATTERN.test(value);
}

/** Extrai o instante de criação embutido no identificador. */
export function timestampFromUuidV7(value: string): number {
  if (!isUuidV7(value)) {
    throw new Error(`Identificador não é um UUID v7: ${value}`);
  }
  const hex = value.replace(/-/g, '').slice(0, 12);
  return parseInt(hex, 16);
}
