import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert } from 'react-native';

import {
  AppText,
  Button,
  DateField,
  OptionGroup,
  Screen,
  ScreenHeader,
  TextField,
} from '@/components';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { BUDGET_SCOPE_LABELS } from '@/features/planning/domain/budget';
import { createBudget } from '@/features/planning/repository/planningRepository';
import {
  BUDGET_PERIODS,
  BUDGET_SCOPES,
  budgetFormSchema,
  PERIOD_LABELS,
  type BudgetFormInput,
  type BudgetFormValues,
} from '@/features/planning/schemas/planningSchema';
import { useOwnerId } from '@/features/profile/SessionProvider';
import { today } from '@/lib/date';

const SCOPE_OPTIONS = BUDGET_SCOPES.map((scope) => ({
  value: scope,
  label: BUDGET_SCOPE_LABELS[scope],
}));

const PERIOD_OPTIONS = BUDGET_PERIODS.map((period) => ({
  value: period,
  label: PERIOD_LABELS[period],
}));

export default function NewBudgetScreen() {
  const router = useRouter();
  const ownerId = useOwnerId();
  const { roots } = useCategories(ownerId, 'expense');
  const { accounts } = useAccounts(ownerId);

  const { control, handleSubmit, formState } = useForm<
    BudgetFormInput,
    unknown,
    BudgetFormValues
  >({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      name: '',
      plannedAmount: '',
      scope: 'category',
      scopeId: '',
      period: 'monthly',
      startDate: today(),
      alertThreshold: '80',
    },
  });

  return (
    <Screen scroll>
      <ScreenHeader title="Novo orçamento" back />

      <AppText variant="body" tone="muted">
        Um orçamento é um teto de gasto para o período. O Troqito acompanha
        quanto já foi usado e avisa quando você se aproxima do limite.
      </AppText>

      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <TextField
            label="Nome"
            required
            placeholder="Mercado do mês"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="plannedAmount"
        render={({ field, fieldState }) => (
          <TextField
            label="Quanto pode gastar"
            required
            placeholder="0,00"
            keyboardType="decimal-pad"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="scope"
        render={({ field }) => (
          <OptionGroup
            label="Limitar o quê"
            options={SCOPE_OPTIONS}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="scopeId"
        render={({ field, fieldState }) => (
          <OptionGroup
            label="Alvo"
            options={[
              ...roots.map((category) => ({
                value: category.id,
                label: category.name,
              })),
              ...accounts.map((account) => ({
                value: account.id,
                label: account.name,
              })),
            ]}
            value={field.value ?? ''}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="period"
        render={({ field }) => (
          <OptionGroup
            label="Período"
            options={PERIOD_OPTIONS}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="startDate"
        render={({ field, fieldState }) => (
          <DateField
            label="A partir de"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="alertThreshold"
        render={({ field, fieldState }) => (
          <TextField
            label="Avisar ao chegar em (%)"
            keyboardType="number-pad"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Button
        label="Salvar orçamento"
        fullWidth
        size="lg"
        loading={formState.isSubmitting}
        onPress={handleSubmit((values) => {
          try {
            createBudget(ownerId, values);
            router.back();
          } catch {
            Alert.alert(
              'Não foi possível salvar',
              'O orçamento não pôde ser gravado no aparelho. Tente novamente.',
            );
          }
        })}
      />
    </Screen>
  );
}
