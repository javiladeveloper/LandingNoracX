import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import { verifyPassword, newSessionToken, hashPassword } from '../lib/password';
import {
  resolveSession,
  createSession,
  destroySession,
  buildSessionCookie,
  buildClearCookie,
} from '../lib/session';
import type { Bindings } from '../index';

export const adminRoute = new Hono<{ Bindings: Bindings }>();

const loginSchema = z.object({
  email: z.string().email().max(255).toLowerCase().trim(),
  password: z.string().min(6).max(200),
});

adminRoute.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  const db = drizzle(c.env.DB);

  const user = await db.select().from(users).where(eq(users.email, email)).get();
  if (!user) {
    return c.json({ ok: false, error: 'invalid_credentials' }, 401);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return c.json({ ok: false, error: 'invalid_credentials' }, 401);
  }

  const token = newSessionToken();
  await createSession(c, user.id, token);

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  c.header('Set-Cookie', buildSessionCookie(token));
  return c.json({
    ok: true,
    user: { id: user.id, email: user.email, role: user.role },
  });
});

adminRoute.get('/me', async (c) => {
  const auth = await resolveSession(c);
  if (!auth) return c.json({ ok: false, error: 'unauthenticated' }, 401);
  return c.json({
    ok: true,
    user: {
      id: auth.user.id,
      email: auth.user.email,
      role: auth.user.role,
    },
  });
});

adminRoute.post('/logout', async (c) => {
  const auth = await resolveSession(c);
  if (auth) {
    await destroySession(c, auth.sessionId);
  }
  c.header('Set-Cookie', buildClearCookie());
  return c.json({ ok: true });
});

/**
 * Bootstrap del primer admin user. Solo funciona si no existe ningún usuario.
 * Protege contra creación arbitraria después del setup inicial.
 * En producción usá este endpoint UNA VEZ para crear tu cuenta y después
 * cualquier creación adicional pasa por el admin UI (Fase 3b+).
 */
const setupSchema = z.object({
  email: z.string().email().max(255).toLowerCase().trim(),
  password: z.string().min(10).max(200),
});

adminRoute.post('/setup', zValidator('json', setupSchema), async (c) => {
  const db = drizzle(c.env.DB);

  const existing = await db.select({ id: users.id }).from(users).limit(1).all();
  if (existing.length > 0) {
    return c.json({ ok: false, error: 'setup_already_done' }, 403);
  }

  const { email, password } = c.req.valid('json');
  const passwordHash = await hashPassword(password);

  await db.insert(users).values({
    email,
    passwordHash,
    role: 'owner',
  });

  return c.json({ ok: true, message: 'owner_created' }, 201);
});
