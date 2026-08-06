import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  IconChip,
  Screen,
  ScreenHeader,
  TAB_SCREEN_EDGES,
} from '@/components';
import { env, isProduction } from '@/config/env';
import { useSession } from '@/features/profile/SessionProvider';
import { type ThemePreference, useTheme, useThemeContext } from '@/theme';

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: 'phone-portrait-outline' | 'sunny-outline' | 'moon-outline';
}[] = [
  { value: 'system', label: 'Sistema', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Claro', icon: 'sunny-outline' },
  { value: 'dark', label: 'Escuro', icon: 'moon-outline' },
];

/** Item de menu: ícone, texto e a seta que indica que abre outra tela. */
function MenuRow({
  icon,
  tone,
  title,
  description,
  onPress,
}: {
  icon: React.ComponentProps<typeof IconChip>['icon'];
  tone: React.ComponentProps<typeof IconChip>['tone'];
  title: string;
  description: string;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const disabled = onPress === undefined;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: theme.minTouchTarget,
        opacity: disabled ? 0.55 : pressed ? 0.7 : 1,
      })}
    >
      <IconChip icon={icon} tone={tone} />
      <View style={{ flex: 1, gap: theme.spacing.xxs }}>
        <AppText variant="body" weight="semibold">
          {title}
        </AppText>
        <AppText variant="caption" tone="muted">
          {description}
        </AppText>
      </View>
      {!disabled && (
        <AppText variant="body" tone="subtle">
          ›
        </AppText>
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const session = useSession();
  const { preference, setPreference } = useThemeContext();

  const profile = session.status === 'ready' ? session.profile : null;

  return (
    <Screen scroll edges={TAB_SCREEN_EDGES}>
      <ScreenHeader title="Perfil" />

      <Card variant="elevated">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.lg,
          }}
        >
          <IconChip icon="person-outline" tone="primary" size="lg" />
          <View style={{ flex: 1, gap: theme.spacing.xxs }}>
            <AppText variant="heading">{profile?.name ?? 'Você'}</AppText>
            <AppText variant="caption" tone="muted">
              Os dados ficam neste aparelho, sem conta e sem conexão.
            </AppText>
          </View>
        </View>
      </Card>

      <Card variant="elevated">
        <AppText variant="heading">Aparência</AppText>
        <AppText variant="body" tone="muted">
          Escolha o tema ou deixe que o Troqito acompanhe o aparelho.
        </AppText>
        <View
          style={{
            flexDirection: 'row',
            gap: theme.spacing.sm,
            flexWrap: 'wrap',
            marginTop: theme.spacing.xs,
          }}
        >
          {THEME_OPTIONS.map((option) => (
            <Button
              key={option.value}
              label={option.label}
              variant={preference === option.value ? 'primary' : 'ghost'}
              onPress={() => setPreference(option.value)}
            />
          ))}
        </View>
      </Card>

      <Card
        variant="elevated"
        padded={false}
        style={{ padding: theme.spacing.lg }}
      >
        <AppText variant="overline" tone="subtle">
          Gerenciar
        </AppText>

        <MenuRow
          icon="wallet-outline"
          tone="primary"
          title="Contas e carteiras"
          description="Onde seu dinheiro está e o saldo de cada lugar"
          onPress={() => router.push('/contas')}
        />

        <MenuRow
          icon="card-outline"
          tone="info"
          title="Cartões de crédito"
          description="Limite usado e em qual fatura cada compra cai"
          onPress={() => router.push('/cartoes')}
        />

        <MenuRow
          icon="pricetags-outline"
          tone="info"
          title="Categorias"
          description="Personalizar as categorias de receita e despesa"
        />

        <MenuRow
          icon="home-outline"
          tone="warning"
          title="Casa e pessoas"
          description="Dividir despesas com quem mora com você"
          onPress={() => router.push('/casa')}
        />
      </Card>

      <Card
        variant="elevated"
        padded={false}
        style={{ padding: theme.spacing.lg }}
      >
        <AppText variant="overline" tone="subtle">
          Segurança e dados
        </AppText>

        <MenuRow
          icon="lock-closed-outline"
          tone="muted"
          title="Bloqueio e privacidade"
          description="Biometria e mascaramento de valores na tela"
        />

        <MenuRow
          icon="download-outline"
          tone="muted"
          title="Exportar meus dados"
          description="Levar tudo embora em um arquivo, quando quiser"
          onPress={() => router.push('/dados/exportar')}
        />
      </Card>

      {!isProduction && (
        <AppText variant="caption" tone="subtle">
          Estágio: {env.stage}
        </AppText>
      )}
    </Screen>
  );
}
