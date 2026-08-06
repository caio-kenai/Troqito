import { type ReactNode } from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

export type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: readonly Edge[];
  contentStyle?: ViewStyle;
};

/**
 * Bordas para telas que ficam dentro da navegação por abas.
 *
 * A barra de abas já reserva o espaço da barra do sistema embaixo; repetir a
 * reserva aqui deixaria um vão morto no rodapé de todas elas.
 */
export const TAB_SCREEN_EDGES: readonly Edge[] = ['top', 'left', 'right'];

/**
 * Largura máxima do conteúdo.
 *
 * Com o aparelho deitado a tela fica larga demais para uma coluna só: a linha
 * de texto passa do confortável para ler e os cartões esticam sem ganhar nada.
 * O conteúdo para de crescer e fica centralizado.
 */
const MAX_CONTENT_WIDTH = 640;

/**
 * O padrão reserva os quatro lados. Uma tela que esqueça de ajustar isso ganha
 * espaço sobrando, e não conteúdo escondido atrás dos botões do aparelho.
 */
export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['top', 'left', 'right', 'bottom'],
  contentStyle,
}: ScreenProps) {
  const theme = useTheme();

  const content: ViewStyle = {
    padding: padded ? theme.spacing.lg : 0,
    gap: theme.spacing.lg,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  };

  return (
    <SafeAreaView
      edges={edges}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={[content, contentStyle]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, content, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}
