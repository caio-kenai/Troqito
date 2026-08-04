import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import { darkTheme, lightTheme, type Theme } from './themes';

/** `system` acompanha a preferência do aparelho; os demais forçam o modo. */
export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  initialPreference = 'system',
}: {
  children: ReactNode;
  initialPreference?: ThemePreference;
}) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] =
    useState<ThemePreference>(initialPreference);

  const value = useMemo<ThemeContextValue>(() => {
    const resolved =
      preference === 'system' ? (systemScheme ?? 'light') : preference;

    return {
      theme: resolved === 'dark' ? darkTheme : lightTheme,
      preference,
      setPreference,
    };
  }, [preference, systemScheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useThemeContext().theme;
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme precisa estar dentro de um ThemeProvider');
  }
  return context;
}
