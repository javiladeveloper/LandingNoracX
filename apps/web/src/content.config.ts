import { defineCollection, z, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';

const songs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/songs' }),
  schema: z.object({
    title: z.string(),
    trackNumber: z.number().int().positive(),
    spotifyId: z.string().nullable().default(null),
    duration: z.string().nullable().default(null),
    genre: z.string(),
    year: z.number().int().optional(),
    featured: z.boolean().default(false),
    themes: z.object({
      es: z.string(),
      en: z.string(),
    }),
    quote: z.string(),
    publishedAt: z.coerce.date().optional(),
  }),
});

const quotes = defineCollection({
  loader: file('src/content/quotes.json'),
  schema: z.object({
    text: z.object({
      es: z.string(),
      en: z.string(),
    }),
    source: reference('songs'),
    order: z.number().int().positive(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { songs, quotes };
