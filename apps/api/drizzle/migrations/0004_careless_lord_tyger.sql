CREATE TABLE `campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`body_html` text NOT NULL,
	`body_text` text NOT NULL,
	`segment_lang` text,
	`segment_country` text,
	`sent_count` integer DEFAULT 0 NOT NULL,
	`sent_at` integer,
	`created_at` integer NOT NULL,
	`created_by` text
);
--> statement-breakpoint
CREATE INDEX `campaigns_sent_idx` ON `campaigns` (`sent_at`);