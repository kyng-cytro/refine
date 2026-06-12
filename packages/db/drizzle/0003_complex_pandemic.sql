PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pairing_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`label` text NOT NULL,
	`used` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_pairing_tokens`("id", "token", "label", "used", "created_at", "expires_at") SELECT "id", "token", "label", "used", "created_at", "expires_at" FROM `pairing_tokens`;--> statement-breakpoint
DROP TABLE `pairing_tokens`;--> statement-breakpoint
ALTER TABLE `__new_pairing_tokens` RENAME TO `pairing_tokens`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `pairing_tokens_token_unique` ON `pairing_tokens` (`token`);