import { render } from '@testing-library/react-native';
import { type ReactElement, type ReactNode } from 'react';

import { ThemeProvider, type ThemePreference } from '@/theme';

/**
 * Renderiza com o tema aplicado. Existe porque praticamente todo componente do
 * design system depende do ThemeProvider, e repetir a montagem em cada teste
 * esconderia o que o teste realmente verifica.
 */
export function renderWithTheme(
  ui: ReactElement,
  { preference = 'light' }: { preference?: ThemePreference } = {},
) {
  return render(
    <ThemeProvider initialPreference={preference}>{ui}</ThemeProvider>,
  );
}

export function ThemeWrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider initialPreference="light">{children}</ThemeProvider>;
}
