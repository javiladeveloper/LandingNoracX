import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { asc, isNull } from 'drizzle-orm';
import { quotes } from '../db/schema';
import type { Bindings } from '../index';

export const quotesPublicRoute = new Hono<{ Bindings: Bindings }>();

quotesPublicRoute.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const data = await db
    .select({
      id: quotes.id,
      textEs: quotes.textEs,
      textEn: quotes.textEn,
      sourceName: quotes.sourceName,
      sourceSlug: quotes.sourceSlug,
      order: quotes.order,
      featured: quotes.featured,
    })
    .from(quotes)
    .where(isNull(quotes.deletedAt))
    .orderBy(asc(quotes.order))
    .all();
  return c.json({ ok: true, data });
});
