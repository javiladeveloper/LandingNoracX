import { Hono } from 'hono';
import type { Bindings } from '../index';
import { fetchArtist } from '../lib/spotify';

export const artistImageRoute = new Hono<{ Bindings: Bindings }>();

/**
 * GET /api/artist-image — devuelve la URL de la foto del artista
 * pulleada en vivo de Spotify. Pensado para build-time de Astro:
 * cada rebuild del web pulla la foto fresca, así si el artista
 * actualiza su pic en Spotify for Artists no hay que tocar código.
 *
 * Devuelve la imagen más grande disponible (típicamente 640x640).
 * Si Spotify falla, responde con { ok: false } y el cliente decide
 * el fallback (Bio.astro mantiene un URL hardcoded como red de seguridad).
 */
artistImageRoute.get('/', async (c) => {
  try {
    const artist = await fetchArtist(c.env.SPOTIFY_CLIENT_ID, c.env.SPOTIFY_CLIENT_SECRET);
    // Spotify devuelve images ordenadas de mayor a menor.
    const best = artist.images?.[0];
    if (!best?.url) {
      return c.json({ ok: false, error: 'no_image' }, 502);
    }
    return c.json({
      ok: true,
      data: {
        url: best.url,
        width: best.width,
        height: best.height,
      },
    });
  } catch (err) {
    console.error('[artist-image] spotify fetch failed', err);
    return c.json({ ok: false, error: 'spotify_fetch_failed' }, 502);
  }
});
