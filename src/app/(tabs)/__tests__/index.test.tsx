import { screen } from '@testing-library/react-native';

import { cents } from '@/lib/money';
import { makeProfile, makeTransaction } from '@/testing/factories';
import { renderWithTheme } from '@/testing/renderWithTheme';

import HomeScreen from '../index';

// A tela é a camada de apresentação: as consultas ao banco são substituídas
// para que o teste verifique o que aparece, e não o SQLite. O cálculo do
// período continua sendo o de produção — só a origem dos dados é trocada.
const mockTransactions = jest.fn();
const mockAccounts = jest.fn();
const mockCategories = jest.fn();
const mockSession = jest.fn();

// O módulo real dos lançamentos é carregado para preservar `usePeriodSummary`,
// e ele arrasta o cliente do banco. Sem SQLite nativo no Jest, a conexão é
// substituída — nenhuma consulta chega a ser executada neste teste.
jest.mock('@/database/client', () => ({
  db: {},
  schema: {},
  DATABASE_NAME: 'troqito.db',
  closeDatabase: jest.fn(),
}));

jest.mock('@/features/transactions/hooks/useTransactions', () => ({
  ...jest.requireActual('@/features/transactions/hooks/useTransactions'),
  useTransactions: (ownerId: string) => mockTransactions(ownerId),
}));

jest.mock('@/features/accounts/hooks/useAccounts', () => ({
  useAccounts: (ownerId: string) => mockAccounts(ownerId),
}));

jest.mock('@/features/categories/hooks/useCategories', () => ({
  useCategories: (ownerId: string) => mockCategories(ownerId),
}));

jest.mock('@/features/profile/SessionProvider', () => ({
  useSession: () => mockSession(),
  useOwnerId: () => 'perfil-teste',
}));

beforeEach(() => {
  mockSession.mockReturnValue({
    status: 'ready',
    profile: makeProfile({ cycleStartDay: 1 }),
  });
  mockAccounts.mockReturnValue({
    accounts: [],
    total: cents(0),
    isLoading: false,
  });
  mockTransactions.mockReturnValue({ transactions: [], isLoading: false });
  mockCategories.mockReturnValue({
    categories: [],
    roots: [],
    byId: new Map(),
    isLoading: false,
  });
});

describe('HomeScreen', () => {
  it('apresenta o resumo financeiro do período', async () => {
    await renderWithTheme(<HomeScreen />);

    expect(screen.getByText('Saldo total')).toBeOnTheScreen();
    expect(screen.getByText('Receitas')).toBeOnTheScreen();
    expect(screen.getByText('Despesas')).toBeOnTheScreen();
    expect(screen.getByText('Resultado do período')).toBeOnTheScreen();
  });

  it('orienta quem ainda não tem lançamentos', async () => {
    await renderWithTheme(<HomeScreen />);

    expect(screen.getByText('Comece por aqui')).toBeOnTheScreen();
    // Sem movimento, saldo e despesas ficam zerados.
    expect(screen.getAllByText('R$ 0,00')).toHaveLength(2);
  });

  it('soma receitas e despesas do ciclo e mostra o resultado', async () => {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const data = `${hoje.getFullYear()}-${mes}-${dia}`;

    mockAccounts.mockReturnValue({
      accounts: [],
      total: cents(150_00),
      isLoading: false,
    });
    mockTransactions.mockReturnValue({
      transactions: [
        makeTransaction({
          id: 'a',
          kind: 'income',
          title: 'Salário',
          amount: 500_00,
          date: data,
        }),
        makeTransaction({
          id: 'b',
          kind: 'expense',
          title: 'Mercado',
          amount: 350_00,
          date: data,
        }),
      ],
      isLoading: false,
    });

    await renderWithTheme(<HomeScreen />);

    expect(screen.getByText('R$ 150,00')).toBeOnTheScreen();
    // Cada valor aparece duas vezes: no resumo do período e na lista recente.
    expect(screen.getAllByText('+R$ 500,00')).toHaveLength(2);
    expect(screen.getAllByText('R$ 350,00')).toHaveLength(2);
    // Resultado do período: 500 − 350.
    expect(screen.getByText('+R$ 150,00')).toBeOnTheScreen();

    // Os lançamentos recentes aparecem sem que se precise abrir outra aba.
    expect(screen.getByText('Atividade recente')).toBeOnTheScreen();
    expect(screen.getByText('Salário')).toBeOnTheScreen();
  });

  it('avisa quando o período fecha no negativo', async () => {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    mockTransactions.mockReturnValue({
      transactions: [
        makeTransaction({
          amount: 80_00,
          date: `${hoje.getFullYear()}-${mes}-${dia}`,
        }),
      ],
      isLoading: false,
    });

    await renderWithTheme(<HomeScreen />);

    expect(
      screen.getByText('Você gastou mais do que recebeu neste período.'),
    ).toBeOnTheScreen();
  });
});
