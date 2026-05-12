-- Justicia de Dos Caras: contenido editorial completo.
UPDATE `songs` SET
  `youtube_id` = 'rDpNnl7e9Rk',
  `genre` = 'Epic Power Metal',
  `themes_es` = 'Dos sistemas de justicia bajo el mismo techo: para el rico, rápida, limpia, sin testigos; para el pobre, lenta, sorda, con años perdidos. La balanza no está rota — tiene un dueño fijo.',
  `themes_en` = 'Two justice systems under the same roof: fast, clean, no witnesses for the rich; slow, deaf, with years lost for the poor. The scale is not broken — it has a fixed owner.',
  `quote` = 'La balanza no está rota, es que tiene un dueño fijo.',
  `lyrics` = '[Verse 1]
Señor del traje caro
llegó un papel "culpable",
pero en su club privado
la culpa es descartable.

A la par, en el suburbio,
un padre busca un abogado,
mientras el sistema turbio
ya lo tiene sentenciado.

[Chorus]
Justicia para los ricos:
rápida, limpia, sin testigos.
Se lava todo con cheques bonitos,
qué conveniente ser de los "benditos".

Justicia para el de abajo:
lenta, sorda, un gran trabajo.
Se paga el precio con años perdidos,
qué peligroso ser de los "olvidados".

[Verse 2]
Vecina pierde casa
por una deuda mínima,
él defraudó un país entero
y sale en la revista.

Juez que mira hacia arriba
ve billetes, no ve caras;
si no hay plata en la tarifa,
la ley te clava sus garras.

[Bridge]
Uno duerme en su mansión, bajo fianza y libertad,
el otro en un callejón, esperando una piedad.
La balanza no está rota, es que tiene un dueño fijo:
un lado pesa el oro, el otro el sacrificio.

[Chorus]
Justicia para los ricos:
rápida, limpia, sin testigos.
Se lava todo con cheques bonitos,
qué conveniente ser de los "benditos".',
  `updated_at` = unixepoch()
WHERE `slug` = 'justicia-de-dos-caras';
