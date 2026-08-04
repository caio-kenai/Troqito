import { createContext, useContext, useState, type ReactNode } from 'react';

import { seedDefaultCategories } from '@/features/categories/repository/categoriesRepository';

import {
  ensureLocalProfile,
  type Profile,
} from './repository/profileRepository';

type SessionState =
  { status: 'ready'; profile: Profile } | { status: 'failed'; error: Error };

const SessionContext = createContext<SessionState | null>(null);

function bootstrap(): SessionState {
  try {
    const profile = ensureLocalProfile();
    seedDefaultCategories(profile.id);
    return { status: 'ready', profile };
  } catch (cause) {
    return {
      status: 'failed',
      error: cause instanceof Error ? cause : new Error(String(cause)),
    };
  }
}

/**
 * Prepara os dados mínimos para o aplicativo funcionar: o perfil local e as
 * categorias iniciais. Roda depois das migrations e antes de qualquer tela que
 * dependa de um dono para os registros.
 *
 * O preparo é síncrono — `expo-sqlite` expõe operações bloqueantes — então
 * acontece no inicializador do estado, e não em um efeito. Fazê-lo em efeito
 * causaria uma renderização vazia seguida de outra com os dados.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [state] = useState(bootstrap);

  return (
    <SessionContext.Provider value={state}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionState {
  const state = useContext(SessionContext);
  if (!state) {
    throw new Error('useSession precisa estar dentro de um SessionProvider');
  }
  return state;
}

/** Atalho para telas que só renderizam com a sessão pronta. */
export function useOwnerId(): string {
  const state = useSession();
  if (state.status !== 'ready') {
    throw new Error('useOwnerId chamado antes de a sessão estar pronta');
  }
  return state.profile.id;
}
