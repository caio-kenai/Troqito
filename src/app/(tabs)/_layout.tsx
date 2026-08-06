import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

/**
 * A aba central não abre uma tela: ela dispara a ação de adicionar, que é o que
 * a pessoa mais faz no aplicativo. Fica no meio porque é a posição mais fácil
 * de alcançar com o polegar.
 */
function AddButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Adicionar lançamento"
      style={({ pressed }) => ({
        top: -20,
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
        borderRadius: theme.radius.full,
        backgroundColor: pressed
          ? theme.colors.primaryPressed
          : theme.colors.primary,
        borderWidth: 5,
        borderColor: theme.colors.background,
        shadowColor: theme.colors.shadow,
        ...theme.elevation.md,
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}
    >
      <Ionicons name="add" size={32} color={theme.colors.textOnPrimary} />
    </Pressable>
  );
}

/**
 * Ícone da aba.
 *
 * O item ativo troca o contorno pelo preenchido e ganha uma pílula atrás. A
 * mudança de forma, e não só de cor, é o que permite reconhecer onde se está
 * sem depender de enxergar a diferença entre dois tons.
 */
function TabIcon({
  name,
  focused,
  color,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: ColorValue;
}) {
  const theme = useTheme();
  const filled = name.replace('-outline', '') as keyof typeof Ionicons.glyphMap;

  return (
    <View
      style={{
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.full,
        backgroundColor: focused ? theme.colors.primarySurface : 'transparent',
      }}
    >
      <Ionicons name={focused ? filled : name} size={22} color={color} />
    </View>
  );
}

/** Altura da barra sem contar o que o sistema reserva para si. */
const TAB_BAR_HEIGHT = 64;

export default function TabsLayout() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSubtle,
        // A barra do sistema — botões ou faixa de gestos — fica por cima do
        // aplicativo. Sem somar o espaço que ela ocupa, os rótulos das abas
        // ficam escondidos atrás dela. Em paisagem a reserva pode vir nas
        // laterais, quando a barra do aparelho gira junto.
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        tabBarLabelStyle: {
          fontSize: theme.fontSize.xs,
          fontWeight: theme.fontWeight.semibold,
        },
        tabBarItemStyle: { gap: 0 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="movimentacoes"
        options={{
          title: 'Extrato',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="receipt-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="adicionar"
        options={{
          title: '',
          tabBarButton: () => (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <AddButton onPress={() => router.push('/novo')} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="planejamento"
        options={{
          title: 'Planos',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="flag-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person-outline" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
