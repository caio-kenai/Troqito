import { HOUSEHOLD_ROLES } from '@/database/schema/common';

import {
  ASSIGNABLE_ROLES,
  can,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from '../roles';

describe('can', () => {
  it('permite ao dono tudo o que existe', () => {
    expect(can('owner', 'household.delete')).toBe(true);
    expect(can('owner', 'member.changeRole')).toBe(true);
    expect(can('owner', 'budget.manage')).toBe(true);
  });

  it('impede o administrador de excluir a casa', () => {
    // Excluir a casa apaga o histórico de todos; fica só com quem a criou.
    expect(can('admin', 'household.delete')).toBe(false);
    expect(can('admin', 'member.invite')).toBe(true);
  });

  it('impede o administrador de trocar papéis', () => {
    expect(can('admin', 'member.changeRole')).toBe(false);
  });

  it('deixa o participante lançar, mas não mexer em membros', () => {
    expect(can('member', 'transaction.create')).toBe(true);
    expect(can('member', 'member.invite')).toBe(false);
    expect(can('member', 'budget.manage')).toBe(false);
  });

  it('não deixa quem só acompanha alterar nada', () => {
    expect(can('viewer', 'transaction.create')).toBe(false);
    expect(can('viewer', 'transaction.edit')).toBe(false);
    expect(can('viewer', 'household.edit')).toBe(false);
  });

  it('nega permissão para papel desconhecido em vez de liberar', () => {
    // A falha de um papel inválido tem que ser fechada, nunca aberta.
    expect(can('intruso' as never, 'transaction.create')).toBe(false);
  });
});

describe('papéis', () => {
  it('tem rótulo e descrição para todos os papéis', () => {
    for (const role of HOUSEHOLD_ROLES) {
      expect(ROLE_LABELS[role]).toBeTruthy();
      expect(ROLE_DESCRIPTIONS[role]).toBeTruthy();
    }
  });

  it('não oferece o papel de dono na atribuição', () => {
    // Toda casa tem exatamente um dono, que é quem a criou.
    expect(ASSIGNABLE_ROLES).not.toContain('owner');
    expect(ASSIGNABLE_ROLES).toHaveLength(HOUSEHOLD_ROLES.length - 1);
  });
});
