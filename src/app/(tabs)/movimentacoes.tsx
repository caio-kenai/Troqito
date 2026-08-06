import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, SectionList, View } from 'react-native';

import {
  AppText,
  Screen,
  ScreenHeader,
  SkeletonList,
  StateView,
  TAB_SCREEN_EDGES,
} from '@/components';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useOwnerId } from '@/features/profile/SessionProvider';
import { TransactionRow } from '@/features/transactions/components/TransactionRow';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import {
  deleteTransaction,
  type Transaction,
} from '@/features/transactions/repository/transactionsRepository';
import { formatBR } from '@/lib/date';
import { useTheme } from '@/theme';

export default function TransactionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const ownerId = useOwnerId();

  const { transactions, isLoading } = useTransactions(ownerId);
  const { byId: categoriesById } = useCategories(ownerId);
  const { accounts } = useAccounts(ownerId);

  const accountsById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts],
  );

  // Agrupar por dia é o recorte que as pessoas usam para conferir gastos:
  // "o que eu gastei ontem" é uma pergunta muito mais comum que "no dia 12".
  const sections = useMemo(() => {
    const byDate = new Map<string, Transaction[]>();

    for (const transaction of transactions) {
      const list = byDate.get(transaction.date) ?? [];
      list.push(transaction);
      byDate.set(transaction.date, list);
    }

    return [...byDate.entries()].map(([date, data]) => ({
      title: formatBR(date),
      data,
    }));
  }, [transactions]);

  const confirmDelete = (transaction: Transaction) => {
    const isTransfer = transaction.transferGroupId !== null;

    Alert.alert(
      'Excluir o lançamento?',
      isTransfer
        ? 'As duas pernas da transferência serão excluídas juntas.'
        : 'Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteTransaction(transaction),
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <Screen edges={TAB_SCREEN_EDGES}>
        <ScreenHeader title="Movimentações" />
        <SkeletonList rows={5} />
      </Screen>
    );
  }

  if (transactions.length === 0) {
    return (
      <Screen edges={TAB_SCREEN_EDGES}>
        <ScreenHeader title="Movimentações" />
        <StateView
          variant="empty"
          icon="receipt-outline"
          title="Nenhuma movimentação ainda"
          description="Registre sua primeira receita ou despesa pelo botão central. Elas aparecem aqui agrupadas por data."
          actionLabel="Registrar lançamento"
          onAction={() => router.push('/novo')}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false} edges={TAB_SCREEN_EDGES}>
      <View style={{ paddingHorizontal: theme.spacing.lg }}>
        <ScreenHeader
          title="Movimentações"
          subtitle={`${transactions.length} ${transactions.length === 1 ? 'lançamento' : 'lançamentos'} registrados`}
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.xxxl,
        }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View
            style={{
              paddingTop: theme.spacing.xl,
              paddingBottom: theme.spacing.sm,
              backgroundColor: theme.colors.background,
            }}
          >
            <AppText variant="overline" tone="subtle">
              {section.title}
            </AppText>
          </View>
        )}
        renderItem={({ item }) => (
          <TransactionRow
            transaction={item}
            categoryName={
              item.categoryId
                ? categoriesById.get(item.categoryId)?.name
                : undefined
            }
            accountName={
              item.accountId
                ? accountsById.get(item.accountId)?.name
                : undefined
            }
            onPress={() => confirmDelete(item)}
          />
        )}
      />
    </Screen>
  );
}
