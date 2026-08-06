import { View } from 'react-native';

import { useTheme } from '@/theme';

export type ProgressTone = 'primary' | 'income' | 'expense' | 'warning';

export type ProgressBarProps = {
  /** Fração de 0 a 1. Valores acima de 1 aparecem cheios e são marcados. */
  value: number;
  tone?: ProgressTone;
  label?: string;
};

/**
 * Barra de progresso.
 *
 * Estourar o limite não é escondido: a barra fica cheia e muda de cor, porque a
 * informação que importa é justamente ter passado do previsto.
 */
export function ProgressBar({
  value,
  tone = 'primary',
  label,
}: ProgressBarProps) {
  const theme = useTheme();

  const exceeded = value > 1;
  const clamped = Math.max(0, Math.min(1, value));

  const color = exceeded
    ? theme.colors.expense
    : tone === 'income'
      ? theme.colors.income
      : tone === 'expense'
        ? theme.colors.expense
        : tone === 'warning'
          ? theme.colors.warning
          : theme.colors.primary;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(clamped * 100), min: 0, max: 100 }}
      {...(label ? { accessibilityLabel: label } : null)}
      style={{
        height: 8,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.surfaceMuted,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          borderRadius: theme.radius.full,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
