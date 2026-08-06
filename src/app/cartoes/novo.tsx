import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, View } from 'react-native';

import {
  AppText,
  Button,
  OptionGroup,
  Screen,
  ScreenHeader,
  TextField,
} from '@/components';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { createCard } from '@/features/cards/repository/cardsRepository';
import {
  CARD_COLORS,
  cardFormSchema,
  type CardFormInput,
  type CardFormValues,
} from '@/features/cards/schemas/cardSchema';
import { useOwnerId } from '@/features/profile/SessionProvider';
import { useTheme } from '@/theme';

export default function NewCardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const ownerId = useOwnerId();
  const { accounts } = useAccounts(ownerId);

  const { control, handleSubmit, formState } = useForm<
    CardFormInput,
    unknown,
    CardFormValues
  >({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      name: '',
      brand: '',
      color: CARD_COLORS[0],
      creditLimit: '',
      closingDay: '',
      dueDay: '',
      paymentAccountId: '',
    },
  });

  return (
    <Screen scroll>
      <ScreenHeader title="Novo cartão" back />

      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <TextField
            label="Nome do cartão"
            required
            placeholder="Cartão do dia a dia"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="brand"
        render={({ field, fieldState }) => (
          <TextField
            label="Bandeira"
            placeholder="Opcional"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="creditLimit"
        render={({ field, fieldState }) => (
          <TextField
            label="Limite"
            placeholder="0,00"
            keyboardType="decimal-pad"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <Controller
          control={control}
          name="closingDay"
          render={({ field, fieldState }) => (
            <View style={{ flex: 1 }}>
              <TextField
                label="Fecha no dia"
                required
                placeholder="20"
                keyboardType="number-pad"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="dueDay"
          render={({ field, fieldState }) => (
            <View style={{ flex: 1 }}>
              <TextField
                label="Vence no dia"
                required
                placeholder="28"
                keyboardType="number-pad"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            </View>
          )}
        />
      </View>

      <AppText variant="caption" tone="muted">
        Compras feitas depois do fechamento entram na fatura seguinte.
      </AppText>

      <Controller
        control={control}
        name="color"
        render={({ field }) => (
          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant="label">Cor</AppText>
            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              {CARD_COLORS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => field.onChange(color)}
                  accessibilityRole="button"
                  accessibilityLabel={`Cor ${color}`}
                  accessibilityState={{ selected: field.value === color }}
                  style={{
                    width: theme.minTouchTarget,
                    height: theme.minTouchTarget,
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

      {accounts.length > 0 && (
        <Controller
          control={control}
          name="paymentAccountId"
          render={({ field }) => (
            <OptionGroup
              label="Conta que paga a fatura"
              options={accounts.map((account) => ({
                value: account.id,
                label: account.name,
              }))}
              value={field.value ?? ''}
              onChange={field.onChange}
            />
          )}
        />
      )}

      <Button
        label="Salvar cartão"
        fullWidth
        size="lg"
        loading={formState.isSubmitting}
        onPress={handleSubmit((values) => {
          try {
            createCard(ownerId, values);
            router.back();
          } catch {
            Alert.alert(
              'Não foi possível salvar',
              'O cartão não pôde ser gravado no aparelho. Tente novamente.',
            );
          }
        })}
      />
    </Screen>
  );
}
