import {
  DEFAULT_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from '../defaultCategories';

describe('categorias iniciais', () => {
  it('cobre as áreas de gasto do dia a dia', () => {
    const names = DEFAULT_EXPENSE_CATEGORIES.map((c) => c.name);
    expect(names).toEqual(
      expect.arrayContaining([
        'Alimentação',
        'Mercado',
        'Moradia',
        'Transporte',
        'Saúde',
        'Educação',
        'Lazer',
        'Assinaturas',
        'Contas domésticas',
      ]),
    );
  });

  it('cobre as origens de receita mais comuns', () => {
    const names = DEFAULT_INCOME_CATEGORIES.map((c) => c.name);
    expect(names).toEqual(
      expect.arrayContaining([
        'Salário',
        'Vale-alimentação',
        'Vale-refeição',
        'Freelance',
        'Reembolso',
      ]),
    );
  });

  it('marca cada categoria com o tipo correspondente', () => {
    expect(DEFAULT_EXPENSE_CATEGORIES.every((c) => c.kind === 'expense')).toBe(
      true,
    );
    expect(DEFAULT_INCOME_CATEGORIES.every((c) => c.kind === 'income')).toBe(
      true,
    );
  });

  // Nome repetido dentro do mesmo tipo tornaria a escolha ambígua na interface.
  it('não repete nome dentro do mesmo tipo', () => {
    for (const list of [
      DEFAULT_EXPENSE_CATEGORIES,
      DEFAULT_INCOME_CATEGORIES,
    ]) {
      const names = list.map((c) => c.name);
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it('não repete subcategoria dentro da mesma categoria', () => {
    for (const category of DEFAULT_CATEGORIES) {
      const children = category.children ?? [];
      expect(new Set(children).size).toBe(children.length);
    }
  });

  it('define cor hexadecimal válida e ícone em todas', () => {
    for (const category of DEFAULT_CATEGORIES) {
      expect(category.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(category.icon.length).toBeGreaterThan(0);
    }
  });
});
