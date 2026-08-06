import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert } from 'react-native';

import {
  AppText,
  Button,
  OptionGroup,
  Screen,
  ScreenHeader,
  TextField,
} from '@/components';
import {
  ASSIGNABLE_ROLES,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from '@/features/households/domain/roles';
import { useMembers } from '@/features/households/hooks/useHouseholds';
import {
  addMember,
  updateMember,
} from '@/features/households/repository/householdsRepository';
import {
  memberFormSchema,
  type MemberFormInput,
  type MemberFormValues,
} from '@/features/households/schemas/householdSchema';

const ROLE_OPTIONS = ASSIGNABLE_ROLES.map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}));

export default function MemberScreen() {
  const router = useRouter();
  const { householdId, memberId } = useLocalSearchParams<{
    householdId: string;
    memberId?: string;
  }>();

  const { members } = useMembers(householdId);
  const existing = memberId
    ? members.find((member) => member.id === memberId)
    : undefined;

  const { control, handleSubmit, formState } = useForm<
    MemberFormInput,
    unknown,
    MemberFormValues
  >({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      displayName: existing?.displayName ?? '',
      role: (existing?.role as MemberFormInput['role']) ?? 'member',
    },
  });

  return (
    <Screen scroll>
      <ScreenHeader
        title={existing ? 'Editar pessoa' : 'Adicionar pessoa'}
        back
      />

      <Controller
        control={control}
        name="displayName"
        render={({ field, fieldState }) => (
          <TextField
            label="Nome"
            required
            placeholder="Como essa pessoa é chamada"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="role"
        // A descrição do papel sai daqui de dentro, e não de um `watch` do
        // formulário: essa função não pode ser memoizada com segurança e faria
        // o React Compiler desistir de otimizar a tela inteira.
        render={({ field, fieldState }) => (
          <>
            <OptionGroup
              label="Papel na casa"
              options={ROLE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
            {field.value !== 'owner' && (
              <AppText variant="caption" tone="muted">
                {ROLE_DESCRIPTIONS[field.value]}.
              </AppText>
            )}
          </>
        )}
      />

      <AppText variant="caption" tone="subtle">
        Enquanto o Troqito funciona só neste aparelho, a pessoa existe como
        registro local. Quando o convite por conta entrar, este cadastro é
        ligado ao perfil dela sem refazer a divisão já lançada.
      </AppText>

      <Button
        label={existing ? 'Salvar' : 'Adicionar'}
        fullWidth
        size="lg"
        loading={formState.isSubmitting}
        onPress={handleSubmit((values) => {
          try {
            if (existing) {
              updateMember(existing.id, values);
            } else {
              addMember(householdId, values);
            }
            router.back();
          } catch {
            Alert.alert(
              'Não foi possível salvar',
              'A pessoa não pôde ser gravada no aparelho. Tente novamente.',
            );
          }
        })}
      />
    </Screen>
  );
}
