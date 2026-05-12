-- Secreto Antiguo: contenido editorial + rename de slug/title.
-- Nombre original "Secreto Antigua" era typo; el correcto es "Secreto Antiguo".
UPDATE `songs` SET
  `slug` = 'secreto-antiguo',
  `title` = 'Secreto Antiguo',
  `genre` = 'Alternative Metal',
  `themes_es` = 'Carta de un padre a su hijo aún no nacido — un secreto que solo él escucha mientras todos duermen. Industrial pesado con piano íntimo y duetos: promesa de defensa, miedo a no ser suficiente, y el alivio de saber que ya no se está solo. La canción más personal de NORAC X.',
  `themes_en` = 'A letter from a father to his unborn child — a secret only he can hear while everyone else sleeps. Heavy industrial wrapped around intimate piano and duets: a vow to defend, the fear of not being enough, and the relief of no longer being alone. The most personal song in the NORAC X catalogue.',
  `quote` = 'Te defenderé del viento, te defenderé del fuego, te defenderé del mundo, aunque me cueste el cielo.',
  `lyrics` = '[Intro]
[piano, pads atmosféricos]

[Verse 1]
Tres de la mañana
Ella duerme
Y yo no
[guitarra distorsionada entra, cuerdas orquestales]

[Verse 2]
Vuelves cuando el mundo calla
Cuando el silencio es absoluto
Tu voz no viene de afuera
Viene de un lugar más profundo
Nadie sabe que existes
Nadie sabe que te escucho
Eres mi secreto antiguo
Eres mi pecado puro

[Pre-Chorus]
Háblame otra vez
Háblame en la sombra, háblame
Que nadie sepa

[Chorus]
Te defenderé del viento
Te defenderé del fuego
Te defenderé del mundo
Aunque me cueste el cielo

[Verse 3]
No tengo nombre todavía
No tengo cara, no tengo voz
Pero conozco tu latido
Mejor que el mío, mejor que el de Dios

[Pre-Chorus 2]
Háblame bajito
No la despiertes
Ella no entendería
Lo que tú y yo sabemos

[Chorus 2]
Espérame en la luz
Espérame del otro lado
Yo llegaré pronto
Y tú estarás esperando
Te defenderé del viento
Me defenderás del fuego
Te defenderé del mundo
Aunque cueste el cielo entero

[Bridge]
Y si no soy suficiente
Y si la sombra te alcanza primero
Tu sombra no es mi enemiga
Tu sombra será mi cuna
Lo oscuro que tú cargas
Me convertirá en armadura

[Instrumental Break]

[Chorus 3]
Cuando rompas el silencio
Con tu primer llanto al aire
Yo seré la primera mano
Que te sostenga mi sangre
Cuando el mundo te enseñe
A tener miedo de la noche
Yo seré la sombra antigua
Que jamás te abandone

[Outro]
Espérame tranquilo
Padre
Yo te esperaré aquí dentro
Nueve lunas más
Y romperé este silencio

¡Defiéndeme del viento!
¡Te defenderé del viento!
¡Defiéndeme del fuego!
¡Te defenderé del fuego!
¡Defiéndeme del mundo!
¡Te defenderé del mundo!
Aunque cueste el cielo entero

Te guardaré en mi sombra
Te cuidaré con mi acero
Te llevaré en mi pecho
Hasta mi último latido

Duerme, mi luna
Duerme, papá
Ya somos tres
Ya no estás solo',
  `updated_at` = unixepoch()
WHERE `slug` = 'secreto-antigua';
