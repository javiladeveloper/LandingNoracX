/**
 * Cliente mínimo de Spotify Web API usando Client Credentials flow.
 * Server-to-server, sin auth de usuario. El access token dura ~1h;
 * lo cacheamos en memoria del isolate para evitar tokens innecesarios
 * (Cloudflare Workers no garantiza isolate persistence, así que en
 * el peor caso refrescamos por request — sigue siendo barato).
 */

const ARTIST_ID = '23reXrP1oSrpgNVFHIEGk6';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_BASE = 'https://api.spotify.com/v1';

interface TokenCacheEntry {
  token: string;
  expiresAt: number; // ms epoch
}
let tokenCache: TokenCacheEntry | null = null;

interface AccessTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.token;
  }

  const basic = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Spotify token failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as AccessTokenResponse;
  tokenCache = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return data.access_token;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  followers: { total: number };
  popularity: number;
  genres: string[];
  images: Array<{ url: string; width: number; height: number }>;
}

export async function fetchArtist(
  clientId: string,
  clientSecret: string,
  artistId: string = ARTIST_ID,
): Promise<SpotifyArtist> {
  const token = await getAccessToken(clientId, clientSecret);

  const res = await fetch(`${API_BASE}/artists/${artistId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Spotify artist fetch failed: ${res.status} ${err}`);
  }

  return res.json();
}
