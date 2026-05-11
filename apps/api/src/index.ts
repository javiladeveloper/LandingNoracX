import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { subscribeRoute } from './routes/subscribe';

export interface Bindings {
  DB: D1Database;
  CORS_ALLOWED_ORIGINS: string;
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
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
    credentials: false,
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

app.onError((err, c) => {
  console.error('[api] unhandled error', err);
  return c.json({ ok: false, error: 'internal_error' }, 500);
});

app.notFound((c) => c.json({ ok: false, error: 'not_found' }, 404));

export default app;
