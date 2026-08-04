import { screen, userEvent } from '@testing-library/react-native';

import { renderWithTheme } from '@/testing/renderWithTheme';

import HomeScreen from '../index';

jest.mock('@/config/env', () => ({
  env: { stage: 'development' },
  isProduction: false,
  isDevelopment: true,
}));

describe('HomeScreen', () => {
  it('apresenta o nome e a proposta do aplicativo', async () => {
    await renderWithTheme(<HomeScreen />);

    expect(screen.getByText('Troqito')).toBeOnTheScreen();
    expect(
      screen.getByText('Finanças pessoais, familiares e domésticas'),
    ).toBeOnTheScreen();
  });

  it('mostra o estágio fora de produção', async () => {
    await renderWithTheme(<HomeScreen />);

    expect(screen.getByText('Estágio: development')).toBeOnTheScreen();
  });

  it('permite alternar a preferência de tema', async () => {
    const user = userEvent.setup();
    await renderWithTheme(<HomeScreen />, { preference: 'system' });

    expect(screen.getByText('Preferência atual: system')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Escuro' }));

    expect(screen.getByText('Preferência atual: dark')).toBeOnTheScreen();
  });
});
