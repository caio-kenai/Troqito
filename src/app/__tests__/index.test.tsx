import { render, screen } from '@testing-library/react-native';

import HomeScreen from '../index';

jest.mock('@/config/env', () => ({
  env: { stage: 'development' },
  isProduction: false,
  isDevelopment: true,
}));

describe('HomeScreen', () => {
  it('apresenta o nome e a proposta do aplicativo', async () => {
    await render(<HomeScreen />);

    expect(screen.getByText('Troqito')).toBeOnTheScreen();
    expect(
      screen.getByText('Finanças pessoais, familiares e domésticas'),
    ).toBeOnTheScreen();
  });

  it('mostra o estágio fora de produção', async () => {
    await render(<HomeScreen />);

    expect(screen.getByText('Estágio: development')).toBeOnTheScreen();
  });
});
