import { LinearGradient } from 'expo-linear-gradient';
import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/theme';

export type CardVariant = 'plain' | 'elevated' | 'gradient';

export type CardProps = ViewProps & {
  padded?: boolean;
  tone?: 'surface' | 'muted';
  variant?: CardVariant;
  /** Qual gradiente usar quando a variante é `gradient`. */
  gradient?: 'brand' | 'income' | 'expense';
};

/**
 * Bloco de conteúdo.
 *
 * `plain` delimita com borda, para agrupar sem chamar atenção. `elevated`
 * levanta o bloco do fundo e serve ao que é conteúdo principal da tela.
 * `gradient` é para um destaque por tela, no máximo — usado em tudo, nada fica
 * em destaque.
 */
export function Card({
  padded = true,
  tone = 'surface',
  variant = 'plain',
  gradient = 'brand',
  style,
  children,
  ...rest
}: CardProps) {
  const theme = useTheme();

  const base = {
    borderRadius: theme.radius.lg,
    padding: padded ? theme.spacing.lg : 0,
    gap: theme.spacing.sm,
  };

  if (variant === 'gradient') {
    const [from, to] = theme.gradients[gradient];

    return (
      <View
        style={[
          {
            borderRadius: theme.radius.lg,
            shadowColor: theme.colors.shadow,
            ...theme.elevation.md,
          },
          style,
        ]}
        {...rest}
      >
        <LinearGradient
          colors={[from, to]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={base}
        >
          {children}
        </LinearGradient>
      </View>
    );
  }

  const elevated = variant === 'elevated';

  return (
    <View
      style={[
        base,
        {
          backgroundColor: elevated
            ? theme.colors.surfaceElevated
            : tone === 'muted'
              ? theme.colors.surfaceMuted
              : theme.colors.surface,
          borderWidth: 1,
          // No tema escuro a sombra some no fundo, então o cartão elevado
          // continua precisando da borda para se separar do que está atrás.
          borderColor:
            elevated && theme.name === 'light'
              ? 'transparent'
              : theme.colors.border,
          ...(elevated
            ? { shadowColor: theme.colors.shadow, ...theme.elevation.sm }
            : null),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
