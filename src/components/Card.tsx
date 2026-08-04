import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/theme';

export type CardProps = ViewProps & {
  padded?: boolean;
  tone?: 'surface' | 'muted';
};

export function Card({
  padded = true,
  tone = 'surface',
  style,
  ...rest
}: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor:
            tone === 'muted' ? theme.colors.surfaceMuted : theme.colors.surface,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: padded ? theme.spacing.lg : 0,
          gap: theme.spacing.sm,
        },
        style,
      ]}
      {...rest}
    />
  );
}
