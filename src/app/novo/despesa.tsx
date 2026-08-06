import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { AppText, Screen, StateView } from '@/components';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useOwnerId } from '@/features/profile/SessionProvider';
import { EntryForm } from '@/features/transactions/components/EntryForm';
import { createEntry } from '@/features/transactions/repository/transactionsRepository';

export default function NewExpenseScreen() {
  const router = useRouter();
  const ownerId = useOwnerId();
  const { accounts } = useAccounts(ownerId);

  // Sem conta cadastrada não há de onde o dinheiro sair, então o formulário
  // daria erro na gravação. Melhor levar direto ao cadastro da conta.
  if (accounts.filter((account) => account.archivedAt === null).length === 0) {
    return (
      <Screen>
        <StateView
          variant="empty"
          title="Cadastre uma conta primeiro"
          description="Toda despesa sai de algum lugar: conta-corrente, dinheiro, carteira digital ou vale."
          actionLabel="Cadastrar conta"
          onAction={() => router.replace('/contas/nova')}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <AppText variant="title">Nova despesa</AppText>

      <EntryForm
        ownerId={ownerId}
        kind="expense"
        submitLabel="Salvar despesa"
        onSubmit={(values) => {
          try {
            createEntry(ownerId, 'expense', values);
            router.dismissAll();
          } catch {
            Alert.alert(
              'Não foi possível salvar',
              'A despesa não pôde ser gravada no aparelho. Tente novamente.',
            );
          }
        }}
      />
    </Screen>
  );
}
