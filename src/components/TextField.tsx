import { useId } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './AppText';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  /**
   * Mensagem de erro. O `| undefined` é explícito porque o projeto usa
   * `exactOptionalPropertyTypes`, e quem chama repassa o erro do formulário,
   * que é `string | undefined`.
   */
  error?: string | undefined;
  hint?: string | undefined;
  required?: boolean | undefined;
};

export function TextField({
  label,
  error,
  hint,
  required = false,
  ...rest
}: TextFieldProps) {
  const theme = useTheme();
  const id = useId();
  const hasError = Boolean(error);

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <AppText variant="label" tone="muted" nativeID={`${id}-label`}>
        {label}
        {required ? ' *' : ''}
      </AppText>

      <TextInput
        accessibilityLabel={label}
        accessibilityLabelledBy={`${id}-label`}
        accessibilityState={{ disabled: rest.editable === false }}
        // O React Native não expõe um equivalente a aria-invalid, então o erro
        // chega ao leitor de tela pela dica do campo e pelo texto com papel de
        // alerta logo abaixo.
        accessibilityHint={error ?? hint}
        placeholderTextColor={theme.colors.textSubtle}
        style={{
          minHeight: theme.minTouchTarget,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: hasError ? theme.colors.danger : theme.colors.border,
          backgroundColor: theme.colors.surface,
          color: theme.colors.text,
          fontSize: theme.fontSize.md,
        }}
        {...rest}
      />

      {hasError ? (
        <AppText variant="caption" tone="danger" accessibilityRole="alert">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" tone="subtle">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}
