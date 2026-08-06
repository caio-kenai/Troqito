import { useRouter } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  IconChip,
  Screen,
  ScreenHeader,
  SkeletonList,
  StateView,
} from '@/components';
import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from '@/features/households/domain/roles';
import {
  useCan,
  useHouseholds,
  useMembers,
  useMyRole,
} from '@/features/households/hooks/useHouseholds';
import {
  deleteHousehold,
  removeMember,
  type HouseholdMember,
} from '@/features/households/repository/householdsRepository';
import { useOwnerId } from '@/features/profile/SessionProvider';
import { type HouseholdRole } from '@/database/schema/common';
import { useTheme } from '@/theme';

function MemberRow({
  member,
  canRemove,
  onEdit,
  onRemove,
}: {
  member: HouseholdMember;
  canRemove: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const theme = useTheme();
  const role = member.role as HouseholdRole;
  const isOwner = role === 'owner';

  return (
    <Pressable
      onPress={onEdit}
      accessibilityRole="button"
      accessibilityLabel={`${member.displayName}, ${ROLE_LABELS[role]}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: theme.minTouchTarget,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <IconChip
        icon={isOwner ? 'star-outline' : 'person-outline'}
        tone={isOwner ? 'primary' : 'muted'}
      />

      <View style={{ flex: 1, gap: theme.spacing.xxs }}>
        <AppText variant="body" weight="semibold">
          {member.displayName}
        </AppText>
        <AppText variant="caption" tone="muted">
          {ROLE_LABELS[role]} · {ROLE_DESCRIPTIONS[role]}
        </AppText>
      </View>

      {canRemove && !isOwner && (
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`Remover ${member.displayName}`}
          hitSlop={12}
          style={{
            width: theme.minTouchTarget,
            height: theme.minTouchTarget,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppText variant="body" tone="danger">
            ×
          </AppText>
        </Pressable>
      )}
    </Pressable>
  );
}

export default function HouseholdScreen() {
  const theme = useTheme();
  const router = useRouter();
  const ownerId = useOwnerId();

  const { current, isLoading } = useHouseholds(ownerId);
  const { members, isLoading: loadingMembers } = useMembers(current?.id ?? '');
  const role = useMyRole(members, ownerId);

  const canInvite = useCan(role, 'member.invite');
  const canRemove = useCan(role, 'member.remove');
  const canDelete = useCan(role, 'household.delete');

  if (isLoading || (current && loadingMembers)) {
    return (
      <Screen>
        <ScreenHeader title="Casa" back />
        <SkeletonList rows={4} />
      </Screen>
    );
  }

  if (!current) {
    return (
      <Screen>
        <ScreenHeader title="Casa" back />
        <StateView
          variant="empty"
          icon="home-outline"
          title="Nenhuma casa cadastrada"
          description="Crie uma casa para dividir despesas com quem mora com você. Cada pessoa tem seu papel, e o que é compartilhado fica separado do que é só seu."
          actionLabel="Criar casa"
          onAction={() => router.push('/casa/nova')}
        />
      </Screen>
    );
  }

  const confirmDeleteHousehold = () => {
    Alert.alert(
      `Excluir ${current.name}?`,
      'As pessoas e a divisão de despesas da casa serão removidas. Os lançamentos que você registrou continuam existindo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteHousehold(current.id);
            router.back();
          },
        },
      ],
    );
  };

  const confirmRemoveMember = (member: HouseholdMember) => {
    Alert.alert(
      `Remover ${member.displayName}?`,
      'A pessoa deixa de participar das próximas divisões. O que já foi dividido continua registrado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeMember(member.id),
        },
      ],
    );
  };

  return (
    <Screen scroll>
      <ScreenHeader
        title={current.name}
        back
        subtitle={`${members.length} ${members.length === 1 ? 'pessoa' : 'pessoas'}`}
        {...(canInvite
          ? {
              action: {
                icon: 'person-add-outline' as const,
                label: 'Adicionar pessoa',
                onPress: () =>
                  router.push(`/casa/membro?householdId=${current.id}`),
              },
            }
          : {})}
      />

      <Card variant="elevated">
        <View style={{ gap: theme.spacing.xs }}>
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              canRemove={canRemove}
              onEdit={() =>
                router.push(
                  `/casa/membro?householdId=${current.id}&memberId=${member.id}`,
                )
              }
              onRemove={() => confirmRemoveMember(member)}
            />
          ))}
        </View>
      </Card>

      {canInvite && (
        <Button
          label="Adicionar pessoa"
          fullWidth
          size="lg"
          onPress={() => router.push(`/casa/membro?householdId=${current.id}`)}
        />
      )}

      <Card>
        <AppText variant="heading">Como funciona</AppText>
        <AppText variant="body" tone="muted">
          Uma despesa marcada como compartilhada é dividida entre as pessoas da
          casa. Cada uma vê quanto deve, e o acerto fica registrado. Nada sai da
          sua conta: o Troqito apenas anota quem pagou o quê.
        </AppText>
      </Card>

      {canDelete && (
        <Button
          label="Excluir casa"
          variant="danger"
          fullWidth
          onPress={confirmDeleteHousehold}
        />
      )}
    </Screen>
  );
}
