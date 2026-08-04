import { render, screen, userEvent } from '@testing-library/react-native';

import { renderWithTheme } from '@/testing/renderWithTheme';

import { Button } from '../Button';

describe('Button', () => {
  it('dispara a ação ao ser pressionado', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await renderWithTheme(<Button label="Salvar" onPress={onPress} />);

    await user.press(screen.getByRole('button', { name: 'Salvar' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('não dispara a ação quando desabilitado', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await renderWithTheme(<Button label="Salvar" onPress={onPress} disabled />);

    await user.press(screen.getByRole('button', { name: 'Salvar' }));

    expect(onPress).not.toHaveBeenCalled();
  });

  // Sem isso, tocar duas vezes durante o envio criaria dois lançamentos.
  it('bloqueia novos toques enquanto carrega', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await renderWithTheme(<Button label="Salvar" onPress={onPress} loading />);

    await user.press(screen.getByRole('button', { name: 'Salvar' }));

    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  it('anuncia o estado ocupado para a acessibilidade', async () => {
    await renderWithTheme(<Button label="Salvar" loading />);

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeBusy();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  it('exige um ThemeProvider em volta', async () => {
    await expect(render(<Button label="Salvar" />)).rejects.toThrow(
      /ThemeProvider/,
    );
  });
});
