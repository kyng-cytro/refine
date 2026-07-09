CREATE TABLE `usage` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text,
	`history_id` text,
	`model` text NOT NULL,
	`tone` text NOT NULL,
	`tokens` text,
	`cost` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`history_id`) REFERENCES `history`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `usage` (`id`, `session_id`, `history_id`, `model`, `tone`, `tokens`, `created_at`)
SELECT lower(hex(randomblob(16))), `session_id`, `id`,
	json_object('id', `model_id`, 'label', `model_id`, 'provider', ''),
	json_object('slug', `tone_slug`, 'name', `tone_slug`),
	json_object('total', `total_tokens`, 'input', `input_tokens`, 'output', `output_tokens`),
	`created_at`
FROM `history`;--> statement-breakpoint
ALTER TABLE `history` DROP COLUMN `input_tokens`;--> statement-breakpoint
ALTER TABLE `history` DROP COLUMN `output_tokens`;--> statement-breakpoint
ALTER TABLE `history` DROP COLUMN `total_tokens`;