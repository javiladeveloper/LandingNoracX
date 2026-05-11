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
