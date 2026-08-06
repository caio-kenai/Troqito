import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppText, Button, Card, Screen, TAB_SCREEN_EDGES } from '@/components';
import { env, isProduction } from '@/config/env';
import { type ThemePreference, useTheme, useThemeContext } from '@/theme';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { preference, setPreference } = useThemeContext();

  return (
    <Screen scroll edges={TAB_SCREEN_EDGES}>
      <AppText variant="title">Perfil</AppText>

      <Card>
        <AppText variant="heading">Aparência</AppText>
        <AppText variant="body" tone="muted">
          Escolha o tema ou deixe que o Troqito acompanhe o aparelho.
        </AppText>
        <View
          style={{
            flexDirection: 'row',
            gap: theme.spacing.sm,
            flexWrap: 'wrap',
          }}
        >
          {THEME_OPTIONS.map((option) => (
            <Button
              key={option.value}
              label={option.label}
              variant={preference === option.value ? 'primary' : 'ghost'}
              onPress={() => setPreference(option.value)}
            />
          ))}
        </View>
      </Card>

      <Card>
        <AppText variant="heading">Contas e carteiras</AppText>
        <AppText variant="body" tone="muted">
          Cadastre onde seu dinheiro está e acompanhe o saldo de cada lugar.
        </AppText>
        <Button
          label="Gerenciar contas"
          variant="secondary"
          onPress={() => router.push('/contas')}
        />
      </Card>

      <Card>
        <AppText variant="heading">Conta do Troqito</AppText>
        <AppText variant="body" tone="muted">
          Dados pessoais, moeda, ciclo financeiro, notificações e bloqueio por
          biometria ficam aqui quando a autenticação entrar.
        </AppText>
      </Card>

      {!isProduction && (
        <AppText variant="caption" tone="subtle">
          Estágio: {env.stage}
        </AppText>
      )}
    </Screen>
  );
}
