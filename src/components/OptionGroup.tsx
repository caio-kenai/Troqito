import { Pressable, View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './AppText';

export type Option<T extends string> = { value: T; label: string };

export type OptionGroupProps<T extends string> = {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  error?: string | undefined;
};

/**
 * Escolha única apresentada como lista de opções visíveis, e não como um menu
 * suspenso. Em telas de lançamento a pessoa escolhe entre poucas opções e
 * repete a ação muitas vezes ao dia; ver tudo de uma vez economiza um toque.
 */
export function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
}: OptionGroupProps<T>) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <AppText variant="label" tone="muted">
        {label}
      </AppText>

      <View
        accessibilityRole="radiogroup"
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
        }}
      >
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={option.label}
              onPress={() => onChange(option.value)}
              style={{
                minHeight: theme.minTouchTarget,
                justifyContent: 'center',
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.radius.full,
                borderWidth: selected ? 2 : 1,
                borderColor: selected
                  ? theme.colors.primary
                  : theme.colors.border,
                backgroundColor: selected
                  ? theme.colors.primarySurface
                  : theme.colors.surface,
              }}
            >
              <AppText
                variant="label"
                tone={selected ? 'primary' : 'default'}
                weight={selected ? 'semibold' : 'regular'}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <AppText variant="caption" tone="danger" accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
