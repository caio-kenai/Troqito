import { cents } from '@/lib/money';

import { escapeField, toCsv, withBom } from '../csv';
import {
  amountForSheet,
  BACKUP_FORMAT_VERSION,
  buildBackup,
  exportFileName,
  transactionsToCsv,
  type ExportableTransaction,
} from '../exportData';

function transaction(
  partial: Partial<ExportableTransaction> = {},
): ExportableTransaction {
  return {
    id: 't1',
    date: '2026-03-10',
    kind: 'expense',
    status: 'settled',
    title: 'Mercado',
    amount: cents(123_45),
    categoryName: 'Alimentação',
    accountName: 'Conta-corrente',
    notes: null,
    ...partial,
  };
}

describe('escapeField', () => {
  it('deixa passar texto simples', () => {
    expect(escapeField('Mercado', ';')).toBe('Mercado');
  });

  it('envolve em aspas quando há o separador', () => {
    // Sem isso, o campo viraria duas colunas e a planilha inteira desloca.
    expect(escapeField('Padaria; café', ';')).toBe('"Padaria; café"');
  });

  it('dobra as aspas de dentro do campo', () => {
    expect(escapeField('Mercado "do bairro"', ';')).toBe(
      '"Mercado ""do bairro"""',
    );
  });

  it('envolve em aspas quando há quebra de linha', () => {
    expect(escapeField('Linha 1\nLinha 2', ';')).toBe('"Linha 1\nLinha 2"');
  });
});

describe('toCsv', () => {
  it('escreve cabeçalho e linhas separados por quebra', () => {
    const csv = toCsv(['A', 'B'], [['1', '2']]);

    expect(csv).toBe('A;B\r\n1;2');
  });

  it('aceita separador diferente', () => {
    expect(toCsv(['A', 'B'], [['1', '2']], ',')).toBe('A,B\r\n1,2');
  });

  it('devolve só o cabeçalho quando não há linhas', () => {
    expect(toCsv(['A', 'B'], [])).toBe('A;B');
  });
});

describe('withBom', () => {
  it('acrescenta a marca de ordem de bytes', () => {
    // Sem ela o Excel abre em outra codificação e os acentos quebram.
    expect(withBom('teste').charCodeAt(0)).toBe(0xfeff);
  });
});

describe('amountForSheet', () => {
  it('usa vírgula decimal e não leva símbolo de moeda', () => {
    // Com "R$" na frente, a coluna vira texto e nenhuma soma funciona.
    expect(amountForSheet(cents(123_45))).toBe('123,45');
  });

  it('preenche o centavo com zero à esquerda', () => {
    expect(amountForSheet(cents(1_05))).toBe('1,05');
  });

  it('escreve zero corretamente', () => {
    expect(amountForSheet(cents(0))).toBe('0,00');
  });

  it('mantém o sinal de valores negativos', () => {
    expect(amountForSheet(cents(-50_10))).toBe('-50,10');
  });

  it('não perde precisão em valores altos', () => {
    // 123.456.789 centavos são R$ 1.234.567,89.
    expect(amountForSheet(cents(123_456_789))).toBe('1234567,89');
  });
});

describe('transactionsToCsv', () => {
  it('traduz o tipo do lançamento', () => {
    const csv = transactionsToCsv([transaction({ kind: 'income' })]);

    expect(csv).toContain('Receita');
  });

  it('escreve campo vazio quando não há categoria nem conta', () => {
    const csv = transactionsToCsv([
      transaction({ categoryName: null, accountName: null, notes: null }),
    ]);

    expect(csv).toContain(';;');
  });

  it('protege descrição que contém o separador', () => {
    const csv = transactionsToCsv([transaction({ title: 'Uber; ida' })]);

    expect(csv).toContain('"Uber; ida"');
  });

  it('começa com a marca de ordem de bytes', () => {
    expect(transactionsToCsv([]).charCodeAt(0)).toBe(0xfeff);
  });
});

describe('buildBackup', () => {
  const empty = {
    transactions: [],
    accounts: [],
    categories: [],
    households: [],
    budgets: [],
    goals: [],
  };

  it('registra a versão do formato', () => {
    const backup = JSON.parse(buildBackup(empty));

    expect(backup.formatVersion).toBe(BACKUP_FORMAT_VERSION);
  });

  it('registra o momento da exportação', () => {
    const backup = JSON.parse(
      buildBackup(empty, new Date('2026-03-10T12:00:00Z')),
    );

    expect(backup.exportedAt).toBe('2026-03-10T12:00:00.000Z');
  });

  it('preserva os dados como estão', () => {
    const backup = JSON.parse(
      buildBackup({ ...empty, accounts: [{ id: 'a', name: 'Carteira' }] }),
    );

    expect(backup.accounts).toEqual([{ id: 'a', name: 'Carteira' }]);
  });
});

describe('exportFileName', () => {
  it('inclui a data, para exportações sucessivas não se sobreporem', () => {
    expect(
      exportFileName('troqito', 'csv', new Date('2026-03-10T12:00:00Z')),
    ).toBe('troqito-2026-03-10.csv');
  });
});
