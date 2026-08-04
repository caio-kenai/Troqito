import {
  amber,
  blue,
  duration,
  fontSize,
  fontWeight,
  green,
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
};

export type Theme = {
  name: 'light' | 'dark';
  colors: ColorRole;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
  lineHeight: typeof lineHeight;
  fontWeight: typeof fontWeight;
  duration: typeof duration;
  minTouchTarget: number;
};

const shared = {
  spacing,
  radius,
  fontSize,
  lineHeight,
  fontWeight,
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
  },
};

export const themes = { light: lightTheme, dark: darkTheme } as const;
