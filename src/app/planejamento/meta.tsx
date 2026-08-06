import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, View } from 'react-native';

import {
  AppText,
  Button,
  DateField,
  Screen,
  ScreenHeader,
  TextField,
} from '@/components';
import { createGoal } from '@/features/planning/repository/planningRepository';
import {
  goalFormSchema,
  type GoalFormInput,
  type GoalFormValues,
} from '@/features/planning/schemas/planningSchema';
import { useOwnerId } from '@/features/profile/SessionProvider';
import { today } from '@/lib/date';
import { useTheme } from '@/theme';

const GOAL_COLORS = [
  '#0B7540',
  '#2E6FCC',
  '#C98A12',
  '#8B1F24',
  '#5FA82A',
  '#36413D',
] as const;

export default function NewGoalScreen() {
  const theme = useTheme();
  const router = useRouter();
  const ownerId = useOwnerId();

  const { control, handleSubmit, formState } = useForm<
    GoalFormInput,
    unknown,
    GoalFormValues
  >({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: '',
      description: '',
      targetAmount: '',
      targetDate: today(),
      color: GOAL_COLORS[0],
    },
  });

  return (
    <Screen scroll>
      <ScreenHeader title="Nova meta" back />

      <AppText variant="body" tone="muted">
        Diga quanto quer juntar e até quando. O Troqito calcula quanto guardar
        por mês para chegar lá.
      </AppText>

      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <TextField
            label="Nome da meta"
            required
            placeholder="Viagem de fim de ano"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="targetAmount"
        render={({ field, fieldState }) => (
          <TextField
            label="Quanto quer juntar"
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
        name="targetDate"
        render={({ field, fieldState }) => (
          <DateField
            label="Até quando"
            value={field.value ?? today()}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="description"
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

      <Controller
        control={control}
        name="color"
        render={({ field }) => (
          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant="label">Cor</AppText>
            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              {GOAL_COLORS.map((color) => (
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

      <Button
        label="Salvar meta"
        fullWidth
        size="lg"
        loading={formState.isSubmitting}
        onPress={handleSubmit((values) => {
          try {
            createGoal(ownerId, values);
            router.back();
          } catch {
            Alert.alert(
              'Não foi possível salvar',
              'A meta não pôde ser gravada no aparelho. Tente novamente.',
            );
          }
        })}
      />
    </Screen>
  );
}
