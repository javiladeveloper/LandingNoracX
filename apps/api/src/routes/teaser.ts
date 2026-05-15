import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { settings } from '../db/schema';
import type { Bindings } from '../index';

export const teaserRoute = new Hono<{ Bindings: Bindings }>();

teaserRoute.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  
  const setting = await db.select().from(settings).where(eq(settings.key, 'teaser_audio')).get();
  
  if (!setting || !setting.value) {
    return c.json({ ok: false, error: 'not_found' }, 404);
  }

  const base64Data = setting.value;
  
  // Format: "data:audio/mpeg;base64,....."
  const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    return c.json({ ok: false, error: 'invalid_format' }, 500);
  }

  const contentType = matches[1] || 'audio/mpeg';
  const base64String = matches[2] || '';

  // Convert base64 to Uint8Array
  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return c.body(bytes.buffer, 200, {
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=3600',
    'Accept-Ranges': 'bytes'
  });
});
