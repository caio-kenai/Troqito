import { useRouter } from 'expo-router';
import { View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  Screen,
  ScreenHeader,
  SkeletonList,
  StateView,
} from '@/components';
import { AccountRow } from '@/features/accounts/components/AccountRow';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useOwnerId } from '@/features/profile/SessionProvider';
import { formatCents } from '@/lib/money';
import { useTheme } from '@/theme';

export default function AccountsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const ownerId = useOwnerId();
  const { accounts, total, isLoading } = useAccounts(ownerId);

  if (isLoading) {
    return (
      <Screen>
        <ScreenHeader title="Contas" back />
        <SkeletonList rows={4} />
      </Screen>
    );
  }

  if (accounts.length === 0) {
    return (
      <Screen>
        <ScreenHeader title="Contas" back />
        <StateView
          variant="empty"
          icon="wallet-outline"
          title="Nenhuma conta cadastrada"
          description="Cadastre onde seu dinheiro está: conta-corrente, dinheiro, carteira digital ou vale. O saldo é calculado a partir dos lançamentos."
          actionLabel="Cadastrar conta"
          onAction={() => router.push('/contas/nova')}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <ScreenHeader
        title="Contas"
        back
        action={{
          icon: 'add',
          label: 'Cadastrar conta',
          onPress: () => router.push('/contas/nova'),
        }}
      />

      <Card variant="gradient" gradient="brand">
        <AppText variant="overline" tone="onGradient" style={{ opacity: 0.85 }}>
          Saldo consolidado
        </AppText>
        <AppText variant="display" tone="onGradient" numeric>
          {formatCents(total)}
        </AppText>
        <AppText variant="caption" tone="onGradient" style={{ opacity: 0.85 }}>
          {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}
        </AppText>
      </Card>

      <Card variant="elevated">
        <View style={{ gap: theme.spacing.xs }}>
          {accounts.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              onPress={() => router.push(`/contas/${account.id}`)}
            />
          ))}
        </View>
      </Card>

      <Button
        label="Cadastrar conta"
        fullWidth
        size="lg"
        onPress={() => router.push('/contas/nova')}
      />
    </Screen>
  );
}
