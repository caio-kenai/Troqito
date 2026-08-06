import { Alert, Pressable, View } from 'react-native';

import { AppText, Card, IconChip, Screen, ScreenHeader } from '@/components';
import { usePrivacy } from '@/features/privacy/PrivacyProvider';
import { maybeMask } from '@/features/privacy/domain/mask';
import { cents, formatCents } from '@/lib/money';
import { useTheme } from '@/theme';

/** Interruptor com rótulo, área de toque cheia e estado lido por leitor de tela. */
function Toggle({
  icon,
  title,
  description,
  value,
  onToggle,
  disabled = false,
}: {
  icon: React.ComponentProps<typeof IconChip>['icon'];
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={title}
      accessibilityHint={description}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: theme.minTouchTarget,
        opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
      })}
    >
      <IconChip icon={icon} tone={value ? 'primary' : 'muted'} />

      <View style={{ flex: 1, gap: theme.spacing.xxs }}>
        <AppText variant="body" weight="semibold">
          {title}
        </AppText>
        <AppText variant="caption" tone="muted">
          {description}
        </AppText>
      </View>

      <View
        style={{
          width: 52,
          height: 30,
          borderRadius: theme.radius.full,
          padding: 3,
          justifyContent: 'center',
          alignItems: value ? 'flex-end' : 'flex-start',
          backgroundColor: value
            ? theme.colors.primary
            : theme.colors.surfaceMuted,
          borderWidth: 1,
          borderColor: value ? theme.colors.primary : theme.colors.border,
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: theme.radius.full,
            backgroundColor: value
              ? theme.colors.textOnPrimary
              : theme.colors.textSubtle,
          }}
        />
      </View>
    </Pressable>
  );
}

export default function PrivacyScreen() {
  const theme = useTheme();
  const {
    maskValues,
    toggleMask,
    biometricLock,
    setBiometricLock,
    canUseBiometrics,
  } = usePrivacy();

  const sample = formatCents(cents(1_234_56));

  const changeLock = async (next: boolean) => {
    const ok = await setBiometricLock(next);

    if (!ok) {
      Alert.alert(
        'Bloqueio não ativado',
        'A confirmação falhou, então o bloqueio continua desligado. Melhor assim do que trancar você fora dos próprios dados.',
      );
    }
  };

  return (
    <Screen scroll>
      <ScreenHeader title="Bloqueio e privacidade" back />

      <Card variant="elevated">
        <AppText variant="overline" tone="subtle">
          Na tela
        </AppText>

        <Toggle
          icon={maskValues ? 'eye-off-outline' : 'eye-outline'}
          title="Esconder valores"
          description="Troca os números por marcadores, para conferir o aplicativo em lugar público"
          value={maskValues}
          onToggle={toggleMask}
        />

        <View
          style={{
            padding: theme.spacing.lg,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surfaceMuted,
            gap: theme.spacing.xxs,
          }}
        >
          <AppText variant="caption" tone="muted">
            Como fica
          </AppText>
          <AppText variant="heading" numeric>
            {maybeMask(sample, maskValues)}
          </AppText>
        </View>
      </Card>

      <Card variant="elevated">
        <AppText variant="overline" tone="subtle">
          Ao abrir
        </AppText>

        <Toggle
          icon="finger-print-outline"
          title="Pedir biometria"
          description={
            canUseBiometrics
              ? 'Exige digital, rosto ou a senha do aparelho para abrir o Troqito'
              : 'Este aparelho não tem biometria nem senha cadastrada'
          }
          value={biometricLock}
          onToggle={() => void changeLock(!biometricLock)}
          disabled={!canUseBiometrics}
        />
      </Card>

      <AppText variant="caption" tone="subtle">
        O Troqito não guarda sua digital nem sua senha. Quem confere é o próprio
        sistema do aparelho, que devolve apenas se reconheceu ou não. Seus dados
        continuam somente aqui, sem conta e sem servidor.
      </AppText>
    </Screen>
  );
}
