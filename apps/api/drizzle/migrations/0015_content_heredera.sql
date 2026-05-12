-- Heredera del Lodo: contenido editorial completo (youtube_id pendiente
-- de proveer por el usuario — queda NULL, se carga después via admin).
UPDATE `songs` SET
  `genre` = 'Groove Metal',
  `themes_es` = 'Retrato de la "Señora K" — una heredera del lodo político que controla fiscalías, congreso y miedo desde la penumbra. Dictadura de seda, veneno estatal: blindada en su burbuja mientras el pueblo en la calle no para de gritar.',
  `themes_en` = 'Portrait of "Mrs. K" — a political mud-heiress who controls prosecutors, congress, and fear from the shadows. Silk dictatorship, state poison: shielded in her bubble while the people in the streets do not stop shouting.',
  `quote` = 'Dictadura de seda, veneno estatal.',
  `lyrics` = '[Intro]

[Verse 1]
En las sombras del despacho, se teje la traición
Una letra que sentencia, una orden sin perdón
No da la cara al sol, prefiere la penumbra
Donde el fajo de billetes a la justicia deslumbra
Heredera de un imperio cimentado en el dolor
Lidereza de la mafia, sembradora del temor.

[Pre-Chorus]
Cero pruebas, mil favores.
Cero rostros, mil traidores.
El fiscal dobla el espinazo
Mientras tú das el hachazo.

[Chorus]
¡LA SEÑORA K!
La mano que mece la cuna del mal
¡LA SEÑORA K!
Dictadura de seda, veneno estatal.
Se está tragando el mapa, se roba el porvenir
Un país de rodillas que no dejan dormir.

[Verse 2]
Fiscalías compradas, congreso de cartón
Un banquete de buitres en cada votación.
Blindada en su burbuja, nada la puede tocar
Mientras el pueblo en la calle no para de gritar.
¿Quién es la jefa? Todos saben su nombre
Pero el miedo es el muro que silencia al hombre.

[Bridge]
¡K de Korrupción!
¡K de Kriminal!
¡K de un Karma que nunca parece llegar!
¡SÁCALA DE AQUÍ!

[Breakdown]
Justicia de dos caras...
Garras sobre el ande...
La K se marca a fuego...

[Chorus]
¡LA SEÑORA K!
La mano que mece la cuna del mal
¡LA SEÑORA K!
Dictadura de seda, veneno estatal.
Se está tragando el mapa, se roba el porvenir
Un país de rodillas que no dejan dormir.

[Outro]
Heredera del lodo...
Heredera del mal...
La letra K... es tu final.',
  `updated_at` = unixepoch()
WHERE `slug` = 'heredera-del-lodo';
