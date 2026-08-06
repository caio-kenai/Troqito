import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { Button, DateField, OptionGroup, TextField } from '@/components';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { today } from '@/lib/date';

import {
  entryFormSchema,
  type EntryFormInput,
  type EntryFormValues,
  STATUS_LABELS,
} from '../schemas/transactionSchema';

export type EntryFormProps = {
  ownerId: string;
  kind: 'income' | 'expense';
  submitLabel: string;
  onSubmit: (values: EntryFormValues) => void;
};

export function EntryForm({
  ownerId,
  kind,
  submitLabel,
  onSubmit,
}: EntryFormProps) {
  const { accounts } = useAccounts(ownerId);
  const { roots } = useCategories(ownerId, kind);

  const activeAccounts = accounts.filter(
    (account) => account.archivedAt === null,
  );

  const { control, handleSubmit, formState } = useForm<
    EntryFormInput,
    unknown,
    EntryFormValues
  >({
    resolver: zodResolver(entryFormSchema),
    defaultValues: {
      title: '',
      amount: '',
      date: today(),
      categoryId: '',
      accountId: activeAccounts[0]?.id ?? '',
      status: 'settled',
      notes: '',
    },
  });

  return (
    <>
      <Controller
        control={control}
        name="amount"
        render={({ field, fieldState }) => (
          <TextField
            label="Valor"
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
        name="title"
        render={({ field, fieldState }) => (
          <TextField
            label="Descrição"
            required
            placeholder={kind === 'expense' ? 'Mercado do mês' : 'Salário'}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="date"
        render={({ field, fieldState }) => (
          <DateField
            label="Data"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="categoryId"
        render={({ field, fieldState }) => (
          <OptionGroup
            label="Categoria"
            options={roots.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="accountId"
        render={({ field, fieldState }) => (
          <OptionGroup
            label="Conta"
            options={activeAccounts.map((account) => ({
              value: account.id,
              label: account.name,
            }))}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <OptionGroup
            label="Situação"
            options={[
              { value: 'settled', label: STATUS_LABELS.settled },
              { value: 'pending', label: STATUS_LABELS.pending },
              { value: 'planned', label: STATUS_LABELS.planned },
            ]}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="notes"
        render={({ field, fieldState }) => (
          <TextField
            label="Observações"
            placeholder="Opcional"
            multiline
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Button
        label={submitLabel}
        fullWidth
        size="lg"
        loading={formState.isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />
    </>
  );
}
