import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components';
import { formatCents } from '@/lib/money';
import { useTheme } from '@/theme';

import { ACCOUNT_TYPE_LABELS } from '../schemas/accountSchema';
import { type AccountWithBalance } from '../hooks/useAccounts';

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  checking: 'card-outline',
  savings: 'wallet-outline',
  cash: 'cash-outline',
  digital_wallet: 'phone-portrait-outline',
  meal_voucher: 'restaurant-outline',
  food_voucher: 'fast-food-outline',
  investment: 'trending-up-outline',
  other: 'ellipse-outline',
};

export function AccountRow({
  account,
  onPress,
}: {
  account: AccountWithBalance;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const archived = account.archivedAt !== null;
  const typeLabel =
    ACCOUNT_TYPE_LABELS[account.type as keyof typeof ACCOUNT_TYPE_LABELS] ??
    'Conta';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${account.name}, ${typeLabel}, saldo ${formatCents(account.balance)}`}
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
        opacity: archived ? 0.6 : 1,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: theme.radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: account.color ?? theme.colors.primarySurface,
        }}
      >
        <Ionicons
          name={TYPE_ICONS[account.type] ?? 'ellipse-outline'}
          size={22}
          color={theme.colors.surface}
        />
      </View>

      <View style={{ flex: 1, gap: theme.spacing.xxs }}>
        <AppText variant="heading">{account.name}</AppText>
        <AppText variant="caption" tone="muted">
          {typeLabel}
          {account.institution ? ` · ${account.institution}` : ''}
          {archived ? ' · Arquivada' : ''}
          {!account.includeInTotal ? ' · Fora do total' : ''}
        </AppText>
      </View>

      <AppText
        variant="heading"
        tone={account.balance < 0 ? 'expense' : 'default'}
      >
        {formatCents(account.balance)}
      </AppText>
    </Pressable>
  );
}
