import { and, asc, eq, isNull } from 'drizzle-orm';

import { db } from '@/database/client';
import {
  deletedRecordFields,
  enqueueMutation,
  newRecordFields,
  updatedRecordFields,
} from '@/database/mutations';
import { householdMembers, households } from '@/database/schema';
import { type HouseholdRole } from '@/database/schema/common';
import { uuidv7 } from '@/lib/id';

import {
  type HouseholdFormValues,
  type MemberFormValues,
} from '../schemas/householdSchema';

export type Household = typeof households.$inferSelect;
export type HouseholdMember = typeof householdMembers.$inferSelect;

export function listHouseholdsQuery(ownerId: string) {
  return db
    .select()
    .from(households)
    .where(and(eq(households.ownerId, ownerId), isNull(households.deletedAt)))
    .orderBy(asc(households.archivedAt), asc(households.name));
}

export function listMembersQuery(householdId: string) {
  return db
    .select()
    .from(householdMembers)
    .where(
      and(
        eq(householdMembers.householdId, householdId),
        isNull(householdMembers.deletedAt),
      ),
    )
    .orderBy(asc(householdMembers.displayName));
}

/**
 * Cria a casa e já registra quem a criou como dono.
 *
 * As duas escritas vão na mesma transação: uma casa sem dono não teria quem
 * pudesse convidar ninguém nem excluí-la, e ficaria inutilizável.
 */
export function createHousehold(
  ownerId: string,
  ownerName: string,
  values: HouseholdFormValues,
): string {
  const household = {
    ...newRecordFields(),
    ownerId,
    name: values.name,
    imageUri: null,
    archivedAt: null,
  };

  const owner = {
    ...newRecordFields(),
    householdId: household.id,
    profileId: ownerId,
    role: 'owner',
    displayName: ownerName,
    joinedAt: Date.now(),
    removedAt: null,
  };

  db.transaction((tx) => {
    tx.insert(households).values(household).run();
    enqueueMutation(tx, 'households', household.id, 'insert', household);

    tx.insert(householdMembers).values(owner).run();
    enqueueMutation(tx, 'household_members', owner.id, 'insert', owner);
  });

  return household.id;
}

export function updateHousehold(id: string, values: HouseholdFormValues): void {
  const patch = { ...updatedRecordFields(), name: values.name };

  db.transaction((tx) => {
    tx.update(households).set(patch).where(eq(households.id, id)).run();
    enqueueMutation(tx, 'households', id, 'update', patch);
  });
}

export function deleteHousehold(id: string): void {
  const patch = deletedRecordFields();

  db.transaction((tx) => {
    tx.update(households).set(patch).where(eq(households.id, id)).run();
    enqueueMutation(tx, 'households', id, 'delete', patch);

    // Os membros saem junto: uma lista de participantes de uma casa que não
    // existe mais só serviria para reaparecer em consulta esquecida.
    tx.update(householdMembers)
      .set(patch)
      .where(eq(householdMembers.householdId, id))
      .run();
    enqueueMutation(tx, 'household_members', id, 'delete', {
      ...patch,
      householdId: id,
    });
  });
}

/**
 * Acrescenta uma pessoa à casa.
 *
 * Enquanto não há autenticação, a pessoa existe apenas como registro local: o
 * identificador de perfil é gerado aqui e passa a ser dela. Quando o convite
 * por conta entrar, é este registro que será ligado ao perfil real, sem que a
 * divisão de despesas já lançada precise ser refeita.
 */
export function addMember(
  householdId: string,
  values: MemberFormValues,
): string {
  const member = {
    ...newRecordFields(),
    householdId,
    profileId: uuidv7(),
    role: values.role,
    displayName: values.displayName,
    joinedAt: Date.now(),
    removedAt: null,
  };

  db.transaction((tx) => {
    tx.insert(householdMembers).values(member).run();
    enqueueMutation(tx, 'household_members', member.id, 'insert', member);
  });

  return member.id;
}

export function updateMember(id: string, values: MemberFormValues): void {
  const patch = {
    ...updatedRecordFields(),
    displayName: values.displayName,
    role: values.role,
  };

  db.transaction((tx) => {
    tx.update(householdMembers)
      .set(patch)
      .where(eq(householdMembers.id, id))
      .run();
    enqueueMutation(tx, 'household_members', id, 'update', patch);
  });
}

export function changeMemberRole(id: string, role: HouseholdRole): void {
  const patch = { ...updatedRecordFields(), role };

  db.transaction((tx) => {
    tx.update(householdMembers)
      .set(patch)
      .where(eq(householdMembers.id, id))
      .run();
    enqueueMutation(tx, 'household_members', id, 'update', patch);
  });
}

export function removeMember(id: string): void {
  const patch = { ...deletedRecordFields(), removedAt: Date.now() };

  db.transaction((tx) => {
    tx.update(householdMembers)
      .set(patch)
      .where(eq(householdMembers.id, id))
      .run();
    enqueueMutation(tx, 'household_members', id, 'delete', patch);
  });
}
