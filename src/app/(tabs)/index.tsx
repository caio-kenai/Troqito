import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  IconChip,
  Screen,
  SkeletonList,
  TAB_SCREEN_EDGES,
} from '@/components';
import { DonutChart, TrendChart } from '@/components/charts';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useSession } from '@/features/profile/SessionProvider';
import { TransactionRow } from '@/features/transactions/components/TransactionRow';
import { useDashboard } from '@/features/transactions/hooks/useDashboard';
import {
  usePeriodSummary,
  useTransactions,
} from '@/features/transactions/hooks/useTransactions';
import { formatBR } from '@/lib/date';
import { formatCents } from '@/lib/money';
import { useTheme } from '@/theme';

/** Saudação pelo horário: o aplicativo é aberto várias vezes ao dia. */
function greeting(hour: number): string {
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Comparação com o período anterior em uma linha.
 *
 * Sem período anterior para comparar, a linha não aparece: inventar "0% de
 * variação" faria parecer que houve estabilidade onde não houve histórico.
 */
function ComparisonLine({
  label,
  variation,
  ratio,
  goodWhenFalling = false,
}: {
  label: string;
  variation: number;
  ratio: number | null;
  goodWhenFalling?: boolean;
}) {
  if (ratio === null || variation === 0) return null;

  const rose = variation > 0;
  const good = goodWhenFalling ? !rose : rose;
  const percent = Math.abs(Math.round(ratio * 100));

  return (
    <AppText variant="caption" tone={good ? 'income' : 'expense'}>
      {rose ? '↑' : '↓'} {percent}% em {label}, ante o período anterior
    </AppText>
  );
}

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

  const cycleStartDay = profile?.cycleStartDay ?? 1;
  const summary = usePeriodSummary(transactions, cycleStartDay);
  const dashboard = useDashboard(transactions, cycleStartDay, categoriesById);

  if (loadingAccounts || loadingTransactions) {
    return (
      <Screen edges={TAB_SCREEN_EDGES}>
        <SkeletonList rows={5} />
      </Screen>
    );
  }

  const recent = transactions.slice(0, 5);
  const negative = summary.result < 0;

  return (
    <Screen scroll edges={TAB_SCREEN_EDGES}>
      <View style={{ gap: theme.spacing.xxs }}>
        <AppText variant="label" tone="muted">
          {greeting(new Date().getHours())}
        </AppText>
        <AppText variant="title">{profile?.name ?? 'Você'}</AppText>
      </View>

      <Card variant="gradient" gradient="brand">
        <AppText variant="overline" tone="onGradient" style={{ opacity: 0.85 }}>
          Saldo total
        </AppText>
        <AppText variant="hero" tone="onGradient" numeric>
          {formatCents(total)}
        </AppText>
        <AppText variant="caption" tone="onGradient" style={{ opacity: 0.85 }}>
          {formatBR(summary.range.start)} a {formatBR(summary.range.end)}
        </AppText>
      </Card>

      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <Card variant="elevated" style={{ flex: 1 }}>
          <IconChip icon="arrow-up-outline" tone="income" size="sm" />
          <AppText variant="label" tone="muted">
            Receitas
          </AppText>
          <AppText variant="heading" tone="income" numeric>
            {formatCents(summary.income, { showPositiveSign: true })}
          </AppText>
        </Card>

        <Card variant="elevated" style={{ flex: 1 }}>
          <IconChip icon="arrow-down-outline" tone="expense" size="sm" />
          <AppText variant="label" tone="muted">
            Despesas
          </AppText>
          <AppText variant="heading" tone="expense" numeric>
            {formatCents(summary.expense)}
          </AppText>
        </Card>
      </View>

      <Card variant="elevated">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.md,
          }}
        >
          <IconChip
            icon={negative ? 'trending-down-outline' : 'trending-up-outline'}
            tone={negative ? 'expense' : 'income'}
          />
          <View style={{ flex: 1, gap: theme.spacing.xxs }}>
            <AppText variant="label" tone="muted">
              Resultado do período
            </AppText>
            <AppText
              variant="display"
              tone={negative ? 'expense' : 'income'}
              numeric
            >
              {formatCents(summary.result, { showPositiveSign: true })}
            </AppText>
          </View>
        </View>
        <AppText variant="caption" tone="muted">
          {negative
            ? 'Você gastou mais do que recebeu neste período.'
            : 'Você fechou o período no positivo.'}
        </AppText>

        <TrendChart
          values={dashboard.trend}
          label="Evolução do resultado ao longo do período"
        />

        <ComparisonLine
          label="despesas"
          variation={dashboard.comparison.expense.variation}
          ratio={dashboard.comparison.expense.ratio}
          /* Gastar menos que no período anterior é a notícia boa aqui. */
          goodWhenFalling
        />
      </Card>

      {dashboard.slices.length > 0 && (
        <Card variant="elevated">
          <AppText variant="heading">Para onde foi o dinheiro</AppText>
          <DonutChart
            slices={dashboard.slices}
            centerValue={formatCents(summary.expense)}
            centerLabel="gasto"
          />
        </Card>
      )}

      {recent.length === 0 ? (
        <Card variant="elevated">
          <IconChip icon="sparkles-outline" tone="primary" />
          <AppText variant="heading">Comece por aqui</AppText>
          <AppText variant="body" tone="muted">
            Cadastre uma conta e registre seu primeiro lançamento pelo botão
            central. O Troqito funciona sem conexão: tudo fica no aparelho.
          </AppText>
          <Button
            label="Registrar lançamento"
            fullWidth
            onPress={() => router.push('/novo')}
          />
        </Card>
      ) : (
        <Card variant="elevated">
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <AppText variant="heading">Atividade recente</AppText>
            <Pressable
              onPress={() => router.push('/movimentacoes')}
              accessibilityRole="button"
              accessibilityLabel="Ver todas as movimentações"
              hitSlop={12}
            >
              <AppText variant="label" tone="primary" weight="semibold">
                Ver tudo
              </AppText>
            </Pressable>
          </View>

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
