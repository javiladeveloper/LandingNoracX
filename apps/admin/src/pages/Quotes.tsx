import { useEffect, useState, type FormEvent } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  listQuotes,
  createQuote,
  updateQuote,
  deleteQuote,
  type QuoteRow,
  type QuoteInput,
} from '@/lib/api';

type EditState = { mode: 'closed' } | { mode: 'new' } | { mode: 'edit'; id: string };

const EMPTY_FORM: QuoteInput = {
  textEs: '"..."',
  textEn: '"..."',
  sourceName: '',
  sourceSlug: null,
  order: 1,
  featured: false,
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRow[] | null>(null);
  const [edit, setEdit] = useState<EditState>({ mode: 'closed' });
  const [form, setForm] = useState<QuoteInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const rows = await listQuotes();
    setQuotes(rows ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function startNew() {
    const nextOrder = (quotes?.length ?? 0) + 1;
    setEdit({ mode: 'new' });
    setForm({ ...EMPTY_FORM, order: nextOrder });
    setError(null);
  }

  function startEdit(q: QuoteRow) {
    setEdit({ mode: 'edit', id: q.id });
    setForm({
      textEs: q.textEs,
      textEn: q.textEn,
      sourceName: q.sourceName,
      sourceSlug: q.sourceSlug,
      order: q.order,
      featured: q.featured,
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
        ? await createQuote(form)
        : edit.mode === 'edit'
          ? await updateQuote(edit.id, form)
          : { ok: false, error: 'invalid_mode' };
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? 'error');
      return;
    }
    setEdit({ mode: 'closed' });
    load();
  }

  async function handleDelete(q: QuoteRow) {
    if (!window.confirm(`Borrar frase #${q.order} de ${q.sourceName}?`)) return;
    const ok = await deleteQuote(q.id);
    if (ok) load();
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl space-y-6">
        <header className="flex items-end justify-between">
          <div>
            <p className="text-blood-bright font-mono text-[10px] tracking-[0.3em] uppercase">
              Lyrics Wall
            </p>
            <h2 className="font-display text-bone mt-2 text-3xl">Frases</h2>
          </div>
          {edit.mode === 'closed' && (
            <button
              onClick={startNew}
              className="bg-blood text-bone hover:bg-blood-bright px-4 py-2 font-mono text-[10px] tracking-[0.25em] uppercase transition-colors"
            >
              + Nueva frase
            </button>
          )}
        </header>

        {edit.mode !== 'closed' && (
          <form
            onSubmit={handleSubmit}
            className="border-blood/40 bg-coal space-y-4 border p-5"
          >
            <p className="text-blood-bright font-mono text-[10px] tracking-[0.3em] uppercase">
              {edit.mode === 'new' ? 'Nueva frase' : `Editar frase #${form.order}`}
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                  Texto (ES)
                </span>
                <textarea
                  required
                  rows={3}
                  value={form.textEs}
                  onChange={(e) => setForm((f) => ({ ...f, textEs: e.target.value }))}
                  className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-2 text-sm outline-none"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                  Texto (EN)
                </span>
                <textarea
                  required
                  rows={3}
                  value={form.textEn}
                  onChange={(e) => setForm((f) => ({ ...f, textEn: e.target.value }))}
                  className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-2 text-sm outline-none"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="block space-y-1 md:col-span-2">
                <span className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                  Source name (mostrado, uppercase auto)
                </span>
                <input
                  type="text"
                  required
                  value={form.sourceName}
                  onChange={(e) => setForm((f) => ({ ...f, sourceName: e.target.value }))}
                  placeholder="GARRAS SOBRE EL ANDE"
                  className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-2 text-sm outline-none"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                  Order
                </span>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                  className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-2 text-sm outline-none"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                Source slug (opcional, FK a songs)
              </span>
              <input
                type="text"
                value={form.sourceSlug ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sourceSlug: e.target.value || null }))
                }
                placeholder="garras-sobre-el-ande"
                className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-2 font-mono text-sm outline-none"
              />
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
              />
              <span className="text-ink font-mono text-[10px] tracking-[0.2em] uppercase">
                Destacada
              </span>
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

        {quotes === null ? (
          <p className="text-ink-dim font-mono text-xs tracking-[0.3em] uppercase">cargando…</p>
        ) : quotes.length === 0 ? (
          <p className="text-ink font-mono text-xs">Sin frases todavía.</p>
        ) : (
          <div className="border-blood/20 bg-coal divide-blood/10 divide-y border">
            {quotes.map((q) => (
              <div key={q.id} className="flex items-start gap-4 p-4">
                <div className="text-blood-bright w-8 font-mono text-[10px]">
                  #{q.order.toString().padStart(2, '0')}
                </div>
                <div className="flex-1">
                  <p className="text-bone text-sm">{q.textEs}</p>
                  <p className="text-ink-dim mt-1 text-xs italic">{q.textEn}</p>
                  <p className="text-ink-faint mt-2 font-mono text-[10px] tracking-[0.2em]">
                    {q.sourceName}
                    {q.featured && ' · ⭐'}
                  </p>
                </div>
                <button
                  onClick={() => startEdit(q)}
                  className="border-blood/40 hover:border-blood-bright hover:text-blood-bright text-ink border px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] uppercase transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(q)}
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
