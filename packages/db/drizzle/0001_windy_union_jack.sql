ALTER TABLE `pairing_tokens` ADD `device_type` text DEFAULT 'mobile' NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` ADD `device_type` text DEFAULT 'mobile' NOT NULL;