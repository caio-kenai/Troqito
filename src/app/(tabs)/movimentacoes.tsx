import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, SectionList, View } from 'react-native';

import {
  AppText,
  OptionGroup,
  Screen,
  ScreenHeader,
  SkeletonList,
  StateView,
  TAB_SCREEN_EDGES,
  TextField,
} from '@/components';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useOwnerId } from '@/features/profile/SessionProvider';
import { TransactionRow } from '@/features/transactions/components/TransactionRow';
import {
  filterTransactions,
  SORT_LABELS,
  sortTransactions,
  type SortOrder,
} from '@/features/transactions/domain/filters';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import {
  deleteTransaction,
  type Transaction,
} from '@/features/transactions/repository/transactionsRepository';
import { formatBR } from '@/lib/date';
import { cents } from '@/lib/money';
import { useTheme } from '@/theme';

const KIND_OPTIONS = [
  { value: 'all', label: 'Tudo' },
  { value: 'expense', label: 'Despesas' },
  { value: 'income', label: 'Receitas' },
  { value: 'transfer', label: 'Transferências' },
];

const SORT_OPTIONS = (Object.keys(SORT_LABELS) as SortOrder[]).map((key) => ({
  value: key,
  label: SORT_LABELS[key],
}));

export default function TransactionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const ownerId = useOwnerId();

  const { transactions, isLoading } = useTransactions(ownerId);
  const { byId: categoriesById } = useCategories(ownerId);
  const { accounts } = useAccounts(ownerId);

  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');
  const [order, setOrder] = useState<SortOrder>('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  const accountsById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts],
  );

  const visible = useMemo(() => {
    const filtered = filterTransactions(
      transactions.map((item) => ({ ...item, amount: cents(item.amount) })),
      {
        query,
        ...(kind === 'all' ? {} : { kinds: [kind] }),
      },
    );

    return sortTransactions(filtered, order);
  }, [transactions, query, kind, order]);

  // Agrupar por dia é o recorte que as pessoas usam para conferir gastos:
  // "o que eu gastei ontem" é uma pergunta muito mais comum que "no dia 12".
  const sections = useMemo(() => {
    const byDate = new Map<string, Transaction[]>();

    for (const transaction of visible) {
      const list = byDate.get(transaction.date) ?? [];
      list.push(transaction);
      byDate.set(transaction.date, list);
    }

    return [...byDate.entries()].map(([date, data]) => ({
      title: formatBR(date),
      data,
    }));
  }, [visible]);

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
      <View
        style={{
          paddingHorizontal: theme.spacing.lg,
          gap: theme.spacing.md,
        }}
      >
        <ScreenHeader
          title="Movimentações"
          subtitle={
            visible.length === transactions.length
              ? `${transactions.length} ${transactions.length === 1 ? 'lançamento' : 'lançamentos'}`
              : `${visible.length} de ${transactions.length} lançamentos`
          }
          action={{
            icon: showFilters ? 'close' : 'options-outline',
            label: showFilters ? 'Fechar filtros' : 'Filtrar',
            onPress: () => setShowFilters((open) => !open),
          }}
        />

        <TextField
          label="Buscar"
          placeholder="Descrição, observação ou estabelecimento"
          value={query}
          onChangeText={setQuery}
        />

        {showFilters && (
          <View style={{ gap: theme.spacing.md }}>
            <OptionGroup
              label="Tipo"
              options={KIND_OPTIONS}
              value={kind}
              onChange={setKind}
            />
            <OptionGroup
              label="Ordenar por"
              options={SORT_OPTIONS}
              value={order}
              onChange={(value) => setOrder(value as SortOrder)}
            />
          </View>
        )}
      </View>

      {visible.length === 0 && (
        <View style={{ paddingHorizontal: theme.spacing.lg }}>
          <StateView
            variant="empty"
            icon="search-outline"
            title="Nada encontrado"
            description="Nenhum lançamento corresponde à busca. Tente outras palavras ou limpe os filtros."
            actionLabel="Limpar busca"
            onAction={() => {
              setQuery('');
              setKind('all');
            }}
          />
        </View>
      )}

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
