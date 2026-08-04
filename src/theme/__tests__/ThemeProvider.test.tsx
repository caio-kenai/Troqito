import { act, renderHook } from '@testing-library/react-native';
import { useColorScheme, type ColorSchemeName } from 'react-native';

import { ThemeWrapper } from '@/testing/renderWithTheme';

import { ThemeProvider, useTheme, useThemeContext } from '../ThemeProvider';

jest.mock('react-native/Libraries/Utilities/useColorScheme');

const mockedUseColorScheme = jest.mocked(useColorScheme);

function systemWrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider initialPreference="system">{children}</ThemeProvider>;
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    mockedUseColorScheme.mockReturnValue('light');
  });

  // O tipo ColorSchemeName do React Native 0.86 declara apenas 'light' e
  // 'dark', mas em execução o valor pode vir ausente antes de o sistema
  // responder. O caso é real, então é testado com a conversão explícita.
  it.each<[ColorSchemeName | null | undefined, 'light' | 'dark']>([
    ['light', 'light'],
    ['dark', 'dark'],
    [null, 'light'],
    [undefined, 'light'],
  ])(
    'resolve o esquema %s do sistema para o tema %s',
    async (system, expected) => {
      mockedUseColorScheme.mockReturnValue(system as ColorSchemeName);

      const { result } = await renderHook(() => useTheme(), {
        wrapper: systemWrapper,
      });

      expect(result.current.name).toBe(expected);
    },
  );

  it('permite forçar o tema, ignorando o sistema', async () => {
    mockedUseColorScheme.mockReturnValue('light');

    const { result } = await renderHook(() => useThemeContext(), {
      wrapper: ThemeWrapper,
    });

    await act(async () => result.current.setPreference('dark'));

    expect(result.current.theme.name).toBe('dark');
    expect(result.current.preference).toBe('dark');
  });

  it('falha de forma explícita fora do provedor', async () => {
    await expect(renderHook(() => useTheme())).rejects.toThrow(/ThemeProvider/);
  });
});
