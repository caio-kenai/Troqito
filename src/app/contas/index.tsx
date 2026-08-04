import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppText, Button, Screen, SkeletonList, StateView } from '@/components';
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
        <AppText variant="title">Contas</AppText>
        <SkeletonList rows={4} />
      </Screen>
    );
  }

  if (accounts.length === 0) {
    return (
      <Screen>
        <AppText variant="title">Contas</AppText>
        <StateView
          variant="empty"
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
      <View style={{ gap: theme.spacing.xxs }}>
        <AppText variant="title">Contas</AppText>
        <AppText variant="label" tone="muted">
          Saldo consolidado
        </AppText>
        <AppText variant="title" tone={total < 0 ? 'expense' : 'default'}>
          {formatCents(total)}
        </AppText>
      </View>

      <View style={{ gap: theme.spacing.md }}>
        {accounts.map((account) => (
          <AccountRow
            key={account.id}
            account={account}
            onPress={() => router.push(`/contas/${account.id}`)}
          />
        ))}
      </View>

      <Button
        label="Cadastrar conta"
        fullWidth
        onPress={() => router.push('/contas/nova')}
      />
    </Screen>
  );
}
