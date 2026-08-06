import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { Screen, ScreenHeader, StateView } from '@/components';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useOwnerId } from '@/features/profile/SessionProvider';
import { EntryForm } from '@/features/transactions/components/EntryForm';
import { createEntry } from '@/features/transactions/repository/transactionsRepository';

export default function NewIncomeScreen() {
  const router = useRouter();
  const ownerId = useOwnerId();
  const { accounts } = useAccounts(ownerId);

  if (accounts.filter((account) => account.archivedAt === null).length === 0) {
    return (
      <Screen>
        <ScreenHeader title="Nova receita" back />
        <StateView
          variant="empty"
          icon="wallet-outline"
          title="Cadastre uma conta primeiro"
          description="Toda receita entra em algum lugar: conta-corrente, dinheiro, carteira digital ou vale."
          actionLabel="Cadastrar conta"
          onAction={() => router.replace('/contas/nova')}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Nova receita" back />

      <EntryForm
        ownerId={ownerId}
        kind="income"
        submitLabel="Salvar receita"
        onSubmit={(values) => {
          try {
            createEntry(ownerId, 'income', values);
            router.dismissAll();
          } catch {
            Alert.alert(
              'Não foi possível salvar',
              'A receita não pôde ser gravada no aparelho. Tente novamente.',
            );
          }
        }}
      />
    </Screen>
  );
}
