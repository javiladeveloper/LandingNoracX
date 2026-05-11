CREATE TABLE `fans` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`country` text,
	`city` text,
	`source` text DEFAULT 'newsletter' NOT NULL,
	`language` text DEFAULT 'es' NOT NULL,
	`opted_in_at` integer NOT NULL,
	`confirmed_at` integer,
	`unsubscribed_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fans_email_unique` ON `fans` (`email`);--> statement-breakpoint
CREATE INDEX `fans_email_idx` ON `fans` (`email`);--> statement-breakpoint
CREATE INDEX `fans_country_idx` ON `fans` (`country`);