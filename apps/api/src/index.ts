import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { subscribeRoute } from './routes/subscribe';
import { contactRoute } from './routes/contact';
import { trackRoute } from './routes/track';
import { adminRoute } from './routes/admin';
import { runSpotifySnapshot } from './jobs/spotifySnapshot';

export interface Bindings {
  DB: D1Database;
  CORS_ALLOWED_ORIGINS: string;
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
}

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', logger());

app.use('*', (c, next) => {
  const origins = c.env.CORS_ALLOWED_ORIGINS.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return cors({
    origin: (incoming) => (origins.includes(incoming) ? incoming : null),
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    // Credentials true para que el admin (otro origen) pueda enviar la cookie de sesión
    credentials: true,
    maxAge: 86400,
  })(c, next);
});

app.get('/', (c) =>
  c.json({
    name: 'noracx-api',
    status: 'ok',
    docs: 'https://github.com/javiladeveloper/LandingNoracX',
  }),
);

app.get('/health', (c) => c.json({ ok: true, ts: Date.now() }));

app.route('/api/subscribe', subscribeRoute);
app.route('/api/contact', contactRoute);
app.route('/api/track', trackRoute);
app.route('/api/admin', adminRoute);

app.onError((err, c) => {
  console.error('[api] unhandled error', err);
  return c.json({ ok: false, error: 'internal_error' }, 500);
});

app.notFound((c) => c.json({ ok: false, error: 'not_found' }, 404));

/**
 * Export del worker: combina el handler HTTP (Hono app) y el handler
 * de cron triggers para que el mismo worker maneje ambos eventos.
 */
const worker: ExportedHandler<Bindings> = {
  fetch: app.fetch,
  async scheduled(event, env, ctx) {
    console.log(`[cron] triggered cron=${event.cron} scheduledTime=${event.scheduledTime}`);
    // Spotify snapshot diario (9am UTC)
    if (event.cron === '0 9 * * *') {
      ctx.waitUntil(runSpotifySnapshot(env).then(() => {}));
    }
  },
};

export default worker;
