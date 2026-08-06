import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';
import { IconChip } from './IconChip';

export type StateViewProps = {
  /** `empty` é ausência de dados; `error` é falha de operação. */
  variant: 'empty' | 'error';
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Substitui o ícone padrão quando a tela tem um símbolo mais específico. */
  icon?: keyof typeof Ionicons.glyphMap;
};

/**
 * Estado vazio e estado de erro compartilham layout porque a diferença que
 * importa para quem usa é a mensagem e a ação oferecida, não a moldura.
 */
export function StateView({
  variant,
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: StateViewProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="summary"
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        gap: theme.spacing.sm,
      }}
    >
      <View style={{ marginBottom: theme.spacing.sm }}>
        <IconChip
          icon={
            icon ??
            (variant === 'error' ? 'alert-circle-outline' : 'documents-outline')
          }
          tone={variant === 'error' ? 'expense' : 'muted'}
          size="lg"
        />
      </View>

      <AppText
        variant="heading"
        tone={variant === 'error' ? 'danger' : 'default'}
      >
        {title}
      </AppText>

      {description ? (
        <AppText variant="body" tone="muted" style={{ textAlign: 'center' }}>
          {description}
        </AppText>
      ) : null}

      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          variant={variant === 'error' ? 'secondary' : 'primary'}
          onPress={onAction}
          style={{ marginTop: theme.spacing.md }}
        />
      ) : null}
    </View>
  );
}
