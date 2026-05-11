import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { fans } from '../db/schema';
import type { Bindings } from '../index';

const subscribeSchema = z.object({
  email: z.string().email().max(255).toLowerCase().trim(),
  name: z.string().min(1).max(120).optional(),
  language: z.enum(['es', 'en']).default('es'),
  source: z.string().max(60).default('newsletter'),
});

export const subscribeRoute = new Hono<{ Bindings: Bindings }>();

subscribeRoute.post('/', zValidator('json', subscribeSchema), async (c) => {
  const data = c.req.valid('json');
  const db = drizzle(c.env.DB);

  const country = c.req.raw.headers.get('CF-IPCountry');

  const existing = await db
    .select()
    .from(fans)
    .where(eq(fans.email, data.email))
    .get();

  if (existing) {
    if (existing.unsubscribedAt) {
      await db
        .update(fans)
        .set({
          unsubscribedAt: null,
          optedInAt: new Date(),
          language: data.language,
          source: data.source,
        })
        .where(eq(fans.email, data.email));
      return c.json({ ok: true, status: 'reopted-in' as const });
    }
    return c.json({ ok: true, status: 'already-subscribed' as const });
  }

  await db.insert(fans).values({
    email: data.email,
    name: data.name,
    language: data.language,
    source: data.source,
    country: country ?? null,
  });

  return c.json({ ok: true, status: 'subscribed' as const }, 201);
});
