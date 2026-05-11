# NORAC X — Plataforma Web + CRM

> Este archivo es contexto para Claude Code. Léelo completo antes de tocar cualquier código del repo.

---

## Identidad del proyecto

**NORAC X** es un proyecto de metal peruano de protesta nacido en Tacna, Perú en 2026. Vocalista único anónimo, sin rostro, sin entrevistas. Sonido power metal con sangre política. Influencias: Rage Against the Machine, System of a Down, Molotov.

- **Dominio:** noracx.com (registrado en Cloudflare)
- **Spotify artist ID:** `23reXrP1oSrpgNVFHIEGk6`
- **Spotify URL:** https://open.spotify.com/artist/23reXrP1oSrpgNVFHIEGk6
- **YouTube:** https://youtube.com/@Norac_X
- **TikTok:** @norac_x
- **Instagram:** @norac_x
- **Repo:** https://github.com/javiladeveloper/LandingNoracX

**IMPORTANTE — nunca dejes en evidencia que el proyecto usa IA en ningún copy, comentario público o metadata expuesta al usuario final.** El branding es de artista humano anónimo. Internamente en código/comentarios técnicos sí podemos ser honestos.

---

## Estado actual del repo

El repo arranca con un README básico de GitHub. Hay un `index.html` standalone funcional que se va a **migrar** a la nueva arquitectura. Ese HTML está como referencia de diseño, copy, contenido. Te lo paso aparte si lo necesitas.

---

## Arquitectura objetivo (monorepo)

