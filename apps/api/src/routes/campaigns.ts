import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { and, desc, eq, isNull, sql, type SQL } from 'drizzle-orm';
import { campaigns, fans } from '../db/schema';
import { resolveSession } from '../lib/session';
import type { Bindings } from '../index';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const campaignsRoute = new Hono<{ Bindings: Bindings; Variables: any }>();

// Middleware auth para todas las rutas de este sub-router
campaignsRoute.use('*', async (c, next) => {
  const auth = await resolveSession(c);
  if (!auth) return c.json({ ok: false, error: 'unauthenticated' }, 401);
  await next();
});

const segmentSchema = z.object({
  lang: z.enum(['es', 'en']).optional(),
  country: z
    .string()
    .min(2)
    .max(2)
    .transform((s) => s.toUpperCase())
    .optional(),
});

function buildSegmentConditions(segment: { lang?: 'es' | 'en'; country?: string }): SQL[] {
  const conditions: SQL[] = [
    isNull(fans.deletedAt),
    isNull(fans.unsubscribedAt),
  ];
  if (segment.lang) conditions.push(eq(fans.language, segment.lang));
  if (segment.country) conditions.push(eq(fans.country, segment.country));
  return conditions;
}

campaignsRoute.post('/preview', zValidator('json', segmentSchema), async (c) => {
  const segment = c.req.valid('json');
  const db = drizzle(c.env.DB);
  const conditions = buildSegmentConditions(segment);

  const count = await db
    .select({ count: sql<number>`count(*)` })
    .from(fans)
    .where(and(...conditions))
    .get();

  const sample = await db
    .select({ email: fans.email, name: fans.name })
    .from(fans)
    .where(and(...conditions))
    .limit(5)
    .all();

  return c.json({ ok: true, recipients: count?.count ?? 0, sample });
});

const sendSchema = z.object({
  subject: z.string().min(1).max(200),
  bodyHtml: z.string().min(10).max(50_000),
  bodyText: z.string().min(10).max(50_000),
  segment: segmentSchema,
});

interface ResendBatchItem {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

campaignsRoute.post('/send', zValidator('json', sendSchema), async (c) => {
  const { subject, bodyHtml, bodyText, segment } = c.req.valid('json');
  const db = drizzle(c.env.DB);
  const auth = await resolveSession(c); // ya validado por middleware, lo re-resuelvo para tener user
  const conditions = buildSegmentConditions(segment);

  const recipients = await db
    .select({ id: fans.id, email: fans.email })
    .from(fans)
    .where(and(...conditions))
    .all();

  if (recipients.length === 0) {
    return c.json({ ok: false, error: 'empty_segment' }, 400);
  }

  // Resend permite hasta 100 emails por batch. Si crecemos más, chunkeamos.
  const BATCH_SIZE = 100;
  let sentCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const chunk = recipients.slice(i, i + BATCH_SIZE);
    const batch: ResendBatchItem[] = chunk.map((r) => ({
      from: c.env.EMAIL_FROM,
      to: r.email,
      subject,
      html: bodyHtml,
      text: bodyText,
    }));

    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batch),
    });

    if (!res.ok) {
      const errBody = await res.text();
      errors.push(`batch ${i}-${i + chunk.length}: ${res.status} ${errBody}`);
      continue;
    }
    sentCount += chunk.length;
  }

  await db.insert(campaigns).values({
    subject,
    bodyHtml,
    bodyText,
    segmentLang: segment.lang ?? null,
    segmentCountry: segment.country ?? null,
    sentAt: new Date(),
    sentCount,
    createdBy: auth?.user.id ?? null,
  });

  return c.json({
    ok: errors.length === 0,
    sentCount,
    targeted: recipients.length,
    errors,
  });
});

campaignsRoute.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const data = await db
    .select({
      id: campaigns.id,
      subject: campaigns.subject,
      segmentLang: campaigns.segmentLang,
      segmentCountry: campaigns.segmentCountry,
      sentCount: campaigns.sentCount,
      sentAt: campaigns.sentAt,
      createdAt: campaigns.createdAt,
    })
    .from(campaigns)
    .orderBy(desc(campaigns.createdAt))
    .limit(50)
    .all();
  return c.json({ ok: true, data });
});
