import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable } from 'react-native';

import {
  AppText,
  Card,
  IconChip,
  OptionGroup,
  Screen,
  ScreenHeader,
  SkeletonList,
  StateView,
} from '@/components';
import { type SplitMethod } from '@/database/schema/common';
import {
  SPLIT_METHOD_DESCRIPTIONS,
  SPLIT_METHOD_LABELS,
  splitEqually,
} from '@/features/households/domain/split';
import {
  useHouseholds,
  useMembers,
} from '@/features/households/hooks/useHouseholds';
import { saveSplits } from '@/features/households/repository/splitsRepository';
import { useOwnerId } from '@/features/profile/SessionProvider';
import { EntryForm } from '@/features/transactions/components/EntryForm';
import { createEntry } from '@/features/transactions/repository/transactionsRepository';
import { formatCents, cents } from '@/lib/money';
import { useTheme } from '@/theme';

const METHOD_OPTIONS: { value: SplitMethod; label: string }[] = [
  { value: 'equal', label: SPLIT_METHOD_LABELS.equal },
];

export default function SharedExpenseScreen() {
  const theme = useTheme();
  const router = useRouter();
  const ownerId = useOwnerId();

  const { current, isLoading } = useHouseholds(ownerId);
  const { members } = useMembers(current?.id ?? '');

  const [method, setMethod] = useState<SplitMethod>('equal');
  const [selected, setSelected] = useState<string[]>([]);
  const [paidBy, setPaidBy] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Screen>
        <ScreenHeader title="Despesa compartilhada" back />
        <SkeletonList rows={4} />
      </Screen>
    );
  }

  if (!current || members.length < 2) {
    return (
      <Screen>
        <ScreenHeader title="Despesa compartilhada" back />
        <StateView
          variant="empty"
          icon="people-outline"
          title="Cadastre a casa primeiro"
          description="A divisão precisa de uma casa com pelo menos duas pessoas. Cadastre quem divide as despesas com você."
          actionLabel="Ir para a casa"
          onAction={() => router.replace('/casa')}
        />
      </Screen>
    );
  }

  const participants =
    selected.length > 0 ? selected : members.map((m) => m.id);
  const payer =
    paidBy ?? members.find((m) => m.profileId === ownerId)?.id ?? '';

  const toggle = (memberId: string) => {
    setSelected((current) => {
      const base = current.length > 0 ? current : members.map((m) => m.id);
      return base.includes(memberId)
        ? base.filter((id) => id !== memberId)
        : [...base, memberId];
    });
  };

  return (
    <Screen scroll>
      <ScreenHeader title="Despesa compartilhada" back />

      <AppText variant="body" tone="muted">
        A despesa é registrada na sua conta e dividida entre as pessoas
        escolhidas. Nada é cobrado de ninguém: o Troqito apenas anota quanto
        cada um deve a quem pagou.
      </AppText>

      <Card variant="elevated">
        <AppText variant="heading">Quem participa</AppText>
        {members.map((member) => {
          const active = participants.includes(member.id);

          return (
            <Pressable
              key={member.id}
              onPress={() => toggle(member.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
              accessibilityLabel={member.displayName}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.lg,
                paddingVertical: theme.spacing.md,
                minHeight: theme.minTouchTarget,
                opacity: active ? 1 : 0.45,
              }}
            >
              <IconChip
                icon={active ? 'checkmark-circle' : 'ellipse-outline'}
                tone={active ? 'primary' : 'muted'}
                size="sm"
              />
              <AppText variant="body" style={{ flex: 1 }}>
                {member.displayName}
              </AppText>
            </Pressable>
          );
        })}
      </Card>

      <Card variant="elevated">
        <OptionGroup
          label="Quem pagou"
          options={members.map((member) => ({
            value: member.id,
            label: member.displayName,
          }))}
          value={payer}
          onChange={setPaidBy}
        />
      </Card>

      <Card variant="elevated">
        <OptionGroup
          label="Como dividir"
          options={METHOD_OPTIONS}
          value={method}
          onChange={(value) => setMethod(value as SplitMethod)}
        />
        <AppText variant="caption" tone="muted">
          {SPLIT_METHOD_DESCRIPTIONS[method]}.
        </AppText>
        <AppText variant="caption" tone="subtle">
          Divisão por valor e por porcentagem entram na próxima etapa; o cálculo
          das duas já está pronto e verificado.
        </AppText>
      </Card>

      <EntryForm
        ownerId={ownerId}
        kind="expense"
        submitLabel="Salvar e dividir"
        onSubmit={(values) => {
          if (participants.length === 0 || payer === '') {
            Alert.alert(
              'Falta escolher',
              'Selecione quem participa e quem pagou a despesa.',
            );
            return;
          }

          try {
            const id = createEntry(ownerId, 'expense', values);
            const shares = splitEqually(cents(values.amount), participants);

            saveSplits(ownerId, id, values.amount, method, shares, payer);

            const each = shares[0]?.amount ?? cents(0);
            Alert.alert(
              'Despesa dividida',
              `Cada pessoa fica com cerca de ${formatCents(each)}.`,
            );
            router.dismissAll();
          } catch {
            Alert.alert(
              'Não foi possível salvar',
              'A despesa não pôde ser dividida. Tente novamente.',
            );
          }
        }}
      />
    </Screen>
  );
}
