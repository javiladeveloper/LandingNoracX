CREATE TABLE `contact_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`type` text NOT NULL,
	`message` text NOT NULL,
	`language` text DEFAULT 'es' NOT NULL,
	`country` text,
	`created_at` integer NOT NULL,
	`read_at` integer,
	`replied_at` integer
);
--> statement-breakpoint
CREATE INDEX `contact_type_idx` ON `contact_messages` (`type`);--> statement-breakpoint
CREATE INDEX `contact_created_idx` ON `contact_messages` (`created_at`);--> statement-breakpoint
CREATE TABLE `page_views` (
	`id` text PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`referrer` text,
	`country` text,
	`language` text,
	`session_id` text NOT NULL,
	`device_class` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `pageviews_path_idx` ON `page_views` (`path`);--> statement-breakpoint
CREATE INDEX `pageviews_session_idx` ON `page_views` (`session_id`);--> statement-breakpoint
CREATE INDEX `pageviews_created_idx` ON `page_views` (`created_at`);--> statement-breakpoint
CREATE INDEX `pageviews_country_idx` ON `page_views` (`country`);