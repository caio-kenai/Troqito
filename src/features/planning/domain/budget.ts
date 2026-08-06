import { type CalendarDate, type DateRange } from '@/lib/date';
import { add, type Cents, subtract, ZERO } from '@/lib/money';

export type BudgetScope =
  'category' | 'account' | 'person' | 'household' | 'overall';

export type BudgetDefinition = {
  id: string;
  name: string;
  plannedAmount: Cents;
  scope: BudgetScope;
  scopeId: string | null;
  /** Porcentagem em base 10.000 que dispara o alerta de proximidade. */
  alertThreshold: number;
};

export type SpendingEntry = {
  amount: Cents;
  date: CalendarDate;
  status: string;
  kind: string;
  categoryId: string | null;
  accountId: string | null;
};

export type BudgetStatus = 'within' | 'approaching' | 'exceeded';

export type BudgetProgress = {
  budget: BudgetDefinition;
  spent: Cents;
  /** Quanto ainda cabe. Zero quando estourou, nunca negativo. */
  remaining: Cents;
  /** Quanto passou do teto. Zero quando não estourou. */
  overspent: Cents;
  /** Fração do teto consumida, de 0 a 1 ou mais. */
  usage: number;
  status: BudgetStatus;
};

/** O que conta para um orçamento: despesa efetiva dentro do escopo e período. */
function counts(
  entry: SpendingEntry,
  budget: BudgetDefinition,
  { start, end }: DateRange,
): boolean {
  if (entry.kind !== 'expense') return false;
  if (entry.status === 'canceled') return false;
  if (entry.date < start || entry.date > end) return false;

  switch (budget.scope) {
    case 'category':
      return entry.categoryId === budget.scopeId;
    case 'account':
      return entry.accountId === budget.scopeId;
    // Pessoa e casa dependem da divisão de despesas, que resolve o escopo em
    // outro momento; enquanto isso, não filtram nada aqui.
    case 'person':
    case 'household':
    case 'overall':
      return true;
    default:
      return false;
  }
}

/**
 * Andamento de um orçamento no período.
 *
 * Estourar o teto não é escondido nem transformado em número negativo: o que
 * sobra vira zero e o excesso aparece em campo próprio. Um "restam −R$ 80,00"
 * obriga quem lê a fazer a conta de cabeça para entender que passou.
 */
export function budgetProgress(
  budget: BudgetDefinition,
  entries: readonly SpendingEntry[],
  range: DateRange,
): BudgetProgress {
  const spent = entries
    .filter((entry) => counts(entry, budget, range))
    .reduce((acc, entry) => add(acc, entry.amount), ZERO);

  const exceeded = spent > budget.plannedAmount;
  const usage = budget.plannedAmount <= 0 ? 0 : spent / budget.plannedAmount;

  const threshold = budget.alertThreshold / 10_000;

  return {
    budget,
    spent,
    remaining: exceeded ? ZERO : subtract(budget.plannedAmount, spent),
    overspent: exceeded ? subtract(spent, budget.plannedAmount) : ZERO,
    usage,
    status: exceeded
      ? 'exceeded'
      : usage >= threshold
        ? 'approaching'
        : 'within',
  };
}

export const BUDGET_SCOPE_LABELS: Record<BudgetScope, string> = {
  category: 'Categoria',
  account: 'Conta',
  person: 'Pessoa',
  household: 'Casa',
  overall: 'Tudo',
};

export const BUDGET_STATUS_LABELS: Record<BudgetStatus, string> = {
  within: 'Dentro do planejado',
  approaching: 'Perto do limite',
  exceeded: 'Acima do planejado',
};
