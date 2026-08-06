import {
  amber,
  blue,
  duration,
  elevation,
  fontSize,
  fontWeight,
  green,
  letterSpacing,
  lime,
  lineHeight,
  minTouchTarget,
  neutral,
  radius,
  red,
  spacing,
} from './tokens';

export type ColorRole = {
  /** Fundo da tela. */
  background: string;
  /** Superfície elevada sobre o fundo: cartões, listas, modais. */
  surface: string;
  /** Superfície de ênfase leve, para blocos agrupados. */
  surfaceMuted: string;
  border: string;
  borderStrong: string;

  text: string;
  textMuted: string;
  textSubtle: string;
  /** Texto sobre superfícies preenchidas com a cor primária. */
  textOnPrimary: string;
  /**
   * Texto sobre cartões com gradiente.
   *
   * Não dá para reaproveitar `textOnPrimary`: no tema escuro a cor primária é
   * um verde claro que pede texto escuro, enquanto o gradiente continua escuro
   * nos dois temas e pede texto claro.
   */
  textOnGradient: string;

  primary: string;
  primaryPressed: string;
  primarySurface: string;

  accent: string;

  /** Receita e despesa têm papel próprio: são o eixo do produto. */
  income: string;
  incomeSurface: string;
  expense: string;
  expenseSurface: string;

  success: string;
  successSurface: string;
  warning: string;
  warningSurface: string;
  danger: string;
  dangerSurface: string;
  info: string;
  infoSurface: string;

  /** Fundo de placeholder durante o carregamento. */
  skeleton: string;
  overlay: string;

  /** Superfície de cartão que se destaca do fundo por elevação. */
  surfaceElevated: string;
  /** Cor da sombra, que muda com o tema para a elevação continuar visível. */
  shadow: string;
};

/** Dois pontos de parada, do mais escuro ao mais claro. */
export type Gradient = readonly [string, string];

export type GradientRole = {
  /** Cartão de saldo em destaque. */
  brand: Gradient;
  income: Gradient;
  expense: Gradient;
};

export type Theme = {
  name: 'light' | 'dark';
  colors: ColorRole;
  gradients: GradientRole;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
  lineHeight: typeof lineHeight;
  fontWeight: typeof fontWeight;
  letterSpacing: typeof letterSpacing;
  elevation: typeof elevation;
  duration: typeof duration;
  minTouchTarget: number;
};

const shared = {
  spacing,
  radius,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
  elevation,
  duration,
  minTouchTarget,
} as const;

export const lightTheme: Theme = {
  name: 'light',
  ...shared,
  colors: {
    background: neutral[50],
    surface: neutral[0],
    surfaceMuted: neutral[100],
    border: neutral[200],
    borderStrong: neutral[300],

    text: neutral[900],
    textMuted: neutral[600],
    textSubtle: neutral[500],
    textOnPrimary: neutral[0],
    textOnGradient: neutral[0],

    primary: green[600],
    primaryPressed: green[700],
    primarySurface: green[50],

    accent: lime[600],

    income: green[600],
    incomeSurface: green[50],
    expense: red[600],
    expenseSurface: red[100],

    success: green[600],
    successSurface: green[50],
    warning: amber[600],
    warningSurface: amber[100],
    danger: red[600],
    dangerSurface: red[100],
    info: blue[600],
    infoSurface: blue[100],

    skeleton: neutral[200],
    overlay: 'rgba(12, 16, 14, 0.55)',

    surfaceElevated: neutral[0],
    shadow: '#0A2B1B',
  },
  // Os pontos de parada param onde o texto branco ainda alcança 4.5:1. Verdes
  // e vermelhos mais claros ficam bonitos e ilegíveis.
  gradients: {
    brand: [green[800], green[600]],
    income: [green[800], green[600]],
    expense: [red[700], red[500]],
  },
};

export const darkTheme: Theme = {
  name: 'dark',
  ...shared,
  colors: {
    background: neutral[950],
    surface: neutral[900],
    surfaceMuted: neutral[800],
    border: neutral[800],
    borderStrong: neutral[700],

    text: neutral[50],
    textMuted: neutral[300],
    textSubtle: neutral[400],
    // O verde do modo escuro é claro o bastante para exigir texto escuro.
    textOnPrimary: neutral[950],
    textOnGradient: neutral[0],

    primary: green[300],
    primaryPressed: green[200],
    primarySurface: green[900],

    accent: lime[400],

    income: green[300],
    incomeSurface: green[900],
    expense: red[300],
    expenseSurface: '#3A1618',

    success: green[300],
    successSurface: green[900],
    warning: amber[300],
    warningSurface: '#3A2C10',
    danger: red[300],
    dangerSurface: '#3A1618',
    info: blue[300],
    infoSurface: '#132844',

    skeleton: neutral[800],
    overlay: 'rgba(0, 0, 0, 0.65)',

    // No escuro a elevação não vem de sombra, que some no fundo preto, e sim de
    // uma superfície um passo mais clara que o cartão comum.
    surfaceElevated: neutral[800],
    shadow: '#000000',
  },
  gradients: {
    // Mais escuros que no tema claro: sobre fundo preto, um gradiente vibrante
    // brilha demais e vira a única coisa que se enxerga na tela.
    brand: [green[900], green[700]],
    income: [green[900], green[700]],
    expense: [red[700], red[600]],
  },
};

export const themes = { light: lightTheme, dark: darkTheme } as const;
