import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText, Screen } from '@/components';
import { useTheme } from '@/theme';

type EntryOption = {
  key: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'expense' | 'income' | 'primary';
};

const OPTIONS: EntryOption[] = [
  {
    key: 'despesa',
    label: 'Despesa',
    description: 'Algo que saiu, ou vai sair, da sua conta',
    icon: 'arrow-down-circle-outline',
    tone: 'expense',
  },
  {
    key: 'receita',
    label: 'Receita',
    description: 'Salário, freelance, rendimento ou reembolso',
    icon: 'arrow-up-circle-outline',
    tone: 'income',
  },
  {
    key: 'transferencia',
    label: 'Transferência',
    description: 'Movimentação entre suas próprias contas',
    icon: 'swap-horizontal-outline',
    tone: 'primary',
  },
  {
    key: 'compartilhada',
    label: 'Despesa compartilhada',
    description: 'Dividida entre os participantes de uma casa',
    icon: 'people-outline',
    tone: 'primary',
  },
];

export default function NewEntryScreen() {
  const theme = useTheme();
  const router = useRouter();

  const toneColor = {
    expense: theme.colors.expense,
    income: theme.colors.income,
    primary: theme.colors.primary,
  } as const;

  const surfaceColor = {
    expense: theme.colors.expenseSurface,
    income: theme.colors.incomeSurface,
    primary: theme.colors.primarySurface,
  } as const;

  return (
    <Screen scroll edges={['top', 'left', 'right', 'bottom']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <AppText variant="title">Novo lançamento</AppText>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          hitSlop={12}
          style={{
            minWidth: theme.minTouchTarget,
            minHeight: theme.minTouchTarget,
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="close" size={26} color={theme.colors.textMuted} />
        </Pressable>
      </View>

      <View style={{ gap: theme.spacing.md }}>
        {OPTIONS.map((option) => (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityHint={option.description}
            // As telas de formulário entram nas fases de receitas e despesas.
            disabled
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.lg,
              padding: theme.spacing.lg,
              minHeight: theme.minTouchTarget,
              borderRadius: theme.radius.lg,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              opacity: 0.6,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: theme.radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: surfaceColor[option.tone],
              }}
            >
              <Ionicons
                name={option.icon}
                size={24}
                color={toneColor[option.tone]}
              />
            </View>
            <View style={{ flex: 1, gap: theme.spacing.xxs }}>
              <AppText variant="heading">{option.label}</AppText>
              <AppText variant="label" tone="muted">
                {option.description}
              </AppText>
            </View>
          </Pressable>
        ))}
      </View>

      <AppText variant="caption" tone="subtle">
        Os formulários de lançamento entram nas próximas etapas.
      </AppText>
    </Screen>
  );
}
