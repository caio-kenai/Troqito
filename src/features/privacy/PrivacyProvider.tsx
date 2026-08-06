import * as LocalAuthentication from 'expo-local-authentication';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { updatePrivacySettings } from './repository/privacyRepository';

export type PrivacyState = {
  /** Esconde os valores na tela, sem alterar os dados. */
  maskValues: boolean;
  toggleMask: () => void;

  /** Exige biometria ou senha do aparelho para abrir o aplicativo. */
  biometricLock: boolean;
  setBiometricLock: (enabled: boolean) => Promise<boolean>;

  /** Verdadeiro enquanto o desbloqueio não aconteceu. */
  locked: boolean;
  unlock: () => Promise<boolean>;

  /** Falso quando o aparelho não tem biometria nem senha cadastrada. */
  canUseBiometrics: boolean;
};

const PrivacyContext = createContext<PrivacyState | null>(null);

export function PrivacyProvider({
  profileId,
  initialMask,
  initialLock,
  children,
}: {
  profileId: string;
  initialMask: boolean;
  initialLock: boolean;
  children: ReactNode;
}) {
  const [maskValues, setMaskValues] = useState(initialMask);
  const [biometricLock, setLockEnabled] = useState(initialLock);
  const [locked, setLocked] = useState(initialLock);
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (active) setCanUseBiometrics(hasHardware && enrolled);
    })();

    return () => {
      active = false;
    };
  }, []);

  // Sair do aplicativo tranca de novo. Sem isso, o bloqueio protegeria apenas a
  // primeira abertura, e quem pegasse o aparelho desbloqueado veria tudo.
  useEffect(() => {
    if (!biometricLock) return;

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background') setLocked(true);
    });

    return () => subscription.remove();
  }, [biometricLock]);

  const unlock = useCallback(async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Desbloquear o Troqito',
      cancelLabel: 'Cancelar',
      // Aceita a senha do aparelho como alternativa: quem molhou o dedo ou usa
      // máscara ficaria trancado fora dos próprios dados.
      disableDeviceFallback: false,
    });

    if (result.success) setLocked(false);
    return result.success;
  }, []);

  const toggleMask = useCallback(() => {
    setMaskValues((current) => {
      const next = !current;
      updatePrivacySettings(profileId, { maskValues: next });
      return next;
    });
  }, [profileId]);

  const setBiometricLock = useCallback(
    async (enabled: boolean) => {
      // Ligar o bloqueio exige provar que a biometria funciona agora. Ligar sem
      // testar poderia trancar a pessoa fora dos próprios dados na abertura
      // seguinte, sem nenhuma forma de voltar atrás.
      if (enabled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Confirme para ativar o bloqueio',
          cancelLabel: 'Cancelar',
          disableDeviceFallback: false,
        });
        if (!result.success) return false;
      }

      setLockEnabled(enabled);
      updatePrivacySettings(profileId, { biometricLock: enabled });
      return true;
    },
    [profileId],
  );

  return (
    <PrivacyContext.Provider
      value={{
        maskValues,
        toggleMask,
        biometricLock,
        setBiometricLock,
        locked,
        unlock,
        canUseBiometrics,
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy(): PrivacyState {
  const state = useContext(PrivacyContext);
  if (!state) {
    throw new Error('usePrivacy precisa estar dentro de um PrivacyProvider');
  }
  return state;
}
