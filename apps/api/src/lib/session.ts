import type { Context } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, gt } from 'drizzle-orm';
import { sessions, users, type User } from '../db/schema';
import type { Bindings } from '../index';

export const COOKIE_NAME = 'nx_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 días

export interface AuthContext {
  user: User;
  sessionId: string;
}

/**
 * Resuelve la sesión actual desde el cookie. Devuelve null si:
 * - no hay cookie
 * - el token no matchea ninguna fila
 * - la sesión está expirada
 * - el user al que pertenece la sesión ya no existe
 */
export async function resolveSession(c: Context<{ Bindings: Bindings }>): Promise<AuthContext | null> {
  const cookieHeader = c.req.header('Cookie') ?? '';
  const match = cookieHeader.split(';').find((s) => s.trim().startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  const token = match.split('=')[1]?.trim();
  if (!token) return null;

  const db = drizzle(c.env.DB);
  const now = new Date();

  const row = await db
    .select({
      sessionId: sessions.id,
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, now)))
    .get();

  if (!row) return null;
  return { user: row.user, sessionId: row.sessionId };
}

export async function createSession(
  c: Context<{ Bindings: Bindings }>,
  userId: string,
  sessionToken: string,
): Promise<void> {
  const db = drizzle(c.env.DB);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({
    id: sessionToken,
    userId,
    expiresAt,
    userAgent: c.req.header('User-Agent') ?? null,
    ip: c.req.header('CF-Connecting-IP') ?? null,
  });
}

export async function destroySession(
  c: Context<{ Bindings: Bindings }>,
  sessionId: string,
): Promise<void> {
  const db = drizzle(c.env.DB);
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export function buildSessionCookie(token: string): string {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function buildClearCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
