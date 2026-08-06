import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './AppText';

export type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /** Mostra a seta de voltar. Telas de aba não voltam para lugar nenhum. */
  back?: boolean;
  action?: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
  };
};

/** Cabeçalho de tela: título, apoio opcional e no máximo uma ação. */
export function ScreenHeader({
  title,
  subtitle,
  back = false,
  action,
}: ScreenHeaderProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        }}
      >
        {back && (
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={12}
            style={{
              width: theme.minTouchTarget,
              height: theme.minTouchTarget,
              marginLeft: -theme.spacing.md,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="chevron-back" size={26} color={theme.colors.text} />
          </Pressable>
        )}

        <AppText variant="title" style={{ flex: 1 }}>
          {title}
        </AppText>

        {action && (
          <Pressable
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            hitSlop={12}
            style={{
              width: theme.minTouchTarget,
              height: theme.minTouchTarget,
              borderRadius: theme.radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.surfaceMuted,
            }}
          >
            <Ionicons name={action.icon} size={22} color={theme.colors.text} />
          </Pressable>
        )}
      </View>

      {subtitle && (
        <AppText variant="body" tone="muted">
          {subtitle}
        </AppText>
      )}
    </View>
  );
}
