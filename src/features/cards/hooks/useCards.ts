import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';

import { cents, type Cents } from '@/lib/money';

import { availableLimit, limitUsage } from '../domain/invoice';
import {
  cardUsage,
  listCardsQuery,
  type CreditCard,
} from '../repository/cardsRepository';

export type CardWithUsage = CreditCard & {
  used: Cents;
  available: Cents;
  /** Fração do limite comprometida, de 0 a 1 ou mais quando estourado. */
  usage: number;
};

export type CardsResult = {
  cards: CardWithUsage[];
  isLoading: boolean;
};

export function useCards(ownerId: string): CardsResult {
  const { data, error } = useLiveQuery(listCardsQuery(ownerId));

  return useMemo(() => {
    if (error) throw error;

    const rows = data ?? [];
    const usage = cardUsage(ownerId);

    const cards = rows.map((card) => {
      const used = usage.get(card.id) ?? cents(0);
      const creditLimit = cents(card.creditLimit);

      return {
        ...card,
        used,
        available: availableLimit(creditLimit, used),
        usage: limitUsage(creditLimit, used),
      };
    });

    return { cards, isLoading: data === undefined };
  }, [data, error, ownerId]);
}
