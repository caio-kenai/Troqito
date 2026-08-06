import { useState } from 'react';
import { Alert, View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  IconChip,
  Screen,
  ScreenHeader,
} from '@/components';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import {
  buildBackup,
  exportFileName,
  transactionsToCsv,
} from '@/features/export/domain/exportData';
import {
  CSV_MIME,
  JSON_MIME,
  shareTextFile,
} from '@/features/export/service/exportService';
import { useOwnerId } from '@/features/profile/SessionProvider';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import { cents } from '@/lib/money';
import { useTheme } from '@/theme';

export default function ExportScreen() {
  const theme = useTheme();
  const ownerId = useOwnerId();

  const { transactions } = useTransactions(ownerId);
  const { byId: categoriesById } = useCategories(ownerId);
  const { accounts } = useAccounts(ownerId);

  const [busy, setBusy] = useState<'csv' | 'json' | null>(null);

  const accountsById = new Map(
    accounts.map((account) => [account.id, account.name]),
  );

  const run = async (format: 'csv' | 'json') => {
    if (transactions.length === 0) {
      Alert.alert(
        'Nada para exportar',
        'Registre ao menos um lançamento antes de exportar.',
      );
      return;
    }

    setBusy(format);

    try {
      if (format === 'csv') {
        const content = transactionsToCsv(
          transactions.map((item) => ({
            id: item.id,
            date: item.date,
            kind: item.kind,
            status: item.status,
            title: item.title,
            amount: cents(item.amount),
            categoryName: item.categoryId
              ? (categoriesById.get(item.categoryId)?.name ?? null)
              : null,
            accountName: item.accountId
              ? (accountsById.get(item.accountId) ?? null)
              : null,
            notes: item.notes,
          })),
        );

        await shareTextFile(
          exportFileName('troqito-lancamentos', 'csv'),
          content,
          CSV_MIME,
        );
      } else {
        const content = buildBackup({
          transactions,
          accounts,
          categories: [...categoriesById.values()],
          households: [],
          budgets: [],
          goals: [],
        });

        await shareTextFile(
          exportFileName('troqito-backup', 'json'),
          content,
          JSON_MIME,
        );
      }
    } catch (cause) {
      Alert.alert(
        'Não foi possível exportar',
        cause instanceof Error
          ? cause.message
          : 'O arquivo não pôde ser gerado. Tente novamente.',
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen scroll>
      <ScreenHeader title="Exportar meus dados" back />

      <AppText variant="body" tone="muted">
        Seus dados são seus. A exportação gera um arquivo no aparelho e abre o
        compartilhamento para você guardar onde quiser. Nada é enviado a
        servidor nenhum.
      </AppText>

      <Card variant="elevated">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.lg,
          }}
        >
          <IconChip icon="grid-outline" tone="primary" />
          <View style={{ flex: 1, gap: theme.spacing.xxs }}>
            <AppText variant="heading">Planilha</AppText>
            <AppText variant="caption" tone="muted">
              Seus lançamentos em CSV, prontos para abrir no Excel ou no Google
              Planilhas
            </AppText>
          </View>
        </View>
        <Button
          label="Exportar planilha"
          fullWidth
          loading={busy === 'csv'}
          onPress={() => void run('csv')}
        />
      </Card>

      <Card variant="elevated">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.lg,
          }}
        >
          <IconChip icon="archive-outline" tone="info" />
          <View style={{ flex: 1, gap: theme.spacing.xxs }}>
            <AppText variant="heading">Cópia completa</AppText>
            <AppText variant="caption" tone="muted">
              Tudo em um arquivo JSON, para guardar como backup
            </AppText>
          </View>
        </View>
        <Button
          label="Exportar cópia"
          variant="secondary"
          fullWidth
          loading={busy === 'json'}
          onPress={() => void run('json')}
        />
      </Card>

      <AppText variant="caption" tone="subtle">
        O arquivo é gravado na área temporária do aplicativo, que o sistema
        limpa sozinho. Depois de compartilhar, nenhuma cópia fica para trás.
      </AppText>
    </Screen>
  );
}
