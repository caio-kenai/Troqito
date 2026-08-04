import { View } from 'react-native';

import { AppText, Button, Card, Screen } from '@/components';
import { env, isProduction } from '@/config/env';
import { type ThemePreference, useTheme, useThemeContext } from '@/theme';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const { preference, setPreference } = useThemeContext();

  return (
    <Screen scroll>
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
        <AppText variant="heading">Conta</AppText>
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
