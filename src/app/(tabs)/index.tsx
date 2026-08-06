import { useRouter } from 'expo-router';
import { View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  Screen,
  SkeletonList,
  TAB_SCREEN_EDGES,
} from '@/components';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useSession } from '@/features/profile/SessionProvider';
import { TransactionRow } from '@/features/transactions/components/TransactionRow';
import {
  usePeriodSummary,
  useTransactions,
} from '@/features/transactions/hooks/useTransactions';
import { formatBR } from '@/lib/date';
import { formatCents } from '@/lib/money';
import { useTheme } from '@/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const session = useSession();

  const profile = session.status === 'ready' ? session.profile : null;
  const ownerId = profile?.id ?? '';

  const { total, isLoading: loadingAccounts } = useAccounts(ownerId);
  const { transactions, isLoading: loadingTransactions } =
    useTransactions(ownerId);
  const { byId: categoriesById } = useCategories(ownerId);

  const summary = usePeriodSummary(transactions, profile?.cycleStartDay ?? 1);

  if (loadingAccounts || loadingTransactions) {
    return (
      <Screen edges={TAB_SCREEN_EDGES}>
        <AppText variant="title">Troqito</AppText>
        <SkeletonList rows={4} />
      </Screen>
    );
  }

  const recent = transactions.slice(0, 5);

  return (
    <Screen scroll edges={TAB_SCREEN_EDGES}>
      <View style={{ gap: theme.spacing.xxs }}>
        <AppText variant="label" tone="muted">
          Saldo total
        </AppText>
        <AppText variant="display" tone={total < 0 ? 'expense' : 'default'}>
          {formatCents(total)}
        </AppText>
        <AppText variant="caption" tone="subtle">
          Período de {formatBR(summary.range.start)} a{' '}
          {formatBR(summary.range.end)}
        </AppText>
      </View>

      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <Card style={{ flex: 1 }}>
          <AppText variant="label" tone="muted">
            Receitas
          </AppText>
          <AppText variant="heading" tone="income">
            {formatCents(summary.income, { showPositiveSign: true })}
          </AppText>
        </Card>
        <Card style={{ flex: 1 }}>
          <AppText variant="label" tone="muted">
            Despesas
          </AppText>
          <AppText variant="heading" tone="expense">
            {formatCents(summary.expense)}
          </AppText>
        </Card>
      </View>

      <Card>
        <AppText variant="label" tone="muted">
          Resultado do período
        </AppText>
        <AppText
          variant="title"
          tone={summary.result < 0 ? 'expense' : 'income'}
        >
          {formatCents(summary.result, { showPositiveSign: true })}
        </AppText>
        <AppText variant="caption" tone="muted">
          {summary.result < 0
            ? 'Você gastou mais do que recebeu neste período.'
            : 'Você fechou o período no positivo.'}
        </AppText>
      </Card>

      {recent.length === 0 ? (
        <Card>
          <AppText variant="heading">Comece por aqui</AppText>
          <AppText variant="body" tone="muted">
            Cadastre uma conta e registre seu primeiro lançamento pelo botão
            central. O Troqito funciona sem conexão: tudo fica no aparelho.
          </AppText>
          <Button
            label="Registrar lançamento"
            onPress={() => router.push('/novo')}
          />
        </Card>
      ) : (
        <Card>
          <AppText variant="heading">Atividade recente</AppText>
          {recent.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              categoryName={
                transaction.categoryId
                  ? categoriesById.get(transaction.categoryId)?.name
                  : undefined
              }
            />
          ))}
        </Card>
      )}
    </Screen>
  );
}
