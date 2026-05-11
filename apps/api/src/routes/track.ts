import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { pageViews } from '../db/schema';
import type { Bindings } from '../index';

const trackSchema = z.object({
  path: z.string().min(1).max(255),
  referrer: z.string().max(500).optional(),
  sessionId: z.string().min(8).max(64),
  language: z.string().max(8).optional(),
});

type DeviceClass = 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown';

/**
 * Clasificación simplificada de user-agent. No usamos una librería completa
 * porque no necesitamos precisión clínica — agregados por mobile/desktop alcanzan.
 */
function classifyUserAgent(ua: string | null): DeviceClass {
  if (!ua) return 'unknown';
  const lower = ua.toLowerCase();
  if (/bot|crawler|spider|crawling|curl|wget|httpie/.test(lower)) return 'bot';
  if (/ipad|tablet/.test(lower)) return 'tablet';
  if (/mobi|android.*mobile|iphone/.test(lower)) return 'mobile';
  return 'desktop';
}

export const trackRoute = new Hono<{ Bindings: Bindings }>();

trackRoute.post('/', zValidator('json', trackSchema), async (c) => {
  const data = c.req.valid('json');

  const ua = c.req.raw.headers.get('User-Agent');
  const deviceClass = classifyUserAgent(ua);

  // Ignoramos bots para no contaminar las estadísticas.
  if (deviceClass === 'bot') {
    return c.json({ ok: true, status: 'ignored-bot' as const });
  }

  const country = c.req.raw.headers.get('CF-IPCountry');
  const db = drizzle(c.env.DB);

  // Insertamos fire-and-forget para no bloquear el cliente.
  const insertPromise = db
    .insert(pageViews)
    .values({
      path: data.path,
      referrer: data.referrer ?? null,
      country: country ?? null,
      language: data.language ?? null,
      sessionId: data.sessionId,
      deviceClass,
    })
    .run()
    .catch((err) => console.error('[track] insert failed', err));

  c.executionCtx.waitUntil(insertPromise);

  return c.json({ ok: true });
});
