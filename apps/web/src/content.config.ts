import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

// Las canciones vivían acá pero migraron a D1 (apps/api). Ahora el
// frontend las fetchea de /api/songs en build time. Solo quedan quotes
// como content collection (5 entries cortos, no necesitan admin CRUD).

const quotes = defineCollection({
  loader: file('src/content/quotes.json'),
  schema: z.object({
    text: z.object({
      es: z.string(),
      en: z.string(),
    }),
    sourceName: z.string(),
    order: z.number().int().positive(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { quotes };
