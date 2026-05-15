import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';

/**
 * Fanbase / CRM — tabla principal de suscriptores.
 * Soft delete vía deletedAt. Reopt-in detectado por unsubscribedAt != null.
 */
export const fans = sqliteTable(
  'fans',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    email: text('email').notNull().unique(),
    name: text('name'),
    country: text('country'),
    city: text('city'),
    source: text('source').notNull().default('newsletter'),
    language: text('language', { enum: ['es', 'en'] })
      .notNull()
      .default('es'),
    optedInAt: integer('opted_in_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    confirmedAt: integer('confirmed_at', { mode: 'timestamp' }),
    unsubscribedAt: integer('unsubscribed_at', { mode: 'timestamp' }),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  },
  (table) => ({
    emailIdx: index('fans_email_idx').on(table.email),
    countryIdx: index('fans_country_idx').on(table.country),
  }),
);

export type Fan = typeof fans.$inferSelect;
export type NewFan = typeof fans.$inferInsert;

/**
 * Mensajes del form de contacto.
 * type determina a qué buzón se reenvía: booking@, prensa@, contacto@.
 * Marcamos readAt y repliedAt manualmente desde el admin (Fase 3).
 */
export const contactMessages = sqliteTable(
  'contact_messages',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    name: text('name').notNull(),
    email: text('email').notNull(),
    type: text('type', { enum: ['booking', 'press', 'general', 'suggestion'] }).notNull(),
    message: text('message').notNull(),
    language: text('language', { enum: ['es', 'en'] })
      .notNull()
      .default('es'),
    country: text('country'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    readAt: integer('read_at', { mode: 'timestamp' }),
    repliedAt: integer('replied_at', { mode: 'timestamp' }),
  },
  (table) => ({
    typeIdx: index('contact_type_idx').on(table.type),
    createdIdx: index('contact_created_idx').on(table.createdAt),
  }),
);

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;

/**
 * Analytics: page views server-side, sin cookies de tracking ni terceros.
 * sessionId se genera client-side (UUID v4) y se guarda en sessionStorage.
 * Permite contar visitantes únicos por sesión sin identificar personas.
 * country viene del header CF-IPCountry (geoip).
 */
export const pageViews = sqliteTable(
  'page_views',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    path: text('path').notNull(),
    referrer: text('referrer'),
    country: text('country'),
    language: text('language'),
    sessionId: text('session_id').notNull(),
    deviceClass: text('device_class', { enum: ['mobile', 'tablet', 'desktop', 'bot', 'unknown'] }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    pathIdx: index('pageviews_path_idx').on(table.path),
    sessionIdx: index('pageviews_session_idx').on(table.sessionId),
    createdIdx: index('pageviews_created_idx').on(table.createdAt),
    countryIdx: index('pageviews_country_idx').on(table.country),
  }),
);

export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;

/**
 * Snapshots diarios de stats de Spotify del artista.
 * monthly_listeners no está disponible en la Web API pública — solo
 * vía Spotify for Artists. Capturamos lo que sí está: followers,
 * popularity (0-100 según Spotify), genres asociados.
 * El cron del worker corre todos los días a las 9am UTC.
 */
export const spotifySnapshots = sqliteTable(
  'spotify_snapshots',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    followers: integer('followers').notNull(),
    popularity: integer('popularity'),
    genres: text('genres'), // JSON array de strings serializado
    snapshotAt: integer('snapshot_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    snapshotIdx: index('spotify_snapshots_at_idx').on(table.snapshotAt),
  }),
);

export type SpotifySnapshot = typeof spotifySnapshots.$inferSelect;
export type NewSpotifySnapshot = typeof spotifySnapshots.$inferInsert;

/**
 * Usuarios del admin dashboard. passwordHash usa PBKDF2 (Web Crypto API,
 * disponible en Workers nativamente). role determina permisos en Fase 3+.
 * Usaremos 'owner' para el primer y único usuario inicial.
 */
export const users = sqliteTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: text('role', { enum: ['owner', 'editor', 'viewer'] })
      .notNull()
      .default('owner'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/**
 * Sesiones del admin. id es un token random opaco (32 bytes hex), también
 * usado como valor del cookie HttpOnly Secure. expiresAt se renueva en
 * cada request para keep-alive.
 */
export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    userAgent: text('user_agent'),
    ip: text('ip'),
  },
  (table) => ({
    userIdx: index('sessions_user_idx').on(table.userId),
    expiresIdx: index('sessions_expires_idx').on(table.expiresAt),
  }),
);

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

/**
 * Campañas de email enviadas al fanbase. Guardamos el HTML/text que se envió
 * + qué segmento se targeteó + cuándo + a cuántos. La tabla campaign_sends
 * (per-fan tracking, open/click) la agregamos en Fase 3c+ si necesitamos
 * granularidad.
 */
export const campaigns = sqliteTable(
  'campaigns',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    subject: text('subject').notNull(),
    bodyHtml: text('body_html').notNull(),
    bodyText: text('body_text').notNull(),
    segmentLang: text('segment_lang', { enum: ['es', 'en'] }),
    segmentCountry: text('segment_country'),
    sentCount: integer('sent_count').notNull().default(0),
    sentAt: integer('sent_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    createdBy: text('created_by'),
  },
  (table) => ({
    sentIdx: index('campaigns_sent_idx').on(table.sentAt),
  }),
);

export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;

/**
 * Canciones del catálogo de NORAC X. La clave primaria es el slug
 * (kebab-case del título), legible y estable. featured controla si
 * aparece en las tracks destacadas del sitio. spotifyId/duration son
 * nullable hasta que se publique en Spotify. themes son bilingues.
 * Soft delete vía deletedAt.
 */
export const songs = sqliteTable(
  'songs',
  {
    slug: text('slug').primaryKey(),
    title: text('title').notNull(),
    trackNumber: integer('track_number'),
    spotifyId: text('spotify_id'),
    youtubeId: text('youtube_id'),
    duration: text('duration'),
    genre: text('genre').notNull(),
    year: integer('year'),
    featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
    playCount: integer('play_count').notNull().default(0),
    themesEs: text('themes_es').notNull(),
    themesEn: text('themes_en').notNull(),
    quote: text('quote').notNull(),
    lyrics: text('lyrics'),
    publishedAt: integer('published_at', { mode: 'timestamp' }),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    featuredIdx: index('songs_featured_idx').on(table.featured),
    trackIdx: index('songs_track_number_idx').on(table.trackNumber),
  }),
);

export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;

/**
 * Frases del Lyrics Wall (5 líneas destacadas que rotan en home).
 * Bilingue, ordenadas por order. sourceName es display ('GARRAS SOBRE
 * EL ANDE'); sourceSlug es FK opcional a songs.slug si querés linkear
 * después. Soft delete.
 */
export const quotes = sqliteTable(
  'quotes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    textEs: text('text_es').notNull(),
    textEn: text('text_en').notNull(),
    sourceName: text('source_name').notNull(),
    sourceSlug: text('source_slug'),
    order: integer('order').notNull(),
    featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    orderIdx: index('quotes_order_idx').on(table.order),
    sourceIdx: index('quotes_source_idx').on(table.sourceSlug),
  }),
);

export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;

/**
 * Settings / Key-Value Store para configuraciones globales.
 * Usado para guardar el Teaser de Audio recortado (base64) u otras configuraciones.
 */
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
