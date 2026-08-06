import { cents } from '@/lib/money';

import {
  filterTransactions,
  isEmptyFilter,
  normalize,
  sortTransactions,
  type FilterableTransaction,
} from '../filters';

function item(
  partial: Partial<FilterableTransaction> = {},
): FilterableTransaction {
  return {
    title: 'Mercado',
    notes: null,
    merchant: null,
    kind: 'expense',
    status: 'settled',
    amount: cents(100_00),
    date: '2026-03-10',
    categoryId: 'cat-1',
    accountId: 'acc-1',
    ...partial,
  };
}

describe('normalize', () => {
  it('remove acento e caixa', () => {
    expect(normalize('Café DA Manhã')).toBe('cafe da manha');
  });

  it('remove espaço nas pontas', () => {
    expect(normalize('  teste  ')).toBe('teste');
  });

  it('preserva números', () => {
    expect(normalize('Parcela 3/12')).toBe('parcela 3/12');
  });
});

describe('filterTransactions', () => {
  it('sem critério, devolve tudo', () => {
    const list = [item(), item({ title: 'Farmácia' })];

    expect(filterTransactions(list, {})).toHaveLength(2);
  });

  it('encontra ignorando acento', () => {
    // Quem digita rápido não põe acento, e é quem mais usa busca.
    const list = [item({ title: 'Farmácia' })];

    expect(filterTransactions(list, { query: 'farmacia' })).toHaveLength(1);
  });

  it('busca também nas observações e no estabelecimento', () => {
    const list = [
      item({ title: 'Compra', notes: 'presente de aniversário' }),
      item({ title: 'Compra', merchant: 'Livraria Central' }),
    ];

    expect(filterTransactions(list, { query: 'aniversario' })).toHaveLength(1);
    expect(filterTransactions(list, { query: 'livraria' })).toHaveLength(1);
  });

  it('exige todas as palavras digitadas', () => {
    const list = [
      item({ title: 'Mercado', notes: 'compras de maio' }),
      item({ title: 'Mercado', notes: 'compras de junho' }),
    ];

    expect(filterTransactions(list, { query: 'mercado maio' })).toHaveLength(1);
  });

  it('filtra por tipo', () => {
    const list = [item(), item({ kind: 'income' })];

    expect(filterTransactions(list, { kinds: ['income'] })).toHaveLength(1);
  });

  it('filtra por situação', () => {
    const list = [item(), item({ status: 'pending' })];

    expect(filterTransactions(list, { statuses: ['pending'] })).toHaveLength(1);
  });

  it('filtra por categoria e exclui quem não tem categoria', () => {
    const list = [item(), item({ categoryId: null })];

    expect(filterTransactions(list, { categoryIds: ['cat-1'] })).toHaveLength(
      1,
    );
  });

  it('filtra por conta', () => {
    const list = [item(), item({ accountId: 'acc-2' })];

    expect(filterTransactions(list, { accountIds: ['acc-2'] })).toHaveLength(1);
  });

  it('filtra por período, com os dois extremos incluídos', () => {
    const list = [
      item({ date: '2026-03-01' }),
      item({ date: '2026-03-15' }),
      item({ date: '2026-03-31' }),
    ];

    expect(
      filterTransactions(list, { from: '2026-03-01', to: '2026-03-31' }),
    ).toHaveLength(3);
    expect(
      filterTransactions(list, { from: '2026-03-02', to: '2026-03-30' }),
    ).toHaveLength(1);
  });

  it('filtra por faixa de valor', () => {
    const list = [
      item({ amount: cents(10_00) }),
      item({ amount: cents(100_00) }),
      item({ amount: cents(1_000_00) }),
    ];

    expect(
      filterTransactions(list, {
        minAmount: cents(50_00),
        maxAmount: cents(500_00),
      }),
    ).toHaveLength(1);
  });

  it('combina critérios', () => {
    const list = [
      item({ kind: 'income', title: 'Salário' }),
      item({ kind: 'income', title: 'Freela' }),
      item({ kind: 'expense', title: 'Salário do faxineiro' }),
    ];

    const result = filterTransactions(list, {
      kinds: ['income'],
      query: 'salario',
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe('Salário');
  });
});

describe('sortTransactions', () => {
  const list = [
    item({ date: '2026-03-10', amount: cents(50_00) }),
    item({ date: '2026-03-20', amount: cents(10_00) }),
    item({ date: '2026-03-01', amount: cents(90_00) }),
  ];

  it('ordena da data mais recente para a mais antiga', () => {
    expect(sortTransactions(list, 'date-desc').map((i) => i.date)).toEqual([
      '2026-03-20',
      '2026-03-10',
      '2026-03-01',
    ]);
  });

  it('ordena da mais antiga para a mais recente', () => {
    expect(sortTransactions(list, 'date-asc')[0]?.date).toBe('2026-03-01');
  });

  it('ordena do maior valor para o menor', () => {
    expect(sortTransactions(list, 'amount-desc')[0]?.amount).toBe(90_00);
  });

  it('ordena do menor valor para o maior', () => {
    expect(sortTransactions(list, 'amount-asc')[0]?.amount).toBe(10_00);
  });

  it('não altera a lista original', () => {
    const original = [...list];
    sortTransactions(list, 'amount-asc');

    expect(list).toEqual(original);
  });
});

describe('isEmptyFilter', () => {
  it('reconhece filtro sem critério', () => {
    expect(isEmptyFilter({})).toBe(true);
    expect(isEmptyFilter({ query: '', kinds: [] })).toBe(true);
  });

  it('reconhece filtro com critério', () => {
    expect(isEmptyFilter({ query: 'mercado' })).toBe(false);
    expect(isEmptyFilter({ minAmount: cents(0) })).toBe(false);
  });
});
