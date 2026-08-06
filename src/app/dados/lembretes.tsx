import { useState } from 'react';
import { Alert, View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  IconChip,
  Screen,
  ScreenHeader,
} from '@/components';
import {
  cancelAllReminders,
  canNotify,
  rescheduleReminders,
} from '@/features/notifications/service/notificationService';
import { useOwnerId } from '@/features/profile/SessionProvider';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import { today } from '@/lib/date';
import { cents } from '@/lib/money';
import { useTheme } from '@/theme';

export default function RemindersScreen() {
  const theme = useTheme();
  const ownerId = useOwnerId();
  const { transactions } = useTransactions(ownerId);

  const [busy, setBusy] = useState(false);
  const [scheduled, setScheduled] = useState<number | null>(null);

  const pending = transactions.filter(
    (item) => item.status === 'pending' || item.status === 'planned',
  );

  const enable = async () => {
    setBusy(true);

    try {
      if (!(await canNotify())) {
        Alert.alert(
          'Permissão negada',
          'O Android não autorizou as notificações do Troqito. Você pode liberar isso nas configurações do aparelho.',
        );
        return;
      }

      const count = await rescheduleReminders(
        pending.map((item) => ({
          id: item.id,
          title: item.title,
          amount: cents(item.amount),
          dueDate: item.dueDate ?? item.date,
          kind: item.kind,
          status: item.status,
        })),
        today(),
      );

      setScheduled(count);
    } catch {
      Alert.alert(
        'Não foi possível agendar',
        'Os lembretes não puderam ser criados. Tente novamente.',
      );
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);

    try {
      await cancelAllReminders();
      setScheduled(0);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll>
      <ScreenHeader title="Lembretes de vencimento" back />

      <AppText variant="body" tone="muted">
        O Troqito avisa no dia do vencimento das contas que você marcou como
        previstas ou pendentes. O aviso sai às nove da manhã: cedo o bastante
        para dar tempo de pagar, tarde o bastante para não acordar ninguém.
      </AppText>

      <Card variant="elevated">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.lg,
          }}
        >
          <IconChip icon="notifications-outline" tone="warning" />
          <View style={{ flex: 1, gap: theme.spacing.xxs }}>
            <AppText variant="heading">
              {pending.length}{' '}
              {pending.length === 1 ? 'conta aguardando' : 'contas aguardando'}
            </AppText>
            <AppText variant="caption" tone="muted">
              {scheduled === null
                ? 'Toque em atualizar para agendar os avisos'
                : scheduled === 0
                  ? 'Nenhum lembrete agendado'
                  : `${scheduled} ${scheduled === 1 ? 'lembrete agendado' : 'lembretes agendados'}`}
            </AppText>
          </View>
        </View>

        <Button
          label="Atualizar lembretes"
          fullWidth
          loading={busy}
          onPress={() => void enable()}
        />

        <Button
          label="Desligar todos"
          variant="ghost"
          fullWidth
          onPress={() => void disable()}
        />
      </Card>

      <AppText variant="caption" tone="subtle">
        Contas já pagas não geram aviso, e vencimentos que já passaram não são
        reagendados. Os lembretes são recriados do zero a cada atualização, para
        nenhum aviso de conta excluída continuar tocando.
      </AppText>
    </Screen>
  );
}
