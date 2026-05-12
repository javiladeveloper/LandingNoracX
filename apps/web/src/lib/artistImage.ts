/**
 * Build-time fetcher de la foto del artista desde la API.
 * Memoizado a nivel módulo: durante todo el build de Astro,
 * fetcheamos una sola vez aunque varios componentes lo pidan
 * (Bio, BaseLayout en cada página, etc).
 *
 * Fallback hardcoded: si la API falla, mantenemos la foto vieja
 * conocida del CDN de Spotify para no romper renders ni previews
 * sociales.
 */

const FALLBACK_IMAGE = 'https://i.scdn.co/image/ab6761610000e5eb20ac7abb154d5ba3170c36e7';

let cached: Promise<string> | null = null;

async function fetchOnce(): Promise<string> {
  const apiUrl = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:8787';
  try {
    const res = await fetch(`${apiUrl}/api/artist-image`);
    const json = (await res.json()) as { ok: boolean; data?: { url: string } };
    if (json.ok && json.data?.url) return json.data.url;
  } catch (err) {
    console.warn('[artistImage] fetch falló, usando fallback', err);
  }
  return FALLBACK_IMAGE;
}

export function getArtistImage(): Promise<string> {
  if (!cached) cached = fetchOnce();
  return cached;
}

export const ARTIST_IMAGE_FALLBACK = FALLBACK_IMAGE;
