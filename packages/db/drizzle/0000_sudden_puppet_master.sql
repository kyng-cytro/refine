CREATE TABLE `pairing_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`label` text NOT NULL,
	`used` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pairing_tokens_token_unique` ON `pairing_tokens` (`token`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`pairing_token_id` text NOT NULL,
	`device_name` text NOT NULL,
	`session_token` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer,
	FOREIGN KEY (`pairing_token_id`) REFERENCES `pairing_tokens`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_session_token_unique` ON `sessions` (`session_token`);--> statement-breakpoint
CREATE TABLE `history` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`source` text NOT NULL,
	`refined` text NOT NULL,
	`model_id` text NOT NULL,
	`tone_slug` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tones` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`instructions` text NOT NULL,
	`is_global` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tones_session_slug_unique` ON `tones` (`session_id`,`slug`);--> statement-breakpoint
CREATE TABLE `providers` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`api_key` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `providers_provider_unique` ON `providers` (`provider`);--> statement-breakpoint
CREATE TABLE `user_model_prefs` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text,
	`model_id` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_model_prefs_session_model_unique` ON `user_model_prefs` (`session_id`,`model_id`) WHERE "user_model_prefs"."session_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `user_model_prefs_global_model_unique` ON `user_model_prefs` (`model_id`) WHERE "user_model_prefs"."session_id" IS NULL;