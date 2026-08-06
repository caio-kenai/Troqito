import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert } from 'react-native';

import { AppText, Button, Screen, ScreenHeader, TextField } from '@/components';
import { createHousehold } from '@/features/households/repository/householdsRepository';
import {
  householdFormSchema,
  type HouseholdFormInput,
  type HouseholdFormValues,
} from '@/features/households/schemas/householdSchema';
import { useSession } from '@/features/profile/SessionProvider';

export default function NewHouseholdScreen() {
  const router = useRouter();
  const session = useSession();
  const profile = session.status === 'ready' ? session.profile : null;

  const { control, handleSubmit, formState } = useForm<
    HouseholdFormInput,
    unknown,
    HouseholdFormValues
  >({
    resolver: zodResolver(householdFormSchema),
    defaultValues: { name: '' },
  });

  return (
    <Screen scroll>
      <ScreenHeader title="Nova casa" back />

      <AppText variant="body" tone="muted">
        A casa reúne quem divide despesas com você. Você entra como dono e pode
        acrescentar as outras pessoas em seguida.
      </AppText>

      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <TextField
            label="Nome da casa"
            required
            placeholder="Apartamento 42"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Button
        label="Criar casa"
        fullWidth
        size="lg"
        loading={formState.isSubmitting}
        onPress={handleSubmit((values) => {
          if (!profile) return;

          try {
            createHousehold(profile.id, profile.name, values);
            router.back();
          } catch {
            Alert.alert(
              'Não foi possível criar',
              'A casa não pôde ser gravada no aparelho. Tente novamente.',
            );
          }
        })}
      />
    </Screen>
  );
}
