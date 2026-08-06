import { type HouseholdRole } from '@/database/schema/common';

/**
 * O que cada papel pode fazer dentro de uma casa.
 *
 * As permissões vivem aqui, e não espalhadas em `if` pelas telas, porque a
 * mesma pergunta é feita em vários lugares e uma resposta divergente entre eles
 * é como se abre brecha de acesso. Quando a sincronização entrar, o servidor
 * repete esta mesma tabela: permissão conferida só no aparelho não é permissão.
 */
export type Permission =
  | 'household.edit'
  | 'household.delete'
  | 'member.invite'
  | 'member.remove'
  | 'member.changeRole'
  | 'transaction.create'
  | 'transaction.edit'
  | 'transaction.delete'
  | 'budget.manage';

const PERMISSIONS: Record<HouseholdRole, readonly Permission[]> = {
  owner: [
    'household.edit',
    'household.delete',
    'member.invite',
    'member.remove',
    'member.changeRole',
    'transaction.create',
    'transaction.edit',
    'transaction.delete',
    'budget.manage',
  ],
  admin: [
    'household.edit',
    'member.invite',
    'member.remove',
    'transaction.create',
    'transaction.edit',
    'transaction.delete',
    'budget.manage',
  ],
  member: ['transaction.create', 'transaction.edit', 'transaction.delete'],
  // Quem só acompanha vê tudo e não altera nada. É o papel de quem entrou para
  // ter visibilidade, não para gerir.
  viewer: [],
};

export function can(role: HouseholdRole, permission: Permission): boolean {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}

export const ROLE_LABELS: Record<HouseholdRole, string> = {
  owner: 'Dono',
  admin: 'Administrador',
  member: 'Participante',
  viewer: 'Somente leitura',
};

export const ROLE_DESCRIPTIONS: Record<HouseholdRole, string> = {
  owner: 'Controla a casa, os membros e pode excluí-la',
  admin: 'Gerencia membros, lançamentos e orçamentos',
  member: 'Registra e edita lançamentos da casa',
  viewer: 'Acompanha os números sem alterar nada',
};

/**
 * Papéis que podem ser atribuídos a um convidado.
 *
 * `owner` fica de fora: toda casa tem exatamente um dono, e ele é quem a criou.
 * Transferir a propriedade é outra operação, não uma escolha de convite.
 */
export const ASSIGNABLE_ROLES: readonly HouseholdRole[] = [
  'admin',
  'member',
  'viewer',
];
