import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  IconChip,
  ProgressBar,
  Screen,
  ScreenHeader,
  SkeletonList,
  StateView,
  TAB_SCREEN_EDGES,
} from '@/components';
import { BUDGET_STATUS_LABELS } from '@/features/planning/domain/budget';
import { useBudgets, useGoals } from '@/features/planning/hooks/usePlanning';
import { useSession } from '@/features/profile/SessionProvider';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import { formatBR } from '@/lib/date';
import { cents, formatCents } from '@/lib/money';
import { useTheme } from '@/theme';

export default function PlanningScreen() {
  const theme = useTheme();
  const router = useRouter();
  const session = useSession();

  const profile = session.status === 'ready' ? session.profile : null;
  const ownerId = profile?.id ?? '';
  const cycleStartDay = profile?.cycleStartDay ?? 1;

  const { transactions } = useTransactions(ownerId);

  const entries = useMemo(
    () =>
      transactions.map((item) => ({
        amount: cents(item.amount),
        date: item.date,
        status: item.status,
        kind: item.kind,
        categoryId: item.categoryId,
        accountId: item.accountId,
      })),
    [transactions],
  );

  const { budgets, isLoading: loadingBudgets } = useBudgets(
    ownerId,
    entries,
    cycleStartDay,
  );
  const { goals, isLoading: loadingGoals } = useGoals(ownerId);

  if (loadingBudgets || loadingGoals) {
    return (
      <Screen edges={TAB_SCREEN_EDGES}>
        <ScreenHeader title="Planejamento" />
        <SkeletonList rows={4} />
      </Screen>
    );
  }

  if (budgets.length === 0 && goals.length === 0) {
    return (
      <Screen edges={TAB_SCREEN_EDGES}>
        <ScreenHeader title="Planejamento" />
        <StateView
          variant="empty"
          icon="flag-outline"
          title="Nada planejado ainda"
          description="Defina um teto de gasto por categoria e acompanhe quanto já foi usado. Ou crie uma meta e veja quanto guardar por mês para chegar lá."
          actionLabel="Criar orçamento"
          onAction={() => router.push('/planejamento/orcamento')}
        />
        <Button
          label="Criar meta"
          variant="secondary"
          fullWidth
          onPress={() => router.push('/planejamento/meta')}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll edges={TAB_SCREEN_EDGES}>
      <ScreenHeader title="Planejamento" />

      {budgets.length > 0 && (
        <View style={{ gap: theme.spacing.md }}>
          <AppText variant="overline" tone="subtle">
            Orçamentos do período
          </AppText>

          {budgets.map((progress) => (
            <Card key={progress.budget.id} variant="elevated">
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                }}
              >
                <IconChip
                  icon={
                    progress.status === 'exceeded'
                      ? 'alert-circle-outline'
                      : progress.status === 'approaching'
                        ? 'warning-outline'
                        : 'checkmark-circle-outline'
                  }
                  tone={
                    progress.status === 'exceeded'
                      ? 'expense'
                      : progress.status === 'approaching'
                        ? 'warning'
                        : 'income'
                  }
                />
                <View style={{ flex: 1, gap: theme.spacing.xxs }}>
                  <AppText variant="heading">{progress.budget.name}</AppText>
                  <AppText variant="caption" tone="muted">
                    {BUDGET_STATUS_LABELS[progress.status]}
                  </AppText>
                </View>
              </View>

              <ProgressBar
                value={progress.usage}
                tone={progress.status === 'within' ? 'primary' : 'warning'}
                label={`Orçamento ${progress.budget.name}`}
              />

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <AppText variant="caption" tone="muted" numeric>
                  {formatCents(progress.spent)} de{' '}
                  {formatCents(progress.budget.plannedAmount)}
                </AppText>
                <AppText
                  variant="caption"
                  tone={progress.status === 'exceeded' ? 'expense' : 'muted'}
                  numeric
                >
                  {progress.status === 'exceeded'
                    ? `${formatCents(progress.overspent)} acima`
                    : `${formatCents(progress.remaining)} restantes`}
                </AppText>
              </View>
            </Card>
          ))}
        </View>
      )}

      {goals.length > 0 && (
        <View style={{ gap: theme.spacing.md }}>
          <AppText variant="overline" tone="subtle">
            Metas
          </AppText>

          {goals.map((progress) => (
            <Card key={progress.goal.id} variant="elevated">
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                }}
              >
                <IconChip
                  icon={progress.achieved ? 'trophy-outline' : 'flag-outline'}
                  tone={progress.achieved ? 'income' : 'primary'}
                />
                <View style={{ flex: 1, gap: theme.spacing.xxs }}>
                  <AppText variant="heading">{progress.goal.name}</AppText>
                  <AppText variant="caption" tone="muted" numeric>
                    {formatCents(progress.saved)} de{' '}
                    {formatCents(progress.goal.targetAmount)}
                  </AppText>
                </View>
              </View>

              <ProgressBar
                value={progress.progress}
                tone="income"
                label={`Meta ${progress.goal.name}`}
              />

              {progress.achieved ? (
                <AppText variant="caption" tone="income">
                  Meta alcançada.
                </AppText>
              ) : progress.monthlyNeeded !== null ? (
                <AppText variant="caption" tone="muted" numeric>
                  Guarde {formatCents(progress.monthlyNeeded)} por mês para
                  chegar lá
                  {progress.goal.targetDate
                    ? ` até ${formatBR(progress.goal.targetDate)}`
                    : ''}
                  .
                </AppText>
              ) : (
                <AppText variant="caption" tone="muted" numeric>
                  Faltam {formatCents(progress.missing)}.
                </AppText>
              )}
            </Card>
          ))}
        </View>
      )}

      <Button
        label="Novo orçamento"
        fullWidth
        onPress={() => router.push('/planejamento/orcamento')}
      />
      <Button
        label="Nova meta"
        variant="secondary"
        fullWidth
        onPress={() => router.push('/planejamento/meta')}
      />
    </Screen>
  );
}
