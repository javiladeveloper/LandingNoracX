CREATE TABLE `songs` (
	`slug` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`track_number` integer,
	`spotify_id` text,
	`duration` text,
	`genre` text NOT NULL,
	`year` integer,
	`featured` integer DEFAULT false NOT NULL,
	`themes_es` text NOT NULL,
	`themes_en` text NOT NULL,
	`quote` text NOT NULL,
	`published_at` integer,
	`deleted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `songs_featured_idx` ON `songs` (`featured`);--> statement-breakpoint
CREATE INDEX `songs_track_number_idx` ON `songs` (`track_number`);--> statement-breakpoint
-- Seed: canciones que vivían en apps/web/src/content/songs/*.md.
-- Trasladamos a D1 como fuente única de verdad para el admin CRUD.
INSERT INTO `songs` (`slug`, `title`, `track_number`, `spotify_id`, `duration`, `genre`, `year`, `featured`, `themes_es`, `themes_en`, `quote`, `created_at`, `updated_at`) VALUES
('garras-sobre-el-ande', 'Garras sobre el Ande', 1, '6lCSivLdv0Xdgy8nTlY04O', '4:34', 'Power Metal', 2026, 1, 'Protesta contra una clase política que firma tu hambre y criminaliza al que reclama. Memoria del cholo serrano usado y descartado. Un llamado: cuando despierte el valle, va a caer el poder.', 'Protest against a political class that signs off your hunger and criminalizes anyone who pushes back. Memory of the Andean indigenous, used and discarded. A call: when the valley awakens, power will fall.', 'Cuando despierte el valle, va a caer el poder.', unixepoch(), unixepoch()),
('justicia-de-dos-caras', 'Justicia de Dos Caras', 2, NULL, NULL, 'Power Metal', 2026, 0, 'La desigualdad brutal de un sistema que pesa el oro en un lado y el sacrificio en el otro. Ricos vs pobres, corrupción al descubierto.', 'The brutal inequality of a system that weighs gold on one side and sacrifice on the other. Rich vs poor, corruption exposed.', 'Un lado pesa el oro, el otro el sacrificio. Qué peligroso ser de los olvidados.', unixepoch(), unixepoch()),
('ecos-de-ti', 'Ecos de Ti', 3, '6PTkL9licAlfHAdiFLxKVQ', NULL, 'Power Ballad', 2026, 1, 'El grito de un padre destrozado por la pérdida violenta de su hijo. Detrás del dolor íntimo, una denuncia: los que pusieron precio a una vida que no tenía precio.', 'The cry of a father shattered by the violent loss of his son. Behind the intimate grief, an accusation: those who put a price on a life that had no price.', 'Papá no te olvidó...', unixepoch(), unixepoch());
