import { type CalendarDate } from '@/lib/date';
import { type Cents } from '@/lib/money';

export type FilterableTransaction = {
  title: string;
  notes: string | null;
  merchant: string | null;
  kind: string;
  status: string;
  amount: Cents;
  date: CalendarDate;
  categoryId: string | null;
  accountId: string | null;
};

export type TransactionFilter = {
  /** Texto livre, comparado com descrição, observações e estabelecimento. */
  query?: string;
  kinds?: readonly string[];
  statuses?: readonly string[];
  categoryIds?: readonly string[];
  accountIds?: readonly string[];
  from?: CalendarDate;
  to?: CalendarDate;
  minAmount?: Cents;
  maxAmount?: Cents;
};

export type SortOrder = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

/**
 * Normaliza para busca: sem acento, sem caixa.
 *
 * Quem procura "cafe" precisa encontrar "Café". Exigir o acento certo faria a
 * busca falhar justamente para quem digita rápido, que é quem usa busca.
 */
export function normalize(value: string): string {
  return (
    value
      .normalize('NFD')
      // Faixa dos sinais diacríticos combinantes, que a decomposição separou.
      // Escrita em escapes para o arquivo não depender de como o editor grava
      // caracteres que não têm forma visível própria.
      .replace(/[\u0300-\u036f]/gu, '')
      .toLowerCase()
      .trim()
  );
}

function matchesQuery(
  transaction: FilterableTransaction,
  query: string,
): boolean {
  const needle = normalize(query);
  if (needle === '') return true;

  // Cada palavra digitada precisa aparecer em algum dos campos. Assim
  // "mercado maio" encontra "Mercado" com observação "compras de maio", que é
  // o que a pessoa espera ao juntar dois termos.
  const haystack = normalize(
    [transaction.title, transaction.notes, transaction.merchant]
      .filter(Boolean)
      .join(' '),
  );

  return needle.split(/\s+/).every((word) => haystack.includes(word));
}

export function filterTransactions<T extends FilterableTransaction>(
  transactions: readonly T[],
  filter: TransactionFilter,
): T[] {
  return transactions.filter((transaction) => {
    if (filter.query && !matchesQuery(transaction, filter.query)) return false;

    if (filter.kinds?.length && !filter.kinds.includes(transaction.kind)) {
      return false;
    }
    if (
      filter.statuses?.length &&
      !filter.statuses.includes(transaction.status)
    ) {
      return false;
    }
    if (
      filter.categoryIds?.length &&
      (transaction.categoryId === null ||
        !filter.categoryIds.includes(transaction.categoryId))
    ) {
      return false;
    }
    if (
      filter.accountIds?.length &&
      (transaction.accountId === null ||
        !filter.accountIds.includes(transaction.accountId))
    ) {
      return false;
    }

    if (filter.from && transaction.date < filter.from) return false;
    if (filter.to && transaction.date > filter.to) return false;

    if (
      filter.minAmount !== undefined &&
      transaction.amount < filter.minAmount
    ) {
      return false;
    }
    if (
      filter.maxAmount !== undefined &&
      transaction.amount > filter.maxAmount
    ) {
      return false;
    }

    return true;
  });
}

export function sortTransactions<T extends FilterableTransaction>(
  transactions: readonly T[],
  order: SortOrder,
): T[] {
  const copy = [...transactions];

  switch (order) {
    case 'date-asc':
      return copy.sort((a, b) => a.date.localeCompare(b.date));
    case 'amount-desc':
      return copy.sort((a, b) => b.amount - a.amount);
    case 'amount-asc':
      return copy.sort((a, b) => a.amount - b.amount);
    case 'date-desc':
    default:
      return copy.sort((a, b) => b.date.localeCompare(a.date));
  }
}

/** Um filtro sem nenhum critério não filtra nada, e a tela não deve dizer que sim. */
export function isEmptyFilter(filter: TransactionFilter): boolean {
  return (
    !filter.query &&
    !filter.kinds?.length &&
    !filter.statuses?.length &&
    !filter.categoryIds?.length &&
    !filter.accountIds?.length &&
    !filter.from &&
    !filter.to &&
    filter.minAmount === undefined &&
    filter.maxAmount === undefined
  );
}

export const SORT_LABELS: Record<SortOrder, string> = {
  'date-desc': 'Mais recentes',
  'date-asc': 'Mais antigas',
  'amount-desc': 'Maior valor',
  'amount-asc': 'Menor valor',
};
