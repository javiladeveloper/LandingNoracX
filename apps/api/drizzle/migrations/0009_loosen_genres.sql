-- Las 5 canciones seedeadas tenían 'Power Metal' como placeholder.
-- Las paso a 'Metal' genérico hasta que el usuario las ajuste desde
-- admin con el subgénero real de cada una (groove, alternative,
-- doom, industrial, ballad, etc).
UPDATE `songs` SET `genre` = 'Metal', `updated_at` = unixepoch()
WHERE `slug` IN (
  'secreto-antigua',
  'zumba-zumba',
  'y-que-gane',
  'vestido-de-victima',
  'heredera-del-lodo'
);
