import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components';
import { formatBR } from '@/lib/date';
import { cents, formatCents } from '@/lib/money';
import { useTheme } from '@/theme';

import { type Transaction } from '../repository/transactionsRepository';
import { STATUS_LABELS } from '../schemas/transactionSchema';

export function TransactionRow({
  transaction,
  categoryName,
  accountName,
  onPress,
}: {
  transaction: Transaction;
  categoryName?: string | undefined;
  accountName?: string | undefined;
  onPress?: () => void;
}) {
  const theme = useTheme();

  const isTransfer = transaction.kind === 'transfer';
  const isIncome = transaction.kind === 'income';
  const incoming = isTransfer && transaction.paymentMethod === 'in';

  const tone = isTransfer ? 'muted' : isIncome ? 'income' : 'expense';
  const icon = isTransfer
    ? incoming
      ? 'arrow-down-outline'
      : 'arrow-up-outline'
    : isIncome
      ? 'arrow-up-circle-outline'
      : 'arrow-down-circle-outline';

  const surface = isTransfer
    ? theme.colors.surfaceMuted
    : isIncome
      ? theme.colors.incomeSurface
      : theme.colors.expenseSurface;

  const iconColor = isTransfer
    ? theme.colors.textMuted
    : isIncome
      ? theme.colors.income
      : theme.colors.expense;

  // Transferência não leva sinal: não é ganho nem perda de patrimônio.
  const amountText = isTransfer
    ? formatCents(cents(transaction.amount))
    : formatCents(cents(transaction.amount), { showPositiveSign: isIncome });

  const details = [
    formatBR(transaction.date),
    categoryName,
    accountName,
    transaction.status === 'settled'
      ? undefined
      : STATUS_LABELS[transaction.status as keyof typeof STATUS_LABELS],
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${transaction.title}, ${amountText}, ${details}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: theme.minTouchTarget,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: theme.radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: surface,
        }}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>

      <View style={{ flex: 1, gap: theme.spacing.xxs }}>
        <AppText variant="body" weight="medium">
          {transaction.title}
        </AppText>
        <AppText variant="caption" tone="muted">
          {details}
        </AppText>
      </View>

      <AppText variant="body" weight="semibold" numeric tone={tone}>
        {amountText}
      </AppText>
    </Pressable>
  );
}
