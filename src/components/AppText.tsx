import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme';

export type TextVariant =
  'display' | 'title' | 'heading' | 'body' | 'label' | 'caption';

export type TextTone =
  | 'default'
  | 'muted'
  | 'subtle'
  | 'primary'
  | 'income'
  | 'expense'
  | 'danger'
  | 'onPrimary';

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
};

export function AppText({
  variant = 'body',
  tone = 'default',
  weight,
  style,
  ...rest
}: AppTextProps) {
  const theme = useTheme();

  const variantStyle: Record<TextVariant, TextStyle> = {
    display: {
      fontSize: theme.fontSize.xxxl,
      lineHeight: theme.lineHeight.xxxl,
      fontWeight: theme.fontWeight.bold,
    },
    title: {
      fontSize: theme.fontSize.xxl,
      lineHeight: theme.lineHeight.xxl,
      fontWeight: theme.fontWeight.bold,
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
  };

  return (
    <Text
      style={[
        variantStyle[variant],
        { color: toneColor[tone] },
        weight ? { fontWeight: theme.fontWeight[weight] } : null,
        style,
      ]}
      {...rest}
    />
  );
}
