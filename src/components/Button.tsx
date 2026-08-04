import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  // Enquanto carrega, o botão continua desabilitado para evitar envio duplicado.
  const isDisabled = disabled === true || loading;

  const background: Record<ButtonVariant, string> = {
    primary: theme.colors.primary,
    secondary: theme.colors.surfaceMuted,
    ghost: 'transparent',
    danger: theme.colors.danger,
  };

  const pressedBackground: Record<ButtonVariant, string> = {
    primary: theme.colors.primaryPressed,
    secondary: theme.colors.border,
    ghost: theme.colors.surfaceMuted,
    danger: theme.colors.dangerSurface,
  };

  const labelTone = {
    primary: 'onPrimary',
    secondary: 'default',
    ghost: 'primary',
    danger: 'onPrimary',
  } as const;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={label}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: theme.minTouchTarget,
          paddingHorizontal:
            size === 'lg' ? theme.spacing.xl : theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          borderRadius: theme.radius.md,
          backgroundColor: pressed
            ? pressedBackground[variant]
            : background[variant],
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: theme.colors.border,
          opacity: isDisabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
      {...rest}
    >
      <View style={styles.content}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={
              variant === 'primary' || variant === 'danger'
                ? theme.colors.textOnPrimary
                : theme.colors.primary
            }
          />
        )}
        <AppText
          variant={size === 'lg' ? 'heading' : 'label'}
          tone={labelTone[variant]}
          weight="semibold"
        >
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
