import { es } from './es';
import { en } from './en';

export const LOCALES = ['es', 'en'] as const;
export const DEFAULT_LOCALE = 'es' as const;

export type Lang = (typeof LOCALES)[number];
export type Dict = typeof es;

const dictionaries = { es, en } satisfies Record<Lang, Dict>;

export function getDict(lang: Lang): Dict {
  return dictionaries[lang];
}

export function isLang(value: string | undefined): value is Lang {
  return value === 'es' || value === 'en';
}

export function getLangFromUrl(url: URL): Lang {
  const seg = url.pathname.split('/')[1];
  return isLang(seg) ? seg : DEFAULT_LOCALE;
}

export function localizePath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === DEFAULT_LOCALE) return clean === '/' ? '/' : clean;
  if (clean === '/') return '/en';
  return `/en${clean}`;
}

export function altLang(lang: Lang): Lang {
  return lang === 'es' ? 'en' : 'es';
}