```
noracx/
├── apps/
│   ├── web/              # Astro 5 + TypeScript + PWA — sitio público
│   ├── admin/            # React + Vite + shadcn/ui — dashboard CRM
│   └── api/              # Hono + Drizzle + Wrangler — API en Cloudflare Workers
├── packages/
│   ├── shared/           # Types/utils compartidos entre apps
│   └── ui/               # Componentes shadcn reutilizables (admin)
├── .github/
│   └── workflows/        # CI/CD a Cloudflare
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

---

## Stack técnico (decidido, no consultar de nuevo)

| Capa | Tecnología | Razón |
|---|---|---|
| **Package manager** | pnpm + Turborepo | Workspaces nativos, builds paralelos |
| **Frontend público** | Astro 5 + TypeScript | Static-first, mejor SEO, hidratación parcial |
| **Admin dashboard** | React 19 + Vite + shadcn/ui | DX moderna, componentes battle-tested |
| **API** | Hono en Cloudflare Workers | Edge runtime, TypeScript-first, RPC client |
| **DB** | Cloudflare D1 (SQLite) + Drizzle ORM | Gratis, edge-distributed, type-safe |
| **Auth** | Lucia v3 | Self-hosted, sin lock-in, gratis |
| **Cache** | Cloudflare KV | Tokens Spotify, datos hot |
| **Email transactional** | Resend | DX limpia, 3000/mes gratis |
| **Hosting** | Cloudflare Pages + Workers | Todo en un ecosistema, gratis |
| **i18n** | Astro nativo + JSON files | ES/EN, detecta idioma del navegador |
| **PWA** | @astrojs/pwa | Service Worker + manifest + push notifications |
| **CI/CD** | GitHub Actions | Deploy automático a Cloudflare |
| **Lint/Format** | ESLint + Prettier + EditorConfig | Estándar |

### Decisiones explícitas (NO cuestionar sin justificación nueva)

- **NO usar Next.js** — Astro es superior para sitio mayormente estático
- **NO usar Prisma** — Drizzle gana en Workers (cold starts, tamaño)
- **NO usar Clerk/Auth0** — Lucia self-hosted, sin costos recurrentes
- **NO usar Postgres** — D1 alcanza por mucho tiempo, migrar es directo si crece
- **NO usar Tailwind v3** — usar Tailwind v4 (CSS-first config)
- **NO usar `npm` ni `yarn`** — pnpm en todo
- **NO usar Google Analytics** — analytics server-side propio en D1

---

## Idiomas

- Sitio público bilingüe **ES (default) / EN**
- Detecta idioma del navegador en primera visita
- Guarda preferencia en localStorage
- Tags `<html lang>` se actualizan dinámicamente

---

## Estética / Diseño

- **Tono:** metal pesado, oscuro, protesta. Negro absoluto, rojos sangre coagulada, acentos ember.
- **Fuentes:** Archivo Black (display), Space Grotesk (body), JetBrains Mono (mono/labels). Variable fonts vía Google Fonts.
- **Estilo:** brutalismo moderno editorial, NO gótico medieval. Asimétrico, magazine-like, grid quebrado.
- **Detalles:** grain texture overlay, vignette, custom cursor en desktop, marquee horizontal, animaciones discretas.
- **Colores principales** (CSS vars):
  ```
  --black: #000000
  --void: #050505
  --bone: #f4ede0
  --blood: #b30707
  --blood-bright: #e60a0a
  --ember: #ff3b1a
  ```

---

## Schema de base de datos

El schema vive en `apps/api/src/db/schema.ts` usando Drizzle. Debe cubrir 4 dominios:

### 1. Contenido del sitio
- `songs` — canciones (auto-sync con Spotify API + overrides manuales: tema, frase destacada, traducción EN)
- `albums` — álbumes/EPs (con portadas)
- `quotes` — frases para el lyrics wall (texto ES/EN, source song, orden)
- `press_releases` — notas de prensa (markdown, fecha, tags)
- `events` — fechas de tour/shows (futuro)
- `bio_versions` — biografía versionada (ES/EN, fecha, autor)

### 2. Fanbase / CRM
- `fans` — id, email (único), name (opcional), country (geoip), city, source (where: newsletter/contact/etc), language (es/en), opted_in_at, confirmed_at, unsubscribed_at
- `fan_tags` — tags libres (`super-fan`, `lima`, `early-adopter`) M:N con fans
- `fan_segments` — segmentos dinámicos guardados (query JSON)
- `fan_events` — log de acciones: signup, email_open, email_click, page_view, share. Polimórfico con metadata JSON

### 3. Campaigns
- `campaigns` — newsletter sends (subject ES/EN, body MD, scheduled_at, sent_at, segment_id)
- `campaign_sends` — tracking individual (fan_id, opened_at, clicked_at, unsubscribed_from_this)
- `press_kits` — versiones descargables (version, files JSON, downloads_count)

### 4. Analytics + Auth
- `page_views` — server-side: path, referrer, country, user_agent_class, language, session_id, timestamp
- `referrers_agg` — agregaciones diarias por referrer
- `spotify_snapshots` — historic: monthly_listeners, followers, top_country, snapshot_at (diario)
- `users` — admin: email, hashed_password, role (`owner` | `editor` | `viewer`), created_at
- `sessions` — Lucia sessions
- `audit_log` — quién cambió qué (action, entity, entity_id, diff JSON, user_id, at)

### Reglas del schema

- Todos los IDs: `text` con `nanoid()` por defecto (no autoincrement)
- Todos los timestamps: `integer` con mode `timestamp` (D1 storage)
- Soft deletes en `fans`, `songs`, `bio_versions`: campo `deleted_at` nullable
- Indices explícitos en columnas de búsqueda frecuente (email, country, song.spotify_id)
- Foreign keys con `onDelete: 'cascade'` solo donde tiene sentido (ej: fan → fan_events)
- Naming convention: snake_case en DB, camelCase en TS

---

## Endpoints API (Hono)

### Públicos (no auth)
- `POST /api/subscribe` — newsletter signup (rate-limited, captcha)
- `POST /api/contact` — formulario contacto (rate-limited)
- `POST /api/track` — server-side analytics event
- `GET /api/songs` — lista pública de canciones (cacheada)
- `GET /api/quotes` — lyrics wall

### Admin (auth required, Lucia session)
- `GET /api/admin/dashboard` — stats overview
- `CRUD /api/admin/songs` — gestionar canciones
- `CRUD /api/admin/quotes` — gestionar frases
- `CRUD /api/admin/fans` — gestionar fanbase
- `GET /api/admin/fans/:id/timeline` — historial de un fan
- `POST /api/admin/segments` — crear segmento
- `POST /api/admin/campaigns` — crear/enviar campaña
- `GET /api/admin/analytics/...` — múltiples endpoints

### Background / Cron
- `*/30 * * * *` → sync Spotify (snapshot diario completo, songs cada 30min si hay nuevas)
- `0 9 * * *` → daily digest email al admin

### RPC client
Hono soporta RPC type-safe. El frontend admin importa el tipo del router de la API y obtiene IntelliSense completo en todas las llamadas.

---

## Plan de fases (orden de construcción)

### Fase 1 — Setup base (4-6h)
1. Inicializar monorepo (pnpm-workspace, turbo, tsconfig base)
2. Configurar ESLint + Prettier + EditorConfig
3. Setup Astro en `apps/web` con TypeScript estricto
4. Migrar HTML actual a componentes Astro
5. Content collections (bio, quotes) typed con Zod
6. i18n con `@astrojs/i18n` (o astro-i18next)
7. Configurar PWA (manifest + SW + favicons)
8. Deploy a Cloudflare Pages (script + GitHub Action)

### Fase 2 — API + DB (6-8h)
1. Inicializar `apps/api` con Hono + Wrangler
2. Schema Drizzle completo + migraciones iniciales
3. Setup D1 (crear DB en Cloudflare, bindings en wrangler.toml)
4. KV namespace para cache
5. Endpoints públicos (subscribe, contact, track)
6. Integración Spotify API (Client Credentials flow)
7. Cron jobs para sync Spotify
8. Conectar frontend (Astro) a la API

### Fase 3 — Admin dashboard (8-10h)
1. Inicializar `apps/admin` con Vite + React + shadcn/ui
2. Setup auth con Lucia (single user al inicio)
3. Layout dashboard (sidebar, topbar, content)
4. Página Dashboard (stats overview)
5. CRUD Songs (con preview Spotify)
6. CRUD Quotes
7. Fans CRM (tabla, filtros, detail, timeline)
8. Campaigns (composer, schedule, send via Resend)
9. Analytics views
10. Deploy admin como subdomain `admin.noracx.com`

### Fase 4 — Refinamiento (cuando aplique)
- Push notifications (VAPID + UI subscribe)
- Press kit descargable
- Multi-user con audit log activo
- Drip campaigns
- A/B testing
- Internacionalización del admin

---

## Convenciones de código

- **Imports:** absolute con `@/` prefix donde aplique (configurado en tsconfig path mapping)
- **Components Astro:** PascalCase, un componente por archivo
- **React components admin:** PascalCase, mismo
- **Hooks:** prefijo `use`, camelCase
- **API handlers:** función con nombre del recurso (`createFan`, `listSongs`)
- **DB queries:** funciones puras, una por archivo en `apps/api/src/db/queries/`
- **Tipos compartidos:** `packages/shared/src/types/`
- **Validación:** Zod en bordes (API input/output, content collections)
- **Comentarios:** español en lógica de negocio, inglés en lógica técnica genérica
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`)
- **Branches:** `main` (production), `dev` (integración), `feat/xxx` para features

