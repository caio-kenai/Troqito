import { View } from 'react-native';

import { AppText, Card, Screen } from '@/components';
import { cents, formatCents } from '@/lib/money';
import { useTheme } from '@/theme';

export default function HomeScreen() {
  const theme = useTheme();

  // Ainda sem dados: o resumo real chega com o dashboard, depois que houver
  // contas e lançamentos para somar.
  const balance = cents(0);

  return (
    <Screen scroll>
      <View style={{ gap: theme.spacing.xxs }}>
        <AppText variant="label" tone="muted">
          Saldo total
        </AppText>
        <AppText variant="display">{formatCents(balance)}</AppText>
      </View>

      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <Card style={{ flex: 1 }}>
          <AppText variant="label" tone="muted">
            Receitas do mês
          </AppText>
          <AppText variant="heading" tone="income">
            {formatCents(cents(0), { showPositiveSign: true })}
          </AppText>
        </Card>
        <Card style={{ flex: 1 }}>
          <AppText variant="label" tone="muted">
            Despesas do mês
          </AppText>
          <AppText variant="heading" tone="expense">
            {formatCents(cents(0))}
          </AppText>
        </Card>
      </View>

      <Card>
        <AppText variant="heading">Comece por aqui</AppText>
        <AppText variant="body" tone="muted">
          Cadastre uma conta e registre seu primeiro lançamento pelo botão
          central. O Troqito funciona sem conexão: tudo fica no aparelho.
        </AppText>
      </Card>
    </Screen>
  );
}
