/**
 * Categorias criadas na primeira abertura do aplicativo.
 *
 * Existem porque um aplicativo de finanças que abre vazio obriga a pessoa a
 * cadastrar categorias antes de registrar o primeiro gasto — e é aí que a
 * maioria desiste. Todas podem ser renomeadas, recoloridas e arquivadas; o que
 * não podem é ser excluídas, para não quebrar lançamentos antigos.
 */

export type DefaultCategory = {
  name: string;
  kind: 'income' | 'expense';
  icon: string;
  color: string;
  children?: string[];
};

export const DEFAULT_EXPENSE_CATEGORIES: DefaultCategory[] = [
  {
    name: 'Alimentação',
    kind: 'expense',
    icon: 'restaurant-outline',
    color: '#E87C3D',
    children: ['Restaurante', 'Delivery', 'Padaria', 'Lanche'],
  },
  {
    name: 'Mercado',
    kind: 'expense',
    icon: 'cart-outline',
    color: '#2FAC6C',
    children: ['Supermercado', 'Feira', 'Açougue'],
  },
  {
    name: 'Moradia',
    kind: 'expense',
    icon: 'home-outline',
    color: '#5C93E3',
    children: ['Aluguel', 'Condomínio', 'IPTU', 'Manutenção'],
  },
  {
    name: 'Contas domésticas',
    kind: 'expense',
    icon: 'flash-outline',
    color: '#E8AC3C',
    children: ['Luz', 'Água', 'Gás', 'Internet', 'Telefone'],
  },
  {
    name: 'Transporte',
    kind: 'expense',
    icon: 'car-outline',
    color: '#7C6BD6',
    children: [
      'Combustível',
      'Aplicativo',
      'Transporte público',
      'Estacionamento',
    ],
  },
  {
    name: 'Saúde',
    kind: 'expense',
    icon: 'medkit-outline',
    color: '#E3676B',
    children: ['Plano de saúde', 'Farmácia', 'Consulta', 'Exame'],
  },
  {
    name: 'Educação',
    kind: 'expense',
    icon: 'school-outline',
    color: '#3D9BB5',
    children: ['Mensalidade', 'Curso', 'Material'],
  },
  {
    name: 'Lazer',
    kind: 'expense',
    icon: 'game-controller-outline',
    color: '#D65DA8',
    children: ['Cinema', 'Bar', 'Viagem curta', 'Hobby'],
  },
  {
    name: 'Assinaturas',
    kind: 'expense',
    icon: 'repeat-outline',
    color: '#9B59B6',
    children: ['Streaming', 'Aplicativos', 'Academia'],
  },
  {
    name: 'Compras',
    kind: 'expense',
    icon: 'bag-handle-outline',
    color: '#E85D9B',
    children: ['Roupas', 'Eletrônicos', 'Casa'],
  },
  {
    name: 'Serviços',
    kind: 'expense',
    icon: 'construct-outline',
    color: '#6B7A74',
  },
  {
    name: 'Viagens',
    kind: 'expense',
    icon: 'airplane-outline',
    color: '#2FA8C4',
  },
  { name: 'Pets', kind: 'expense', icon: 'paw-outline', color: '#B5793D' },
  {
    name: 'Impostos',
    kind: 'expense',
    icon: 'document-text-outline',
    color: '#8B1F24',
  },
  {
    name: 'Dívidas',
    kind: 'expense',
    icon: 'trending-down-outline',
    color: '#B02A30',
  },
  {
    name: 'Investimentos',
    kind: 'expense',
    icon: 'trending-up-outline',
    color: '#0B7540',
  },
  {
    name: 'Presentes',
    kind: 'expense',
    icon: 'gift-outline',
    color: '#D64545',
  },
  {
    name: 'Outros',
    kind: 'expense',
    icon: 'ellipsis-horizontal-outline',
    color: '#96A39D',
  },
];

export const DEFAULT_INCOME_CATEGORIES: DefaultCategory[] = [
  { name: 'Salário', kind: 'income', icon: 'wallet-outline', color: '#0B7540' },
  {
    name: 'Vale-alimentação',
    kind: 'income',
    icon: 'fast-food-outline',
    color: '#2FAC6C',
  },
  {
    name: 'Vale-refeição',
    kind: 'income',
    icon: 'restaurant-outline',
    color: '#5CC48D',
  },
  {
    name: 'Freelance',
    kind: 'income',
    icon: 'laptop-outline',
    color: '#3D9BB5',
  },
  {
    name: 'Comissão',
    kind: 'income',
    icon: 'ribbon-outline',
    color: '#5C93E3',
  },
  {
    name: 'Bonificação',
    kind: 'income',
    icon: 'trophy-outline',
    color: '#E8AC3C',
  },
  {
    name: 'Aluguel recebido',
    kind: 'income',
    icon: 'business-outline',
    color: '#7C6BD6',
  },
  {
    name: 'Dividendos',
    kind: 'income',
    icon: 'pie-chart-outline',
    color: '#12904F',
  },
  {
    name: 'Rendimentos',
    kind: 'income',
    icon: 'trending-up-outline',
    color: '#2FA8C4',
  },
  {
    name: 'Reembolso',
    kind: 'income',
    icon: 'return-down-back-outline',
    color: '#6B7A74',
  },
  { name: 'Venda', kind: 'income', icon: 'pricetag-outline', color: '#E87C3D' },
  { name: 'Presente', kind: 'income', icon: 'gift-outline', color: '#D65DA8' },
  {
    name: 'Outros',
    kind: 'income',
    icon: 'ellipsis-horizontal-outline',
    color: '#96A39D',
  },
];

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];
