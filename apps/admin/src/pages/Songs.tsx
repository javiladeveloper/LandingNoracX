import { useEffect, useState, type FormEvent } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  listSongs,
  createSong,
  updateSong,
  deleteSong,
  type SongRow,
  type SongInput,
} from '@/lib/api';

type EditState =
  | { mode: 'closed' }
  | { mode: 'new' }
  | { mode: 'edit'; slug: string };

const EMPTY_FORM: SongInput = {
  slug: '',
  title: '',
  trackNumber: null,
  spotifyId: null,
  duration: null,
  genre: 'Power Metal',
  year: 2026,
  featured: false,
  themesEs: '',
  themesEn: '',
  quote: '',
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export default function SongsPage() {
  const [songs, setSongs] = useState<SongRow[] | null>(null);
  const [edit, setEdit] = useState<EditState>({ mode: 'closed' });
  const [form, setForm] = useState<SongInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const rows = await listSongs();
    setSongs(rows ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function startNew() {
    setEdit({ mode: 'new' });
    setForm(EMPTY_FORM);
    setError(null);
  }

  function startEdit(song: SongRow) {
    setEdit({ mode: 'edit', slug: song.slug });
    setForm({
      slug: song.slug,
      title: song.title,
      trackNumber: song.trackNumber,
      spotifyId: song.spotifyId,
      duration: song.duration,
      genre: song.genre,
      year: song.year,
      featured: song.featured,
      themesEs: song.themesEs,
      themesEn: song.themesEn,
      quote: song.quote,
    });
    setError(null);
  }

  function cancelEdit() {
    setEdit({ mode: 'closed' });
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res =
      edit.mode === 'new'
        ? await createSong(form)
        : edit.mode === 'edit'
          ? await updateSong(edit.slug, {
              title: form.title,
              trackNumber: form.trackNumber,
              spotifyId: form.spotifyId,
              duration: form.duration,
              genre: form.genre,
              year: form.year,
              featured: form.featured,
              themesEs: form.themesEs,
              themesEn: form.themesEn,
              quote: form.quote,
            })
          : { ok: false, error: 'invalid_mode' };

    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? 'error');
      return;
    }
    setEdit({ mode: 'closed' });
    load();
  }

  async function handleDelete(song: SongRow) {
    if (
      !window.confirm(
        `Borrar "${song.title}" (soft delete — queda en D1, no se muestra en el sitio)?`,
      )
    )
      return;
    const ok = await deleteSong(song.slug);
    if (ok) load();
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl space-y-6">
        <header className="flex items-end justify-between">
          <div>
            <p className="text-blood-bright font-mono text-[10px] tracking-[0.3em] uppercase">
              Catálogo
            </p>
            <h2 className="font-display text-bone mt-2 text-3xl">Canciones</h2>
          </div>
          {edit.mode === 'closed' && (
            <button
              onClick={startNew}
              className="bg-blood text-bone hover:bg-blood-bright px-4 py-2 font-mono text-[10px] tracking-[0.25em] uppercase transition-colors"
            >
              + Nueva canción
            </button>
          )}
        </header>

        {edit.mode !== 'closed' && (
          <form
            onSubmit={handleSubmit}
            className="border-blood/40 bg-coal space-y-4 border p-5"
          >
            <p className="text-blood-bright font-mono text-[10px] tracking-[0.3em] uppercase">
              {edit.mode === 'new' ? 'Nueva canción' : `Editar · ${edit.slug}`}
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                  Título
                </span>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm((f) => ({
                      ...f,
                      title,
                      // Auto-slug solo si estamos creando y el slug no se editó manualmente
                      slug: edit.mode === 'new' && (f.slug === '' || f.slug === slugify(f.title)) ? slugify(title) : f.slug,
                    }));
                  }}
                  className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-2 text-sm outline-none"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                  Slug {edit.mode === 'edit' && '(no editable)'}
                </span>
                <input
                  type="text"
                  required
                  disabled={edit.mode === 'edit'}
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                  className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-2 font-mono text-sm outline-none disabled:opacity-50"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                  Track #
                </span>
                <input
                  type="number"
                  min={1}
                  value={form.trackNumber ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      trackNumber: e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                  className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-2 text-sm outline-none"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                  Spotify ID
                </span>
                <input
                  type="text"
                  value={form.spotifyId ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, spotifyId: e.target.value || null }))
                  }
                  placeholder="ej. 6lCSivLdv0Xdgy8nTlY04O"
                  className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-2 font-mono text-sm outline-none"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                  Duración (mm:ss)
                </span>
                <input
                  type="text"
                  value={form.duration ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration: e.target.value || null }))
                  }
                  placeholder="4:34"
                  className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-2 text-sm outline-none"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                  Género
                </span>
                <input
                  type="text"
                  required
                  value={form.genre}
                  onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
                  className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-2 text-sm outline-none"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                  Año
                </span>
                <input
                  type="number"
                  min={1900}
                  max={2100}
                  value={form.year ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, year: e.target.value === '' ? null : Number(e.target.value) }))
                  }
                  className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-2 text-sm outline-none"
                />
              </label>

              <label className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                />
                <span className="text-ink font-mono text-[10px] tracking-[0.2em] uppercase">
                  Destacado en home
                </span>
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                Tema (ES)
              </span>
              <textarea
                required
                rows={3}
                value={form.themesEs}
                onChange={(e) => setForm((f) => ({ ...f, themesEs: e.target.value }))}
                className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-2 text-sm outline-none"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                Tema (EN)
              </span>
              <textarea
                required
                rows={3}
                value={form.themesEn}
                onChange={(e) => setForm((f) => ({ ...f, themesEn: e.target.value }))}
                className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-2 text-sm outline-none"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                Frase destacada (línea de la letra)
              </span>
              <input
                type="text"
                required
                value={form.quote}
                onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-2 text-sm outline-none"
              />
            </label>

            {error && (
              <p className="border-blood-bright/40 text-blood-bright border bg-black/40 px-3 py-2 font-mono text-xs">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-blood text-bone hover:bg-blood-bright px-4 py-2 font-mono text-xs tracking-[0.25em] uppercase transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="border-blood/40 hover:border-blood-bright hover:text-blood-bright text-ink border px-4 py-2 font-mono text-[10px] tracking-[0.25em] uppercase transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Listado */}
        {songs === null ? (
          <p className="text-ink-dim font-mono text-xs tracking-[0.3em] uppercase">cargando…</p>
        ) : songs.length === 0 ? (
          <p className="text-ink font-mono text-xs">Sin canciones todavía. Click "Nueva canción" arriba.</p>
        ) : (
          <div className="border-blood/20 bg-coal divide-blood/10 divide-y border">
            {songs.map((s) => (
              <div key={s.slug} className="flex items-center gap-4 p-4">
                <div className="text-blood-bright font-mono text-[10px]">
                  #{s.trackNumber ?? '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-bone font-display text-base">{s.title}</span>
                    {s.featured && (
                      <span className="bg-blood/30 text-blood-bright px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] uppercase">
                        Destacada
                      </span>
                    )}
                  </div>
                  <p className="text-ink-dim mt-1 font-mono text-[10px]">
                    {s.slug} · {s.genre}
                    {s.duration && ` · ${s.duration}`}
                    {s.year && ` · ${s.year}`}
                    {s.spotifyId ? (
                      <span className="text-blood-bright"> · Spotify ✓</span>
                    ) : (
                      <span className="text-ink-faint"> · sin Spotify</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => startEdit(s)}
                  className="border-blood/40 hover:border-blood-bright hover:text-blood-bright text-ink border px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] uppercase transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(s)}
                  className="border-blood/40 hover:border-blood-bright hover:text-blood-bright text-ink-dim border px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] uppercase transition-colors"
                >
                  Borrar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
