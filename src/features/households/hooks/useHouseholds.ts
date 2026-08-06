import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';

import { type HouseholdRole } from '@/database/schema/common';

import { can, type Permission } from '../domain/roles';
import {
  listHouseholdsQuery,
  listMembersQuery,
  type Household,
  type HouseholdMember,
} from '../repository/householdsRepository';

export type HouseholdsResult = {
  households: Household[];
  /** A casa em uso. Enquanto houver só uma, é sempre ela. */
  current: Household | null;
  isLoading: boolean;
};

export function useHouseholds(ownerId: string): HouseholdsResult {
  const { data, error } = useLiveQuery(listHouseholdsQuery(ownerId));

  if (error) throw error;

  return useMemo(() => {
    const list = data ?? [];
    const active = list.filter((item) => item.archivedAt === null);

    return {
      households: list,
      current: active[0] ?? null,
      isLoading: data === undefined,
    };
  }, [data]);
}

export type MembersResult = {
  members: HouseholdMember[];
  isLoading: boolean;
};

export function useMembers(householdId: string): MembersResult {
  const { data, error } = useLiveQuery(listMembersQuery(householdId));

  if (error) throw error;

  return { members: data ?? [], isLoading: data === undefined };
}

/**
 * Papel de quem está usando o aplicativo dentro da casa.
 *
 * Quem não é membro não recebe papel nenhum, e não uma permissão reduzida:
 * a diferença importa para a interface poder dizer que a pessoa não pertence
 * àquela casa, em vez de mostrar uma tela vazia sem explicação.
 */
export function useMyRole(
  members: readonly HouseholdMember[],
  profileId: string,
): HouseholdRole | null {
  return useMemo(() => {
    const mine = members.find((member) => member.profileId === profileId);
    return mine ? (mine.role as HouseholdRole) : null;
  }, [members, profileId]);
}

export function useCan(
  role: HouseholdRole | null,
  permission: Permission,
): boolean {
  return role === null ? false : can(role, permission);
}
