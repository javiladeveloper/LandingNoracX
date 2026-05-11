import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { fans } from '../db/schema';
import { renderWelcomeEmail, sendEmail } from '../lib/email';
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

      await sendWelcomeAsync(c.executionCtx, c.env, data.email, data.language);

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

  await sendWelcomeAsync(c.executionCtx, c.env, data.email, data.language);

  return c.json({ ok: true, status: 'subscribed' as const }, 201);
});

/**
 * Envía el welcome email sin bloquear la respuesta al cliente.
 * waitUntil() le dice al Worker que mantenga el isolate vivo hasta que
 * la promesa resuelva. Si Resend tarda 1-2s, el usuario no espera.
 */
function sendWelcomeAsync(
  ctx: ExecutionContext,
  env: Bindings,
  email: string,
  lang: 'es' | 'en',
): Promise<void> {
  const { subject, html, text } = renderWelcomeEmail({ email, lang });
  const promise = sendEmail({
    apiKey: env.RESEND_API_KEY,
    from: env.EMAIL_FROM,
    to: email,
    subject,
    html,
    text,
  })
    .then((res) => {
      if (!res.ok) console.error('[subscribe] welcome email failed', email, res.error);
    })
    .catch((err) => console.error('[subscribe] welcome email exception', email, err));

  ctx.waitUntil(promise);
  return promise;
}
