/**
 * Cálculo de contraste conforme a WCAG 2.1. Existe para que o contraste do tema
 * seja verificado por teste automatizado, e não por inspeção visual.
 */

export const WCAG_AA_NORMAL = 4.5;
export const WCAG_AA_LARGE = 3;

function parseHex(color: string): [number, number, number] {
  const hex = color.replace('#', '');
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex;

  if (full.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`Cor hexadecimal inválida: ${color}`);
  }

  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function channelLuminance(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(color: string): number {
  const [r, g, b] = parseHex(color);
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsContrast(
  foreground: string,
  background: string,
  minimum: number = WCAG_AA_NORMAL,
): boolean {
  return contrastRatio(foreground, background) >= minimum;
}
