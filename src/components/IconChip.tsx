import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useTheme } from '@/theme';

export type IconChipTone =
  'primary' | 'income' | 'expense' | 'warning' | 'info' | 'muted';

export type IconChipProps = {
  icon: keyof typeof Ionicons.glyphMap;
  tone?: IconChipTone | undefined;
  size?: 'sm' | 'md' | 'lg' | undefined;
};

const SIZES = {
  sm: { box: 32, icon: 16 },
  md: { box: 44, icon: 22 },
  lg: { box: 56, icon: 28 },
} as const;

/**
 * Ícone dentro de um círculo tingido.
 *
 * É o que dá ritmo às listas: sem ele, linha após linha de texto puro fica
 * indistinguível e a pessoa precisa ler tudo para achar o que procura.
 */
export function IconChip({
  icon,
  tone = 'primary',
  size = 'md',
}: IconChipProps) {
  const theme = useTheme();
  const { box, icon: iconSize } = SIZES[size];

  const palette: Record<IconChipTone, { fg: string; bg: string }> = {
    primary: { fg: theme.colors.primary, bg: theme.colors.primarySurface },
    income: { fg: theme.colors.income, bg: theme.colors.incomeSurface },
    expense: { fg: theme.colors.expense, bg: theme.colors.expenseSurface },
    warning: { fg: theme.colors.warning, bg: theme.colors.warningSurface },
    info: { fg: theme.colors.info, bg: theme.colors.infoSurface },
    muted: { fg: theme.colors.textMuted, bg: theme.colors.surfaceMuted },
  };

  const { fg, bg } = palette[tone];

  return (
    <View
      style={{
        width: box,
        height: box,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bg,
      }}
    >
      <Ionicons name={icon} size={iconSize} color={fg} />
    </View>
  );
}
