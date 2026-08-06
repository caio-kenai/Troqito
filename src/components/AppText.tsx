import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme';

export type TextVariant =
  | 'hero'
  | 'display'
  | 'title'
  | 'heading'
  | 'body'
  | 'label'
  | 'overline'
  | 'caption';

export type TextTone =
  | 'default'
  | 'muted'
  | 'subtle'
  | 'primary'
  | 'income'
  | 'expense'
  | 'danger'
  | 'onPrimary'
  | 'onGradient';

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  /**
   * Algarismos de largura fixa. Sem isso, valores empilhados em uma lista não
   * alinham na vírgula, porque o "1" ocupa menos espaço que o "8".
   */
  numeric?: boolean;
};

export function AppText({
  variant = 'body',
  tone = 'default',
  weight,
  numeric = false,
  style,
  ...rest
}: AppTextProps) {
  const theme = useTheme();

  const variantStyle: Record<TextVariant, TextStyle> = {
    hero: {
      fontSize: theme.fontSize.hero,
      lineHeight: theme.lineHeight.hero,
      fontWeight: theme.fontWeight.bold,
      letterSpacing: theme.letterSpacing.tight,
    },
    display: {
      fontSize: theme.fontSize.xxxl,
      lineHeight: theme.lineHeight.xxxl,
      fontWeight: theme.fontWeight.bold,
      letterSpacing: theme.letterSpacing.tight,
    },
    title: {
      fontSize: theme.fontSize.xxl,
      lineHeight: theme.lineHeight.xxl,
      fontWeight: theme.fontWeight.bold,
      letterSpacing: theme.letterSpacing.snug,
    },
    heading: {
      fontSize: theme.fontSize.lg,
      lineHeight: theme.lineHeight.lg,
      fontWeight: theme.fontWeight.semibold,
    },
    body: {
      fontSize: theme.fontSize.md,
      lineHeight: theme.lineHeight.md,
      fontWeight: theme.fontWeight.regular,
    },
    label: {
      fontSize: theme.fontSize.sm,
      lineHeight: theme.lineHeight.sm,
      fontWeight: theme.fontWeight.medium,
    },
    // Rótulo curto acima de um valor. A caixa alta pede folga entre as letras
    // para não virar um borrão.
    overline: {
      fontSize: theme.fontSize.xs,
      lineHeight: theme.lineHeight.xs,
      fontWeight: theme.fontWeight.semibold,
      letterSpacing: theme.letterSpacing.wide,
      textTransform: 'uppercase',
    },
    caption: {
      fontSize: theme.fontSize.xs,
      lineHeight: theme.lineHeight.xs,
      fontWeight: theme.fontWeight.regular,
    },
  };

  const toneColor: Record<TextTone, string> = {
    default: theme.colors.text,
    muted: theme.colors.textMuted,
    subtle: theme.colors.textSubtle,
    primary: theme.colors.primary,
    income: theme.colors.income,
    expense: theme.colors.expense,
    danger: theme.colors.danger,
    onPrimary: theme.colors.textOnPrimary,
    onGradient: theme.colors.textOnGradient,
  };

  return (
    <Text
      style={[
        variantStyle[variant],
        { color: toneColor[tone] },
        weight ? { fontWeight: theme.fontWeight[weight] } : null,
        numeric ? { fontVariant: ['tabular-nums'] } : null,
        style,
      ]}
      {...rest}
    />
  );
}
