import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppText, Screen, SkeletonList, StateView } from '@/components';
import { useDatabaseMigrations } from '@/database/useDatabaseMigrations';
import {
  SessionProvider,
  useSession,
} from '@/features/profile/SessionProvider';
import { ThemeProvider, useTheme } from '@/theme';

function RootNavigator() {
  const theme = useTheme();
  const migrations = useDatabaseMigrations();

  // Nenhuma tela pode consultar o banco antes das migrations terminarem: o
  // schema ainda não é o que o código espera.
  if (migrations.status === 'running') {
    return (
      <Screen>
        <AppText variant="title">Troqito</AppText>
        <AppText variant="body" tone="muted">
          Preparando seus dados…
        </AppText>
        <View style={{ marginTop: theme.spacing.lg }}>
          <SkeletonList rows={4} />
        </View>
      </Screen>
    );
  }

  if (migrations.status === 'failed') {
    return (
      <Screen>
        <StateView
          variant="error"
          title="Não foi possível preparar o banco de dados"
          description={
            'O aplicativo não consegue abrir sem concluir esta etapa. ' +
            'Reinicie o Troqito; se o erro continuar, reinstale o aplicativo.'
          }
        />
      </Screen>
    );
  }

  return (
    <SessionProvider>
      <StatusBar style={theme.name === 'dark' ? 'light' : 'dark'} />
      <SessionGate>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="novo/index" options={{ presentation: 'modal' }} />
          <Stack.Screen
            name="novo/despesa"
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="novo/receita"
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="novo/transferencia"
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="contas/index" />
          <Stack.Screen name="contas/nova" />
          <Stack.Screen name="contas/[id]" />
          <Stack.Screen name="casa/index" />
          <Stack.Screen name="casa/nova" />
          <Stack.Screen name="casa/membro" />
        </Stack>
      </SessionGate>
    </SessionProvider>
  );
}

/** Segura a navegação até o perfil local e as categorias iniciais existirem. */
function SessionGate({ children }: { children: React.ReactNode }) {
  const session = useSession();

  if (session.status === 'failed') {
    return (
      <Screen>
        <StateView
          variant="error"
          title="Não foi possível preparar seus dados"
          description="Reinicie o Troqito; se o erro continuar, reinstale o aplicativo."
        />
      </Screen>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
