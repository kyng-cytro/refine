DROP INDEX `user_model_prefs_session_model_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_model_prefs_global_model_unique` ON `user_model_prefs` (`model_id`) WHERE "user_model_prefs"."session_id" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `user_model_prefs_session_model_unique` ON `user_model_prefs` (`session_id`,`model_id`) WHERE "user_model_prefs"."session_id" IS NOT NULL;