import { type Theme } from '@/theme';

/**
 * Cores das séries dos gráficos.
 *
 * A ordem não é decorativa: as duas primeiras são as mais distinguíveis entre
 * si, e a sequência mantém diferença de luminosidade além da diferença de
 * matiz. Assim as fatias continuam separáveis por quem não distingue as cores,
 * e em impressão em preto e branco.
 */
export function seriesColors(theme: Theme): string[] {
  return theme.name === 'light'
    ? ['#0B7540', '#2E6FCC', '#C98A12', '#8B1F24', '#5FA82A', '#6B7A74']
    : ['#5CC48D', '#8FB6EE', '#F5CC7A', '#F09A9C', '#B7E886', '#C2CCC7'];
}

/** Cor da série pelo índice, repetindo a paleta quando houver mais séries. */
export function seriesColor(theme: Theme, index: number): string {
  const colors = seriesColors(theme);
  return colors[index % colors.length] ?? theme.colors.primary;
}
