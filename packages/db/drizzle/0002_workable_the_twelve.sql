ALTER TABLE `history` ADD `is_private` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `history` ADD `input_tokens` integer;--> statement-breakpoint
ALTER TABLE `history` ADD `output_tokens` integer;--> statement-breakpoint
ALTER TABLE `history` ADD `total_tokens` integer;