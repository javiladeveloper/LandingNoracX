-- Ecos de Ti: contenido editorial completo.
UPDATE `songs` SET
  `youtube_id` = 'tC8jy5xGtxs',
  `genre` = 'Power Ballad',
  `themes_es` = 'El grito de un padre por la pérdida violenta de su hijo. Detrás del dolor íntimo, la denuncia: los que jugaron con su vida como ficha de ajedrez, los que pusieron precio a lo que no tiene precio.',
  `themes_en` = 'A father''s cry over the violent loss of his son. Behind the intimate grief, the accusation: those who played with his life like a chess piece, those who put a price on what has no price.',
  `quote` = 'Papá no te olvidó...',
  `lyrics` = '[Verse 1]
Tu cuarto sigue igual
Tu ropa en el sillón
El eco de tu risa
Aún vive en mi voz

[Verse 2]
Guardé tus primeros pasos
En un rincón de mí
Pero el último suspiro
No me dejaron sentir

[Chorus]
Y te busco...
En cada amanecer
Y te llamo...
Pero no puedes volver
Te arrancaron de mis brazos
Yo aun te escucho correr

[Bridge]
Alguien jugó con tu vida
Como ficha de ajedrez
Alguien puso precio
A lo que no tiene precio

[Chorus]
Y te busco...
En cada amanecer
Y te llamo...
Pero no puedes volver
Te arrancaron de mis brazos
Antes de poderte ver

[Outro]
Hijo...
Donde quiera que estés...
Papá no te olvidó...',
  `updated_at` = unixepoch()
WHERE `slug` = 'ecos-de-ti';
