import { drizzle } from 'drizzle-orm/d1';
import { spotifySnapshots } from '../db/schema';
import { fetchArtist } from '../lib/spotify';
import type { Bindings } from '../index';

/**
 * Job que corre vía cron diario (9am UTC) o on-demand desde el admin endpoint.
 * Pega a Spotify Web API, captura followers/popularity/genres del artista,
 * y persiste un snapshot en D1.
 */
export async function runSpotifySnapshot(env: Bindings): Promise<{
  ok: boolean;
  followers?: number;
  popularity?: number;
  error?: string;
}> {
  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET) {
    console.error('[spotifySnapshot] missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET');
    return { ok: false, error: 'missing_credentials' };
  }

  try {
    const artist = await fetchArtist(env.SPOTIFY_CLIENT_ID, env.SPOTIFY_CLIENT_SECRET);
    const db = drizzle(env.DB);

    await db.insert(spotifySnapshots).values({
      followers: artist.followers.total,
      popularity: artist.popularity,
      genres: JSON.stringify(artist.genres),
    });

    console.log(
      `[spotifySnapshot] snapshot saved — followers: ${artist.followers.total}, popularity: ${artist.popularity}`,
    );

    return {
      ok: true,
      followers: artist.followers.total,
      popularity: artist.popularity,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[spotifySnapshot] failed', message);
    return { ok: false, error: message };
  }
}
