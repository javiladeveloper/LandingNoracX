import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { contactMessages } from '../db/schema';
import { renderContactNotification, sendEmail } from '../lib/email';
import type { Bindings } from '../index';

const TO_BY_TYPE = {
  booking: 'booking@noracx.com',
  press: 'prensa@noracx.com',
  general: 'contacto@noracx.com',
} as const;

const contactSchema = z.object({
  name: z.string().min(1).max(120).trim(),
  email: z.string().email().max(255).toLowerCase().trim(),
  type: z.enum(['booking', 'press', 'general']),
  message: z.string().min(5).max(4000).trim(),
  language: z.enum(['es', 'en']).default('es'),
  // Honeypot anti-spam: si el bot llena este campo, lo ignoramos silenciosamente.
  // El field se renderiza oculto (hidden) en el HTML.
  website: z.string().max(0).optional(),
});

export const contactRoute = new Hono<{ Bindings: Bindings }>();

contactRoute.post('/', zValidator('json', contactSchema), async (c) => {
  const data = c.req.valid('json');

  // Honeypot disparado → respondemos OK para no revelarle al bot que lo detectamos.
  if (data.website) {
    return c.json({ ok: true, status: 'received' as const });
  }

  const db = drizzle(c.env.DB);
  const country = c.req.raw.headers.get('CF-IPCountry');

  await db.insert(contactMessages).values({
    name: data.name,
    email: data.email,
    type: data.type,
    message: data.message,
    language: data.language,
    country: country ?? null,
  });

  const { subject, html, text } = renderContactNotification({
    name: data.name,
    email: data.email,
    type: data.type,
    message: data.message,
    language: data.language,
    country: country ?? null,
  });

  const sendPromise = sendEmail({
    apiKey: c.env.RESEND_API_KEY,
    from: c.env.EMAIL_FROM,
    to: TO_BY_TYPE[data.type],
    subject,
    html,
    text,
    replyTo: data.email,
  })
    .then((res) => {
      if (!res.ok) console.error('[contact] notify email failed', data.type, res.error);
    })
    .catch((err) => console.error('[contact] notify email exception', data.type, err));

  c.executionCtx.waitUntil(sendPromise);

  return c.json({ ok: true, status: 'received' as const }, 201);
});
