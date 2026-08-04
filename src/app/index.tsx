import { View } from 'react-native';

import { AppText, Button, Card, Screen } from '@/components';
import { env, isProduction } from '@/config/env';
import { useTheme, useThemeContext } from '@/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const { preference, setPreference } = useThemeContext();

  return (
    <Screen scroll>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="display">Troqito</AppText>
        <AppText variant="body" tone="muted">
          Finanças pessoais, familiares e domésticas
        </AppText>
      </View>

      <Card>
        <AppText variant="heading">Cores de valor</AppText>
        <AppText variant="body" tone="muted">
          Receita e despesa nunca dependem só da cor: o sinal e o rótulo também
          diferenciam.
        </AppText>
        <View style={{ flexDirection: 'row', gap: theme.spacing.xl }}>
          <View>
            <AppText variant="label" tone="muted">
              Receita
            </AppText>
            <AppText variant="heading" tone="income">
              + R$ 4.200,00
            </AppText>
          </View>
          <View>
            <AppText variant="label" tone="muted">
              Despesa
            </AppText>
            <AppText variant="heading" tone="expense">
              − R$ 1.870,45
            </AppText>
          </View>
        </View>
      </Card>

      <Card>
        <AppText variant="heading">Tema</AppText>
        <AppText variant="body" tone="muted">
          Preferência atual: {preference}
        </AppText>
        <View
          style={{
            flexDirection: 'row',
            gap: theme.spacing.sm,
            flexWrap: 'wrap',
          }}
        >
          <Button
            label="Sistema"
            variant={preference === 'system' ? 'primary' : 'ghost'}
            onPress={() => setPreference('system')}
          />
          <Button
            label="Claro"
            variant={preference === 'light' ? 'primary' : 'ghost'}
            onPress={() => setPreference('light')}
          />
          <Button
            label="Escuro"
            variant={preference === 'dark' ? 'primary' : 'ghost'}
            onPress={() => setPreference('dark')}
          />
        </View>
      </Card>

      {!isProduction && (
        <AppText variant="caption" tone="subtle">
          Estágio: {env.stage}
        </AppText>
      )}
    </Screen>
  );
}
