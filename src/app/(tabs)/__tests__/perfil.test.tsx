import { screen, userEvent } from '@testing-library/react-native';

import { renderWithTheme } from '@/testing/renderWithTheme';

import ProfileScreen from '../perfil';

jest.mock('@/config/env', () => ({
  env: { stage: 'development' },
  isProduction: false,
  isDevelopment: true,
}));

// A tela só lê o nome do perfil; o banco não precisa existir para isso. A
// fábrica é carregada dentro da função porque o Jest iça as chamadas de
// `jest.mock` acima dos imports do arquivo.
jest.mock('@/features/profile/SessionProvider', () => ({
  useSession: () => {
    const { makeProfile } = jest.requireActual<
      typeof import('@/testing/factories')
    >('@/testing/factories');

    return { status: 'ready', profile: makeProfile({ name: 'Caio' }) };
  },
}));

describe('ProfileScreen', () => {
  it('mostra o estágio fora de produção', async () => {
    await renderWithTheme(<ProfileScreen />);

    expect(screen.getByText('Estágio: development')).toBeOnTheScreen();
  });

  it('permite escolher a preferência de tema', async () => {
    const user = userEvent.setup();
    await renderWithTheme(<ProfileScreen />, { preference: 'system' });

    await user.press(screen.getByRole('button', { name: 'Escuro' }));

    // A opção escolhida passa a ser a única em destaque.
    expect(screen.getByRole('button', { name: 'Escuro' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Sistema' })).toBeOnTheScreen();
  });
});
