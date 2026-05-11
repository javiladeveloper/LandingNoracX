/**
 * Hash y verify de contraseñas usando PBKDF2 con Web Crypto API.
 * PBKDF2 es lo que tenemos nativo en Workers sin WASM. 600k iteraciones
 * SHA-256 (OWASP recomienda 600k para SHA-256 en 2023+). Salt aleatorio
 * de 16 bytes. Output: "pbkdf2$<iterations>$<salt-hex>$<hash-hex>".
 */

const ITERATIONS = 600_000;
const KEY_LEN = 32; // bytes
const HASH_NAME = 'SHA-256';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function deriveBits(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const passKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: HASH_NAME,
      salt: salt as BufferSource,
      iterations,
    },
    passKey,
    KEY_LEN * 8,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveBits(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${toHex(salt)}$${toHex(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = parseInt(parts[1] ?? '0', 10);
  const salt = fromHex(parts[2] ?? '');
  const expected = fromHex(parts[3] ?? '');
  if (!iterations || !salt.length || !expected.length) return false;

  const actual = await deriveBits(password, salt, iterations);

  // Comparación constant-time para evitar timing attacks
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) {
    diff |= (actual[i] ?? 0) ^ (expected[i] ?? 0);
  }
  return diff === 0;
}

/** Genera un token de sesión aleatorio (32 bytes hex = 64 chars). */
export function newSessionToken(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(32)));
}
