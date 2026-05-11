-- Update: agrega Spotify ID a Justicia de Dos Caras y la marca como featured.
UPDATE `songs` SET
  `spotify_id` = '5AFvN2ZXTdaPEdaE1MDfNB',
  `featured` = 1,
  `updated_at` = unixepoch()
WHERE `slug` = 'justicia-de-dos-caras';

--> statement-breakpoint
-- Insert: 5 canciones nuevas del catálogo Spotify. Themes/quote son
-- placeholder editorial que se actualizan desde el admin (Songs page).
INSERT INTO `songs` (`slug`, `title`, `track_number`, `spotify_id`, `duration`, `genre`, `year`, `featured`, `themes_es`, `themes_en`, `quote`, `created_at`, `updated_at`) VALUES
('secreto-antigua', 'Secreto Antigua', 4, '5Salw3mSy5eXvHnbFLjsME', NULL, 'Power Metal', 2026, 1, 'Próximamente: contenido editorial de esta canción.', 'Coming soon: editorial content for this song.', 'Secreto Antigua', unixepoch(), unixepoch()),
('zumba-zumba', '¡ZUMBA! ¡ZUMBA!', 5, '6nG64EoewmNhShL9z1tO03', NULL, 'Power Metal', 2026, 1, 'Próximamente: contenido editorial de esta canción.', 'Coming soon: editorial content for this song.', '¡ZUMBA! ¡ZUMBA!', unixepoch(), unixepoch()),
('y-que-gane', '¿Y Qué Gané?', 6, '5b2ssqkRv3WPeZMKsMAAnK', NULL, 'Power Metal', 2026, 1, 'Próximamente: contenido editorial de esta canción.', 'Coming soon: editorial content for this song.', '¿Y Qué Gané?', unixepoch(), unixepoch()),
('vestido-de-victima', 'Vestido de Victima', 7, '7dCpmrgrYzNchcPvmYIZge', NULL, 'Power Metal', 2026, 1, 'Próximamente: contenido editorial de esta canción.', 'Coming soon: editorial content for this song.', 'Vestido de Victima', unixepoch(), unixepoch()),
('heredera-del-lodo', 'Heredera del Lodo', 8, '2l0Uz4w2E7AjbUoPBr8a5M', NULL, 'Power Metal', 2026, 1, 'Próximamente: contenido editorial de esta canción.', 'Coming soon: editorial content for this song.', 'Heredera del Lodo', unixepoch(), unixepoch());
