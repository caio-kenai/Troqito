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
  StateView,
  TextField,
} from '@/components';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useOwnerId } from '@/features/profile/SessionProvider';
import { createTransfer } from '@/features/transactions/repository/transactionsRepository';
import {
  transferFormSchema,
  type TransferFormInput,
  type TransferFormValues,
} from '@/features/transactions/schemas/transactionSchema';
import { today } from '@/lib/date';

export default function NewTransferScreen() {
  const router = useRouter();
  const ownerId = useOwnerId();
  const { accounts } = useAccounts(ownerId);

  const active = accounts.filter((account) => account.archivedAt === null);

  const { control, handleSubmit, formState } = useForm<
    TransferFormInput,
    unknown,
    TransferFormValues
  >({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      amount: '',
      date: today(),
      fromAccountId: active[0]?.id ?? '',
      toAccountId: active[1]?.id ?? '',
      notes: '',
    },
  });

  // Transferir exige duas contas: com uma só, não há para onde mover.
  if (active.length < 2) {
    return (
      <Screen>
        <StateView
          variant="empty"
          title="É preciso ter duas contas"
          description="Uma transferência move dinheiro entre contas suas. Cadastre pelo menos mais uma."
          actionLabel="Cadastrar conta"
          onAction={() => router.replace('/contas/nova')}
        />
      </Screen>
    );
  }

  const options = active.map((account) => ({
    value: account.id,
    label: account.name,
  }));

  return (
    <Screen scroll>
      <AppText variant="title">Nova transferência</AppText>
      <AppText variant="body" tone="muted">
        Transferências não entram nos totais de receita e despesa: o dinheiro
        continua sendo seu, só muda de lugar.
      </AppText>

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
        name="fromAccountId"
        render={({ field, fieldState }) => (
          <OptionGroup
            label="De"
            options={options}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="toAccountId"
        render={({ field, fieldState }) => (
          <OptionGroup
            label="Para"
            options={options}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
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
        label="Salvar transferência"
        fullWidth
        size="lg"
        loading={formState.isSubmitting}
        onPress={handleSubmit((values) => {
          try {
            createTransfer(ownerId, values);
            router.dismissAll();
          } catch {
            Alert.alert(
              'Não foi possível salvar',
              'A transferência não pôde ser gravada. Tente novamente.',
            );
          }
        })}
      />
    </Screen>
  );
}
