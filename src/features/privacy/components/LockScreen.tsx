import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, IconChip, Screen } from '@/components';
import { useTheme } from '@/theme';

import { usePrivacy } from '../PrivacyProvider';

/**
 * Tela de bloqueio.
 *
 * Não mostra nada além do nome do aplicativo: um resumo de saldo aqui
 * derrotaria o próprio bloqueio, já que apareceria antes do desbloqueio.
 */
export function LockScreen() {
  const theme = useTheme();
  const { unlock } = usePrivacy();
  const [failed, setFailed] = useState(false);

  // `unlock` vem memoizado do provedor, então esta função é estável e o efeito
  // abaixo não dispara de novo a cada renderização.
  const attempt = useCallback(async () => {
    const ok = await unlock();
    setFailed(!ok);
  }, [unlock]);

  // A primeira tentativa acontece sozinha, para quem abre o aplicativo não
  // precisar de um toque a mais só para ver a leitura da digital.
  //
  // Ela não registra falha: um aviso de erro antes de a pessoa ter feito
  // qualquer coisa acusaria algo que ela não fez. A mensagem só aparece depois
  // de uma tentativa manual que não deu certo.
  useEffect(() => {
    void unlock();
  }, [unlock]);

  return (
    <Screen>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.lg,
        }}
      >
        <IconChip icon="lock-closed-outline" tone="primary" size="lg" />

        <AppText variant="title">Troqito bloqueado</AppText>

        <AppText
          variant="body"
          tone="muted"
          style={{ textAlign: 'center', maxWidth: 320 }}
        >
          {failed
            ? 'Não foi possível confirmar sua identidade. Tente de novo para abrir seus dados.'
            : 'Confirme sua identidade para abrir seus dados.'}
        </AppText>

        <Button label="Desbloquear" size="lg" onPress={() => void attempt()} />
      </View>
    </Screen>
  );
}
