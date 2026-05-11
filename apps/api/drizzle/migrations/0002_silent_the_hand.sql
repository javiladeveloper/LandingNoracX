CREATE TABLE `spotify_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`followers` integer NOT NULL,
	`popularity` integer,
	`genres` text,
	`snapshot_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `spotify_snapshots_at_idx` ON `spotify_snapshots` (`snapshot_at`);