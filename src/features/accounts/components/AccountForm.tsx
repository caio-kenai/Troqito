import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';

import { AppText, Button, OptionGroup, TextField } from '@/components';
import { ACCOUNT_TYPES } from '@/database/schema/common';
import { cents, formatCents } from '@/lib/money';
import { useTheme } from '@/theme';

import {
  ACCOUNT_TYPE_LABELS,
  accountFormSchema,
  type AccountFormInput,
  type AccountFormValues,
} from '../schemas/accountSchema';

export const ACCOUNT_COLORS = [
  '#0B7540',
  '#2FA8C4',
  '#5C93E3',
  '#7C6BD6',
  '#D65DA8',
  '#E3676B',
  '#E8AC3C',
  '#6B7A74',
] as const;

const TYPE_OPTIONS = ACCOUNT_TYPES.map((type) => ({
  value: type,
  label: ACCOUNT_TYPE_LABELS[type],
}));

export type AccountFormProps = {
  defaultValues?: Partial<AccountFormInput>;
  submitLabel: string;
  onSubmit: (values: AccountFormValues) => void;
};

export function AccountForm({
  defaultValues,
  submitLabel,
  onSubmit,
}: AccountFormProps) {
  const theme = useTheme();

  // O terceiro genérico é o tipo já transformado pelo schema: o formulário
  // trabalha com texto e o envio recebe centavos, sem validar duas vezes.
  const { control, handleSubmit, formState } = useForm<
    AccountFormInput,
    unknown,
    AccountFormValues
  >({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: '',
      type: 'checking',
      institution: '',
      color: ACCOUNT_COLORS[0],
      initialBalance: '',
      includeInTotal: true,
      ...defaultValues,
    },
  });

  const submit = handleSubmit(onSubmit);

  return (
    <>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <TextField
            label="Nome"
            required
            placeholder="Conta do dia a dia"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="type"
        render={({ field, fieldState }) => (
          <OptionGroup
            label="Tipo"
            options={TYPE_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="institution"
        render={({ field, fieldState }) => (
          <TextField
            label="Instituição"
            placeholder="Banco, carteira ou emissor"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="initialBalance"
        render={({ field, fieldState }) => (
          <TextField
            label="Saldo inicial"
            placeholder="0,00"
            keyboardType="decimal-pad"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            hint={`Quanto há nesta conta hoje. Em branco vale ${formatCents(cents(0))}.`}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="color"
        render={({ field }) => (
          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="label" tone="muted">
              Cor
            </AppText>
            <View
              accessibilityRole="radiogroup"
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: theme.spacing.md,
              }}
            >
              {ACCOUNT_COLORS.map((color) => (
                <Pressable
                  key={color}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: field.value === color }}
                  accessibilityLabel={`Cor ${color}`}
                  onPress={() => field.onChange(color)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: theme.radius.full,
                    backgroundColor: color,
                    borderWidth: field.value === color ? 3 : 0,
                    borderColor: theme.colors.text,
                  }}
                />
              ))}
            </View>
          </View>
        )}
      />

      <Controller
        control={control}
        name="includeInTotal"
        render={({ field }) => (
          <OptionGroup
            label="Entra no saldo consolidado"
            options={[
              { value: 'sim', label: 'Sim' },
              { value: 'nao', label: 'Não' },
            ]}
            value={field.value ? 'sim' : 'nao'}
            onChange={(value) => field.onChange(value === 'sim')}
          />
        )}
      />

      <Button
        label={submitLabel}
        fullWidth
        size="lg"
        loading={formState.isSubmitting}
        onPress={submit}
      />
    </>
  );
}
