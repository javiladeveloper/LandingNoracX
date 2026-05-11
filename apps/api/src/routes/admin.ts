import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, isNull, isNotNull, sql, and, or, like, type SQL } from 'drizzle-orm';
import { users, contactMessages, fans } from '../db/schema';
import { verifyPassword, newSessionToken, hashPassword } from '../lib/password';
import {
  resolveSession,
  createSession,
  destroySession,
  buildSessionCookie,
  buildClearCookie,
} from '../lib/session';
import type { User } from '../db/schema';
import type { Bindings } from '../index';

type Vars = {
  user: User;
  sessionId: string;
};

export const adminRoute = new Hono<{ Bindings: Bindings; Variables: Vars }>();

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

/* ============================================================
   A partir de acá, todas las rutas requieren auth.
   ============================================================ */
adminRoute.use('*', async (c, next) => {
  const auth = await resolveSession(c);
  if (!auth) return c.json({ ok: false, error: 'unauthenticated' }, 401);
  c.set('user', auth.user);
  c.set('sessionId', auth.sessionId);
  await next();
});

adminRoute.get('/contact-messages', async (c) => {
  const db = drizzle(c.env.DB);
  const limit = Math.min(Number(c.req.query('limit') ?? 100), 200);

  const data = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(limit)
    .all();

  const unreadCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(contactMessages)
    .where(isNull(contactMessages.readAt))
    .get();

  return c.json({
    ok: true,
    data,
    unreadCount: unreadCount?.count ?? 0,
  });
});

const messageActionSchema = z.object({
  action: z.enum(['mark-read', 'mark-unread', 'mark-replied', 'mark-unreplied']),
});

adminRoute.patch(
  '/contact-messages/:id',
  zValidator('json', messageActionSchema),
  async (c) => {
    const id = c.req.param('id');
    const { action } = c.req.valid('json');
    const db = drizzle(c.env.DB);

    const now = new Date();
    const updates: Record<string, Date | null> = {};
    switch (action) {
      case 'mark-read':
        updates.readAt = now;
        break;
      case 'mark-unread':
        updates.readAt = null;
        break;
      case 'mark-replied':
        updates.repliedAt = now;
        if (!updates.readAt) updates.readAt = now;
        break;
      case 'mark-unreplied':
        updates.repliedAt = null;
        break;
    }

    await db.update(contactMessages).set(updates).where(eq(contactMessages.id, id));
    return c.json({ ok: true });
  },
);

/* ============================================================
   Fans CRM
   ============================================================ */

adminRoute.get('/fans', async (c) => {
  const db = drizzle(c.env.DB);

  const q = (c.req.query('q') ?? '').trim().toLowerCase();
  const lang = c.req.query('lang');
  const country = c.req.query('country');
  const showUnsubscribed = c.req.query('include_unsubscribed') === '1';
  const limit = Math.min(Number(c.req.query('limit') ?? 200), 500);

  const conditions: SQL[] = [isNull(fans.deletedAt)];
  if (!showUnsubscribed) {
    conditions.push(isNull(fans.unsubscribedAt));
  }
  if (q) {
    const pattern = `%${q}%`;
    conditions.push(or(like(fans.email, pattern), like(fans.name, pattern)) as SQL);
  }
  if (lang === 'es' || lang === 'en') {
    conditions.push(eq(fans.language, lang));
  }
  if (country) {
    conditions.push(eq(fans.country, country.toUpperCase()));
  }

  const data = await db
    .select()
    .from(fans)
    .where(and(...conditions))
    .orderBy(desc(fans.optedInAt))
    .limit(limit)
    .all();

  // Summary global (independiente de filtros): total activos, total unsubscribed,
  // breakdown por idioma.
  const totalActive = await db
    .select({ count: sql<number>`count(*)` })
    .from(fans)
    .where(and(isNull(fans.deletedAt), isNull(fans.unsubscribedAt)))
    .get();
  const totalUnsubscribed = await db
    .select({ count: sql<number>`count(*)` })
    .from(fans)
    .where(and(isNull(fans.deletedAt), isNotNull(fans.unsubscribedAt)))
    .get();
  const byLanguage = await db
    .select({ language: fans.language, count: sql<number>`count(*)` })
    .from(fans)
    .where(and(isNull(fans.deletedAt), isNull(fans.unsubscribedAt)))
    .groupBy(fans.language)
    .all();

  return c.json({
    ok: true,
    data,
    summary: {
      totalActive: totalActive?.count ?? 0,
      totalUnsubscribed: totalUnsubscribed?.count ?? 0,
      byLanguage,
    },
  });
});
