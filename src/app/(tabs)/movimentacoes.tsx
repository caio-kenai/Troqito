import { Screen, StateView } from '@/components';

export default function TransactionsScreen() {
  return (
    <Screen>
      <StateView
        variant="empty"
        title="Nenhuma movimentação ainda"
        description="Assim que você registrar receitas e despesas, elas aparecem aqui, agrupadas por data e com filtros."
      />
    </Screen>
  );
}
