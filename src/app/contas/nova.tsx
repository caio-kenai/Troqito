import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { AppText, Screen } from '@/components';
import { AccountForm } from '@/features/accounts/components/AccountForm';
import { createAccount } from '@/features/accounts/repository/accountsRepository';
import { useOwnerId } from '@/features/profile/SessionProvider';

export default function NewAccountScreen() {
  const router = useRouter();
  const ownerId = useOwnerId();

  return (
    <Screen scroll>
      <AppText variant="title">Nova conta</AppText>

      <AccountForm
        submitLabel="Salvar conta"
        onSubmit={(values) => {
          try {
            createAccount(ownerId, values);
            router.back();
          } catch {
            Alert.alert(
              'Não foi possível salvar',
              'A conta não pôde ser gravada no aparelho. Tente novamente.',
            );
          }
        }}
      />
    </Screen>
  );
}
