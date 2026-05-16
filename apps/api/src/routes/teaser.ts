import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { settings } from '../db/schema';
import type { Bindings } from '../index';

export const teaserRoute = new Hono<{ Bindings: Bindings }>();

teaserRoute.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  
  const countSetting = await db.select().from(settings).where(eq(settings.key, 'teaser_audio_count')).get();
  
  if (!countSetting || !countSetting.value) {
    return c.json({ ok: false, error: 'not_found' }, 404);
  }

  const chunkCount = parseInt(countSetting.value, 10);
  let base64Data = '';

  for (let i = 0; i < chunkCount; i++) {
    const chunk = await db.select().from(settings).where(eq(settings.key, `teaser_audio_${i}`)).get();
    if (chunk && chunk.value) {
      base64Data += chunk.value;
    }
  }

  // Format: "data:audio/webm;base64,....." or "data:audio/mp4;base64,....."
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
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Accept-Ranges': 'bytes'
  });
});
