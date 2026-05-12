CREATE TABLE `quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`text_es` text NOT NULL,
	`text_en` text NOT NULL,
	`source_name` text NOT NULL,
	`source_slug` text,
	`order` integer NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`deleted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `quotes_order_idx` ON `quotes` (`order`);--> statement-breakpoint
CREATE INDEX `quotes_source_idx` ON `quotes` (`source_slug`);--> statement-breakpoint
-- Seed: las 5 frases que vivían en apps/web/src/content/quotes.json.
-- Single source of truth ahora es D1.
INSERT INTO `quotes` (`id`, `text_es`, `text_en`, `source_name`, `source_slug`, `order`, `featured`, `created_at`, `updated_at`) VALUES
('q01-ley-no-es-ciega', '"La ley no es ciega... solo mira hacia arriba."', '"Justice is not blind... it only looks upward."', 'JUSTICIA DE DOS CARAS', 'justicia-de-dos-caras', 1, 1, unixepoch(), unixepoch()),
('q02-justicia-para-ricos', '"Justicia para los ricos: rápida, limpia, sin testigos."', '"Justice for the rich: fast, clean, no witnesses."', 'JUSTICIA DE DOS CARAS', 'justicia-de-dos-caras', 2, 0, unixepoch(), unixepoch()),
('q03-oro-y-sacrificio', '"Un lado pesa el oro, el otro el sacrificio."', '"One side weighs gold, the other weighs sacrifice."', 'JUSTICIA DE DOS CARAS', 'justicia-de-dos-caras', 3, 0, unixepoch(), unixepoch()),
('q04-oro-en-tus-venas', '"Oro en tus venas, no en tu nevera."', '"Gold in your veins, not in your fridge."', 'GARRAS SOBRE EL ANDE', 'garras-sobre-el-ande', 4, 0, unixepoch(), unixepoch()),
('q05-olvidados', '"Qué peligroso ser de los olvidados."', '"How dangerous it is to be among the forgotten."', 'JUSTICIA DE DOS CARAS', 'justicia-de-dos-caras', 5, 0, unixepoch(), unixepoch());
