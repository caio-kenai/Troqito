CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`household_id` text,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`institution` text,
	`color` text,
	`icon` text,
	`currency` text DEFAULT 'BRL' NOT NULL,
	`initial_balance` integer DEFAULT 0 NOT NULL,
	`include_in_total` integer DEFAULT true NOT NULL,
	`archived_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`server_updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `accounts_owner_idx` ON `accounts` (`owner_id`);--> statement-breakpoint
CREATE INDEX `accounts_household_idx` ON `accounts` (`household_id`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`household_id` text,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`parent_id` text,
	`color` text,
	`icon` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_system` integer DEFAULT false NOT NULL,
	`archived_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`server_updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `categories_owner_kind_idx` ON `categories` (`owner_id`,`kind`);--> statement-breakpoint
CREATE INDEX `categories_parent_idx` ON `categories` (`parent_id`);--> statement-breakpoint
CREATE TABLE `credit_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`household_id` text,
	`name` text NOT NULL,
	`brand` text,
	`color` text,
	`credit_limit` integer DEFAULT 0 NOT NULL,
	`closing_day` integer NOT NULL,
	`due_day` integer NOT NULL,
	`payment_account_id` text,
	`archived_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`server_updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `credit_cards_owner_idx` ON `credit_cards` (`owner_id`);--> statement-breakpoint
CREATE INDEX `credit_cards_household_idx` ON `credit_cards` (`household_id`);--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`credit_card_id` text NOT NULL,
	`reference_month` text NOT NULL,
	`closing_date` text NOT NULL,
	`due_date` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`total_amount` integer DEFAULT 0 NOT NULL,
	`paid_amount` integer DEFAULT 0 NOT NULL,
	`paid_at` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`server_updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `invoices_card_idx` ON `invoices` (`credit_card_id`,`reference_month`);--> statement-breakpoint
CREATE INDEX `invoices_owner_idx` ON `invoices` (`owner_id`);--> statement-breakpoint
CREATE TABLE `household_invites` (
	`id` text PRIMARY KEY NOT NULL,
	`household_id` text NOT NULL,
	`invited_by` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`code` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` integer,
	`responded_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`server_updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `household_invites_household_idx` ON `household_invites` (`household_id`);--> statement-breakpoint
CREATE INDEX `household_invites_code_idx` ON `household_invites` (`code`);--> statement-breakpoint
CREATE TABLE `household_members` (
	`id` text PRIMARY KEY NOT NULL,
	`household_id` text NOT NULL,
	`profile_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`display_name` text NOT NULL,
	`joined_at` integer,
	`removed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`server_updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `household_members_household_idx` ON `household_members` (`household_id`);--> statement-breakpoint
CREATE INDEX `household_members_profile_idx` ON `household_members` (`profile_id`);--> statement-breakpoint
CREATE TABLE `households` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`image_uri` text,
	`archived_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`server_updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `households_owner_idx` ON `households` (`owner_id`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`avatar_uri` text,
	`currency` text DEFAULT 'BRL' NOT NULL,
	`theme_preference` text DEFAULT 'system' NOT NULL,
	`cycle_start_day` integer DEFAULT 1 NOT NULL,
	`month_closing_day` integer DEFAULT 31 NOT NULL,
	`mask_values` integer DEFAULT false NOT NULL,
	`biometric_lock` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`server_updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`household_id` text,
	`name` text NOT NULL,
	`planned_amount` integer NOT NULL,
	`scope` text NOT NULL,
	`scope_id` text,
	`period` text DEFAULT 'monthly' NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`alert_threshold` integer DEFAULT 8000 NOT NULL,
	`archived_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`server_updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `budgets_owner_idx` ON `budgets` (`owner_id`);--> statement-breakpoint
CREATE INDEX `budgets_scope_idx` ON `budgets` (`scope`,`scope_id`);--> statement-breakpoint
CREATE TABLE `goal_contributions` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`goal_id` text NOT NULL,
	`amount` integer NOT NULL,
	`date` text NOT NULL,
	`notes` text,
	`transaction_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`server_updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `goal_contributions_goal_idx` ON `goal_contributions` (`goal_id`);--> statement-breakpoint
CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`household_id` text,
	`name` text NOT NULL,
	`description` text,
	`target_amount` integer NOT NULL,
	`target_date` text,
	`account_id` text,
	`color` text,
	`icon` text,
	`achieved_at` integer,
	`archived_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`server_updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `goals_owner_idx` ON `goals` (`owner_id`);--> statement-breakpoint
CREATE TABLE `sync_cursors` (
	`entity` text PRIMARY KEY NOT NULL,
	`server_updated_at` integer DEFAULT 0 NOT NULL,
	`last_synced_at` integer
);
--> statement-breakpoint
CREATE TABLE `sync_outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`operation` text NOT NULL,
	`payload` text NOT NULL,
	`client_mutation_id` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_attempt_at` integer,
	`last_error` text,
	`quarantined_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sync_outbox_client_mutation_id_unique` ON `sync_outbox` (`client_mutation_id`);--> statement-breakpoint
CREATE INDEX `sync_outbox_pending_idx` ON `sync_outbox` (`quarantined_at`,`created_at`);--> statement-breakpoint
CREATE INDEX `sync_outbox_entity_idx` ON `sync_outbox` (`entity`,`entity_id`);--> statement-breakpoint
CREATE TABLE `attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`transaction_id` text NOT NULL,
	`local_uri` text NOT NULL,
	`remote_path` text,
	`file_name` text NOT NULL,
	`mime_type` text,
	`size_bytes` integer,
	`is_receipt` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`server_updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `attachments_transaction_idx` ON `attachments` (`transaction_id`);--> statement-breakpoint
CREATE TABLE `installment_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`title` text NOT NULL,
	`total_amount` integer NOT NULL,
	`installment_count` integer NOT NULL,
	`first_due_date` text NOT NULL,
	`account_id` text,
	`credit_card_id` text,
	`category_id` text,
	`canceled_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`server_updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `installment_plans_owner_idx` ON `installment_plans` (`owner_id`);--> statement-breakpoint
CREATE TABLE `recurrence_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`frequency` text NOT NULL,
	`interval` integer DEFAULT 1 NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`occurrence_limit` integer,
	`auto_generate` integer DEFAULT true NOT NULL,
	`generated_until` text,
	`ended_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`server_updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `recurrence_rules_owner_idx` ON `recurrence_rules` (`owner_id`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`color` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`server_updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `tags_owner_idx` ON `tags` (`owner_id`);--> statement-breakpoint
CREATE TABLE `transaction_splits` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`transaction_id` text NOT NULL,
	`member_id` text NOT NULL,
	`method` text NOT NULL,
	`amount` integer NOT NULL,
	`percentage` integer,
	`settled_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`server_updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `transaction_splits_transaction_idx` ON `transaction_splits` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `transaction_splits_member_idx` ON `transaction_splits` (`member_id`);--> statement-breakpoint
CREATE TABLE `transaction_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`transaction_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`server_updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `transaction_tags_transaction_idx` ON `transaction_tags` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `transaction_tags_tag_idx` ON `transaction_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`household_id` text,
	`created_by` text NOT NULL,
	`kind` text NOT NULL,
	`status` text DEFAULT 'settled' NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`notes` text,
	`merchant` text,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'BRL' NOT NULL,
	`category_id` text,
	`account_id` text,
	`credit_card_id` text,
	`invoice_id` text,
	`payment_method` text,
	`date` text NOT NULL,
	`due_date` text,
	`settled_at` text,
	`transfer_group_id` text,
	`installment_plan_id` text,
	`installment_number` integer,
	`recurrence_rule_id` text,
	`paid_by_id` text,
	`is_shared` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`server_updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `transactions_owner_date_idx` ON `transactions` (`owner_id`,`date`);--> statement-breakpoint
CREATE INDEX `transactions_household_date_idx` ON `transactions` (`household_id`,`date`);--> statement-breakpoint
CREATE INDEX `transactions_account_idx` ON `transactions` (`account_id`);--> statement-breakpoint
CREATE INDEX `transactions_category_idx` ON `transactions` (`category_id`);--> statement-breakpoint
CREATE INDEX `transactions_invoice_idx` ON `transactions` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `transactions_transfer_group_idx` ON `transactions` (`transfer_group_id`);--> statement-breakpoint
CREATE INDEX `transactions_installment_plan_idx` ON `transactions` (`installment_plan_id`);--> statement-breakpoint
CREATE INDEX `transactions_recurrence_idx` ON `transactions` (`recurrence_rule_id`);--> statement-breakpoint
CREATE INDEX `transactions_status_due_idx` ON `transactions` (`status`,`due_date`);