---

## Variables de entorno

Habrá `.env.example` en cada app. Las reales nunca se comitean. Cloudflare Workers usa `wrangler secret` para producción.

```env
# apps/api/.dev.vars (desarrollo local)
DATABASE_URL=...
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_ARTIST_ID=23reXrP1oSrpgNVFHIEGk6
RESEND_API_KEY=...
SESSION_SECRET=... # random 32+ chars
ADMIN_EMAIL=... # email del owner
```

---

## Cosas importantes que NO olvidar

1. **Mantener noracx.com (sitio actual) funcionando** mientras se construye el nuevo. La migración cuando esté lista. Sin downtime.
2. **El HTML standalone actual** sirve como **referencia de copy, diseño y contenido**. Cuando migres a Astro, respeta el copy y la estética actual. El usuario ya validó esa versión.
3. **Bio actual** está en castellano peruano (no español neutro): usar "Perú" con tilde, usar términos como "el pueblo", "los olvidados", "frontera". Mantener tono.
4. **El proyecto se describe como reciente** (meses), **vocalista único anónimo**, origen Tacna pero **alcance todo el Perú**.
5. **Email profesional** ya está configurado en Cloudflare Email Routing: `contacto@`, `booking@`, `prensa@` → reenvían a Gmail del owner.
6. **No exponer en frontend** ningún detalle que delate IA en el proyecto musical.

---

## Primer paso al abrir este repo en Claude Code

Cuando empieces, antes de generar código:

1. Lee este `CLAUDE.md` completo
2. Verifica versiones: Node ≥20, pnpm ≥9, git
3. Pregunta al usuario por:
   - Confirmación del nombre del paquete root (sugerencia: `noracx`)
   - Si quiere PWA + push notifications en Fase 1 o las deja para después
   - Si tiene cuenta Resend ya creada
4. Genera estructura monorepo (sin código de negocio aún, solo scaffolding)
5. Confirma que `pnpm install` funciona y `pnpm dev` arranca algo
6. Solo después: empezar Fase 1 paso a paso, con review humano entre commits

---

## Historial del proyecto (resumen ejecutivo)

El usuario ha iterado el sitio en chat web hasta validar:
- Branding `NORAC X` (con espacio, no `NORAC_X`)
- Estética metal oscura moderna
- Bio con narrativa de Tacna + alcance Perú + vocalista anónimo + proyecto reciente
- Embed real de Spotify funcionando
- Sistema bilingüe ES/EN
- Sections: Hero, Bio, Music (con Spotify), Lyrics Wall, Newsletter, Platforms, Contact, Footer
- Newsletter pendiente de conectar a Mailchimp/Brevo/Resend
- Dominio noracx.com listo, hosting Cloudflare Pages pendiente

El usuario es programador (JS/TS, Python, Go, Rust), quiere CRM completo de fans, eligió pnpm + Turborepo.

---

**Cuando estés listo, di al usuario:** "Leí CLAUDE.md. Listo para arrancar Fase 1. ¿Confirmamos las 3 preguntas iniciales y procedo con el scaffolding?"