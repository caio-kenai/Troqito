/**
 * Tokens brutos do Troqito. Nenhum componente deve importar valores daqui
 * diretamente: use o tema (`useTheme`), que mapeia estes tokens para papéis
 * semânticos e muda conforme o modo claro ou escuro.
 */

/** Verde da marca, derivado do ícone do aplicativo. */
export const green = {
  50: '#E8F7EE',
  100: '#C6EBD6',
  200: '#93DAB4',
  300: '#5CC48D',
  400: '#2FAC6C',
  500: '#12904F',
  600: '#0B7540',
  700: '#0A5C34',
  800: '#084527',
  900: '#052D1A',
} as const;

/** Verde-limão de destaque, usado com parcimônia em ênfase e progresso. */
export const lime = {
  300: '#B7E886',
  400: '#9BDC5E',
  500: '#7CC93B',
  600: '#5FA82A',
} as const;

/** Neutros levemente esverdeados, para não brigar com a marca. */
export const neutral = {
  0: '#FFFFFF',
  50: '#F7F9F8',
  100: '#EDF1EF',
  200: '#DDE4E0',
  300: '#C2CCC7',
  400: '#96A39D',
  500: '#6B7A74',
  600: '#4C5955',
  700: '#36413D',
  800: '#232B28',
  900: '#151A18',
  950: '#0C100E',
} as const;

/** Vermelho de despesa: quente sem ser alarmante. */
export const red = {
  100: '#FBE0E0',
  300: '#F09A9C',
  400: '#E3676B',
  500: '#CE3B41',
  600: '#B02A30',
  700: '#8B1F24',
} as const;

export const amber = {
  100: '#FDF0D5',
  300: '#F5CC7A',
  400: '#E8AC3C',
  500: '#C98A12',
  // Escurecido para atingir 4.5:1 sobre o próprio fundo de aviso no tema claro.
  600: '#855905',
} as const;

export const blue = {
  100: '#DDE9FB',
  300: '#8FB6EE',
  400: '#5C93E3',
  500: '#2E6FCC',
  600: '#1F55A5',
} as const;

/** Escala de espaçamento em passos de 4. */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 34,
} as const;

export const lineHeight = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 26,
  xl: 30,
  xxl: 36,
  xxxl: 42,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/**
 * Área de toque mínima recomendada pelas diretrizes de acessibilidade do
 * Android. Todo elemento interativo deve respeitar este valor.
 */
export const minTouchTarget = 48;

export const duration = {
  fast: 120,
  base: 200,
  slow: 320,
} as const;

export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
export type FontSize = keyof typeof fontSize;
