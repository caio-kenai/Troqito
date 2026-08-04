import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { idColumn, ownerColumn, syncColumns } from './common';

/**
 * Perfil local da pessoa. Enquanto não houver autenticação, existe um único
 * perfil criado na primeira abertura; com a autenticação, o identificador passa
 * a ser o do usuário no servidor.
 */
export const profiles = sqliteTable('profiles', {
  id: idColumn,
  name: text('name').notNull(),
  email: text('email'),
  avatarUri: text('avatar_uri'),

  currency: text('currency').notNull().default('BRL'),
  /** `system`, `light` ou `dark`. */
  themePreference: text('theme_preference').notNull().default('system'),

  /**
   * Ciclo financeiro: para quem recebe no dia 5, o mês útil não começa no dia
   * 1. Ambos são dias do mês.
   */
  cycleStartDay: integer('cycle_start_day').notNull().default(1),
  monthClosingDay: integer('month_closing_day').notNull().default(31),

  maskValues: integer('mask_values', { mode: 'boolean' })
    .notNull()
    .default(false),
  biometricLock: integer('biometric_lock', { mode: 'boolean' })
    .notNull()
    .default(false),

  ...syncColumns,
});

export const households = sqliteTable(
  'households',
  {
    id: idColumn,
    ownerId: ownerColumn,
    name: text('name').notNull(),
    imageUri: text('image_uri'),
    archivedAt: integer('archived_at'),
    ...syncColumns,
  },
  (table) => [index('households_owner_idx').on(table.ownerId)],
);

export const householdMembers = sqliteTable(
  'household_members',
  {
    id: idColumn,
    householdId: text('household_id').notNull(),
    profileId: text('profile_id').notNull(),

    /** `owner`, `admin`, `member` ou `viewer`. */
    role: text('role').notNull().default('member'),
    /** Nome exibido dentro da casa, útil antes de o convidado aceitar. */
    displayName: text('display_name').notNull(),
    joinedAt: integer('joined_at'),
    removedAt: integer('removed_at'),

    ...syncColumns,
  },
  (table) => [
    index('household_members_household_idx').on(table.householdId),
    index('household_members_profile_idx').on(table.profileId),
  ],
);

export const householdInvites = sqliteTable(
  'household_invites',
  {
    id: idColumn,
    householdId: text('household_id').notNull(),
    invitedBy: text('invited_by').notNull(),

    email: text('email').notNull(),
    role: text('role').notNull().default('member'),
    /** Código do convite, usado no link de abertura direta. */
    code: text('code').notNull(),
    /** `pending`, `accepted`, `declined` ou `expired`. */
    status: text('status').notNull().default('pending'),
    expiresAt: integer('expires_at'),
    respondedAt: integer('responded_at'),

    ...syncColumns,
  },
  (table) => [
    index('household_invites_household_idx').on(table.householdId),
    index('household_invites_code_idx').on(table.code),
  ],
);
