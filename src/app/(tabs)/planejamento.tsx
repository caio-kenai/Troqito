import { Screen, StateView } from '@/components';

export default function PlanningScreen() {
  return (
    <Screen>
      <StateView
        variant="empty"
        title="Planejamento em construção"
        description="Orçamentos por categoria e metas financeiras ficam aqui, com acompanhamento do quanto já foi usado no período."
      />
    </Screen>
  );
}
