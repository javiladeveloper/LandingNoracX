import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { asc, isNull, and, eq } from 'drizzle-orm';
import { songs } from '../db/schema';
import type { Bindings } from '../index';

export const songsPublicRoute = new Hono<{ Bindings: Bindings }>();

/**
 * GET /api/songs — lista pública de canciones (no eliminadas).
 * Ordenadas por trackNumber asc. Para el frontend de Astro consumir
 * en build time.
 */
songsPublicRoute.get('/', async (c) => {
  const db = drizzle(c.env.DB);

  const data = await db
    .select({
      slug: songs.slug,
      title: songs.title,
      trackNumber: songs.trackNumber,
      spotifyId: songs.spotifyId,
      youtubeId: songs.youtubeId,
      duration: songs.duration,
      genre: songs.genre,
      year: songs.year,
      featured: songs.featured,
      themesEs: songs.themesEs,
      themesEn: songs.themesEn,
      quote: songs.quote,
      lyrics: songs.lyrics,
    })
    .from(songs)
    .where(isNull(songs.deletedAt))
    .orderBy(asc(songs.trackNumber))
    .all();

  return c.json({ ok: true, data });
});

songsPublicRoute.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const db = drizzle(c.env.DB);

  const song = await db
    .select()
    .from(songs)
    .where(and(eq(songs.slug, slug), isNull(songs.deletedAt)))
    .get();

  if (!song) return c.json({ ok: false, error: 'not_found' }, 404);
  return c.json({ ok: true, data: song });
});
