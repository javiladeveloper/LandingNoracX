-- ¿Y Qué Gané?: contenido editorial completo.
UPDATE `songs` SET
  `youtube_id` = 'O6igugIzw04',
  `genre` = 'Thrash Metal',
  `themes_es` = 'El reverso amargo del que jugó limpio en un sistema podrido: el que nunca robó, nunca mintió, y se quedó con las manos vacías mientras los corruptos llegaban arriba. La honestidad no paga el pan; la verdad acá no vale nada.',
  `themes_en` = 'The bitter underside of the one who played fair in a rotten system: the one who never stole, never lied, and ended up empty-handed while the corrupt rose to the top. Honesty does not pay the bread; truth here is worth nothing.',
  `quote` = 'Fui honesto toda mi vida... ¡Y mira dónde estás!',
  `lyrics` = '[Intro]

[Verse 1]
Manos limpias en un mundo podrido
Nunca robé, nunca mentí
Mientras todos se llenaban los bolsillos
Yo seguía aquí, de pie

[Verse 2]
Vi a los ratas trepar hasta arriba
Vi a los corruptos ganar
Yo me quedé con mi verdad vacía
Sin nada más que mi dignidad

[Chorus]
Fui honesto toda mi vida...

¡Y MIRA DÓNDE ESTÁS!

Con las manos vacías...

¡SIN NADA!

[Verse 3]
No me vendí, no me arrodillé
No firmé pactos con la oscuridad
Pero el sistema no perdona
Al que no sabe robar

[Chorus]
Fui honesto toda mi vida...

¡Y MIRA DÓNDE ESTÁS!

Con las manos vacías...

¡SIN NADA!

[Bridge]
Dicen que el honesto duerme tranquilo
Pero yo no duermo nada
Porque la honestidad no paga el pan
Y la verdad aquí no vale nada

[Chorus Final]
Fui honesto... toda mi vida...

¡Y MIRA DÓNDE ESTÁS!

¡CON LAS MANOS VACÍAS!

¡SIN NADA!

[Outro]
¡NADA! ¡NADA! ¡NADA!',
  `updated_at` = unixepoch()
WHERE `slug` = 'y-que-gane';
