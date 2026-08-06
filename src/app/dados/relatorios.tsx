import { useMemo, useState } from 'react';
import { View } from 'react-native';

import {
  AppText,
  Card,
  OptionGroup,
  Screen,
  ScreenHeader,
  StateView,
} from '@/components';
import { BarChart } from '@/components/charts';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useOwnerId } from '@/features/profile/SessionProvider';
import { buildReport, lastMonthsRange } from '@/features/reports/domain/report';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import { formatBR, today } from '@/lib/date';
import { cents, formatCents } from '@/lib/money';
import { useTheme } from '@/theme';

const PERIOD_OPTIONS = [
  { value: '1', label: 'Este mês' },
  { value: '3', label: '3 meses' },
  { value: '6', label: '6 meses' },
  { value: '12', label: '12 meses' },
];

/** Rótulo curto do mês, como aparece no eixo do gráfico. */
function monthLabel(key: string): string {
  const [year, month] = key.split('-');
  const names = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ];
  return `${names[Number(month) - 1] ?? month}/${year?.slice(2) ?? ''}`;
}

export default function ReportsScreen() {
  const theme = useTheme();
  const ownerId = useOwnerId();

  const { transactions } = useTransactions(ownerId);
  const { byId: categoriesById } = useCategories(ownerId);
  const { accounts } = useAccounts(ownerId);

  const [months, setMonths] = useState('3');

  const accountNames = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.name])),
    [accounts],
  );

  const report = useMemo(() => {
    const range = lastMonthsRange(today(), Number(months));

    return buildReport(
      transactions.map((item) => ({
        kind: item.kind,
        status: item.status,
        amount: cents(item.amount),
        date: item.date,
        categoryId: item.categoryId,
        accountId: item.accountId,
      })),
      range,
    );
  }, [transactions, months]);

  return (
    <Screen scroll>
      <ScreenHeader title="Relatórios" back />

      <OptionGroup
        label="Período"
        options={PERIOD_OPTIONS}
        value={months}
        onChange={setMonths}
      />

      <AppText variant="caption" tone="subtle">
        De {formatBR(report.range.start)} a {formatBR(report.range.end)}
      </AppText>

      {report.count === 0 ? (
        <StateView
          variant="empty"
          icon="bar-chart-outline"
          title="Nenhum lançamento no período"
          description="Escolha um período maior ou registre lançamentos para ver o relatório."
        />
      ) : (
        <>
          <Card variant="elevated">
            <AppText variant="heading">Resultado do período</AppText>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: theme.spacing.xs,
              }}
            >
              <View style={{ gap: theme.spacing.xxs }}>
                <AppText variant="caption" tone="muted">
                  Receitas
                </AppText>
                <AppText variant="body" tone="income" weight="semibold" numeric>
                  {formatCents(report.income, { showPositiveSign: true })}
                </AppText>
              </View>
              <View style={{ gap: theme.spacing.xxs }}>
                <AppText variant="caption" tone="muted">
                  Despesas
                </AppText>
                <AppText
                  variant="body"
                  tone="expense"
                  weight="semibold"
                  numeric
                >
                  {formatCents(report.expense)}
                </AppText>
              </View>
              <View style={{ gap: theme.spacing.xxs }}>
                <AppText variant="caption" tone="muted">
                  Resultado
                </AppText>
                <AppText
                  variant="body"
                  weight="semibold"
                  numeric
                  tone={report.result < 0 ? 'expense' : 'income'}
                >
                  {formatCents(report.result, { showPositiveSign: true })}
                </AppText>
              </View>
            </View>
          </Card>

          {report.byMonth.length > 1 && (
            <Card variant="elevated">
              <AppText variant="heading">Mês a mês</AppText>
              <BarChart
                groups={report.byMonth.map((month) => ({
                  label: monthLabel(month.key),
                  income: month.income,
                  expense: month.expense,
                }))}
              />
              <View style={{ flexDirection: 'row', gap: theme.spacing.lg }}>
                <AppText variant="caption" tone="income">
                  ■ Receitas
                </AppText>
                <AppText variant="caption" tone="expense">
                  ■ Despesas
                </AppText>
              </View>
            </Card>
          )}

          <Card variant="elevated">
            <AppText variant="heading">Por categoria</AppText>
            {report.byCategory.slice(0, 10).map((group) => (
              <View
                key={group.key}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: theme.spacing.xs,
                  gap: theme.spacing.md,
                }}
              >
                <AppText variant="body" style={{ flex: 1 }} numberOfLines={1}>
                  {categoriesById.get(group.key)?.name ?? 'Sem categoria'}
                </AppText>
                <AppText variant="body" tone="muted" numeric>
                  {formatCents(group.expense)}
                </AppText>
              </View>
            ))}
          </Card>

          <Card variant="elevated">
            <AppText variant="heading">Por conta</AppText>
            {report.byAccount.map((group) => (
              <View
                key={group.key}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: theme.spacing.xs,
                  gap: theme.spacing.md,
                }}
              >
                <AppText variant="body" style={{ flex: 1 }} numberOfLines={1}>
                  {accountNames.get(group.key) ?? 'Sem conta'}
                </AppText>
                <AppText
                  variant="body"
                  numeric
                  tone={group.result < 0 ? 'expense' : 'income'}
                >
                  {formatCents(group.result, { showPositiveSign: true })}
                </AppText>
              </View>
            ))}
          </Card>
        </>
      )}
    </Screen>
  );
}
