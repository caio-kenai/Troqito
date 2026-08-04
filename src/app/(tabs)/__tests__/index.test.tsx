import { screen } from '@testing-library/react-native';

import { renderWithTheme } from '@/testing/renderWithTheme';

import HomeScreen from '../index';

describe('HomeScreen', () => {
  it('apresenta o resumo financeiro do período', async () => {
    await renderWithTheme(<HomeScreen />);

    expect(screen.getByText('Saldo total')).toBeOnTheScreen();
    expect(screen.getByText('Receitas do mês')).toBeOnTheScreen();
    expect(screen.getByText('Despesas do mês')).toBeOnTheScreen();
  });

  it('formata os valores em reais', async () => {
    await renderWithTheme(<HomeScreen />);

    // Saldo total e despesas do mês compartilham a mesma formatação.
    expect(screen.getAllByText('R$ 0,00')).toHaveLength(2);
    // A receita leva sinal positivo explícito, para não depender só da cor.
    expect(screen.getByText('+R$ 0,00')).toBeOnTheScreen();
  });

  it('orienta quem ainda não tem dados', async () => {
    await renderWithTheme(<HomeScreen />);

    expect(screen.getByText('Comece por aqui')).toBeOnTheScreen();
  });
});
