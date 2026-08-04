import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { AppText, Button, Screen, StateView } from '@/components';
import {
  AccountForm,
  ACCOUNT_COLORS,
} from '@/features/accounts/components/AccountForm';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import {
  deleteAccount,
  setAccountArchived,
  updateAccount,
} from '@/features/accounts/repository/accountsRepository';
import { useOwnerId } from '@/features/profile/SessionProvider';
import { formatCents } from '@/lib/money';

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const ownerId = useOwnerId();
  const { accounts } = useAccounts(ownerId);

  const account = accounts.find((item) => item.id === id);

  if (!account) {
    return (
      <Screen>
        <StateView
          variant="error"
          title="Conta não encontrada"
          description="Ela pode ter sido excluída em outro aparelho."
          actionLabel="Voltar"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const archived = account.archivedAt !== null;

  const confirmDelete = () => {
    Alert.alert(
      'Excluir a conta?',
      'Os lançamentos ligados a ela deixam de ter conta associada. ' +
        'Se você só quer tirá-la da lista, prefira arquivar.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteAccount(account.id);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <Screen scroll>
      <AppText variant="title">{account.name}</AppText>
      <AppText variant="body" tone="muted">
        Saldo atual: {formatCents(account.balance)}
      </AppText>

      <AccountForm
        submitLabel="Salvar alterações"
        defaultValues={{
          name: account.name,
          type: account.type as never,
          institution: account.institution ?? '',
          color: account.color ?? ACCOUNT_COLORS[0],
          initialBalance: String(account.initialBalance / 100).replace(
            '.',
            ',',
          ),
          includeInTotal: account.includeInTotal,
        }}
        onSubmit={(values) => {
          try {
            updateAccount(account.id, values);
            router.back();
          } catch {
            Alert.alert(
              'Não foi possível salvar',
              'As alterações não puderam ser gravadas. Tente novamente.',
            );
          }
        }}
      />

      <Button
        label={archived ? 'Reativar conta' : 'Arquivar conta'}
        variant="secondary"
        fullWidth
        onPress={() => setAccountArchived(account.id, !archived)}
      />

      <Button
        label="Excluir conta"
        variant="ghost"
        fullWidth
        onPress={confirmDelete}
      />
    </Screen>
  );
}
