import { Screen, StateView, TAB_SCREEN_EDGES } from '@/components';

export default function PlanningScreen() {
  return (
    <Screen edges={TAB_SCREEN_EDGES}>
      <StateView
        variant="empty"
        title="Planejamento em construção"
        description="Orçamentos por categoria e metas financeiras ficam aqui, com acompanhamento do quanto já foi usado no período."
      />
    </Screen>
  );
}
