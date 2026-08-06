import { useRouter } from 'expo-router';
import { View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  IconChip,
  ProgressBar,
  Screen,
  ScreenHeader,
  SkeletonList,
  StateView,
} from '@/components';
import { invoiceFor } from '@/features/cards/domain/invoice';
import { useCards } from '@/features/cards/hooks/useCards';
import { useOwnerId } from '@/features/profile/SessionProvider';
import { formatBR, today } from '@/lib/date';
import { formatCents } from '@/lib/money';
import { useTheme } from '@/theme';

export default function CardsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const ownerId = useOwnerId();
  const { cards, isLoading } = useCards(ownerId);

  if (isLoading) {
    return (
      <Screen>
        <ScreenHeader title="Cartões" back />
        <SkeletonList rows={3} />
      </Screen>
    );
  }

  if (cards.length === 0) {
    return (
      <Screen>
        <ScreenHeader title="Cartões" back />
        <StateView
          variant="empty"
          icon="card-outline"
          title="Nenhum cartão cadastrado"
          description="Cadastre seus cartões de crédito para acompanhar o limite usado e em qual fatura cada compra cai."
          actionLabel="Cadastrar cartão"
          onAction={() => router.push('/cartoes/novo')}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <ScreenHeader
        title="Cartões"
        back
        action={{
          icon: 'add',
          label: 'Cadastrar cartão',
          onPress: () => router.push('/cartoes/novo'),
        }}
      />

      {cards.map((card) => {
        const invoice = invoiceFor(today(), {
          closingDay: card.closingDay,
          dueDay: card.dueDay,
        });
        const exceeded = card.usage > 1;

        return (
          <Card key={card.id} variant="elevated">
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.lg,
              }}
            >
              <IconChip icon="card-outline" tone="primary" />
              <View style={{ flex: 1, gap: theme.spacing.xxs }}>
                <AppText variant="heading">{card.name}</AppText>
                <AppText variant="caption" tone="muted">
                  {card.brand ? `${card.brand} · ` : ''}fecha dia{' '}
                  {card.closingDay}, vence dia {card.dueDay}
                </AppText>
              </View>
            </View>

            <View style={{ gap: theme.spacing.xs }}>
              <ProgressBar
                value={card.usage}
                tone="expense"
                label={`Limite usado do cartão ${card.name}`}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <AppText variant="caption" tone="muted" numeric>
                  {formatCents(card.used)} usados
                </AppText>
                <AppText
                  variant="caption"
                  tone={exceeded ? 'expense' : 'muted'}
                  numeric
                >
                  {exceeded
                    ? 'Limite estourado'
                    : `${formatCents(card.available)} disponíveis`}
                </AppText>
              </View>
            </View>

            <AppText variant="caption" tone="subtle">
              Fatura de {invoice.referenceMonth}: fecha em{' '}
              {formatBR(invoice.closingDate)} e vence em{' '}
              {formatBR(invoice.dueDate)}
            </AppText>
          </Card>
        );
      })}

      <Button
        label="Cadastrar cartão"
        fullWidth
        size="lg"
        onPress={() => router.push('/cartoes/novo')}
      />
    </Screen>
  );
}
