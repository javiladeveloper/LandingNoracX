import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { listFans, type FanRow, type FansSummary } from '@/lib/api';

function formatDate(ts: string | number): string {
  const d = typeof ts === 'string' ? new Date(ts) : new Date(ts * 1000);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: '2-digit' });
}

export default function FansPage() {
  const [fans, setFans] = useState<FanRow[] | null>(null);
  const [summary, setSummary] = useState<FansSummary | null>(null);
  const [q, setQ] = useState('');
  const [lang, setLang] = useState<'' | 'es' | 'en'>('');
  const [country, setCountry] = useState('');
  const [includeUnsubscribed, setIncludeUnsubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await listFans({
      q: q || undefined,
      lang: lang || undefined,
      country: country || undefined,
      includeUnsubscribed,
    });
    setLoading(false);
    if (!res) {
      setError('No se pudieron cargar los fans.');
      return;
    }
    setFans(res.data);
    setSummary(res.summary);
    setError(null);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    load();
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl space-y-6">
        <header>
          <p className="text-blood-bright font-mono text-[10px] tracking-[0.3em] uppercase">
            Fanbase
          </p>
          <h2 className="font-display text-bone mt-2 text-3xl">Fans</h2>
        </header>

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="border-blood/20 bg-coal border p-4">
              <p className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                Activos
              </p>
              <p className="font-display text-bone mt-2 text-3xl">{summary.totalActive}</p>
            </div>
            <div className="border-blood/20 bg-coal border p-4">
              <p className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                Bajas
              </p>
              <p className="font-display text-ink mt-2 text-3xl">{summary.totalUnsubscribed}</p>
            </div>
            {summary.byLanguage.map((b) => (
              <div key={b.language} className="border-blood/20 bg-coal border p-4">
                <p className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                  Idioma · {b.language.toUpperCase()}
                </p>
                <p className="font-display text-bone mt-2 text-3xl">{b.count}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filtros */}
        <form
          onSubmit={handleFilterSubmit}
          className="border-blood/20 bg-coal flex flex-wrap items-end gap-3 border p-4"
        >
          <label className="block flex-1 space-y-1">
            <span className="text-blood-bright font-mono text-[9px] tracking-[0.3em] uppercase">
              Buscar
            </span>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="email o nombre"
              className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-2 text-sm outline-none"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-blood-bright font-mono text-[9px] tracking-[0.3em] uppercase">
              Idioma
            </span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as '' | 'es' | 'en')}
              className="bg-ash border-blood/30 text-bone focus:border-blood-bright border p-2 text-sm outline-none"
            >
              <option value="">Todos</option>
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-blood-bright font-mono text-[9px] tracking-[0.3em] uppercase">
              País (ISO)
            </span>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value.toUpperCase())}
              maxLength={2}
              placeholder="PE"
              className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-20 border p-2 text-sm outline-none"
            />
          </label>
          <label className="flex items-center gap-2 pb-2 text-xs">
            <input
              type="checkbox"
              checked={includeUnsubscribed}
              onChange={(e) => setIncludeUnsubscribed(e.target.checked)}
            />
            <span className="text-ink font-mono text-[10px] tracking-[0.2em] uppercase">
              Incluir bajas
            </span>
          </label>
          <button
            type="submit"
            className="bg-blood text-bone hover:bg-blood-bright px-4 py-2 font-mono text-[10px] tracking-[0.25em] uppercase transition-colors"
          >
            Filtrar
          </button>
        </form>

        {error && (
          <p className="border-blood-bright/40 text-blood-bright border bg-black/40 px-3 py-2 font-mono text-xs">
            {error}
          </p>
        )}

        {/* Tabla */}
        <div className="border-blood/20 overflow-x-auto border">
          <table className="w-full text-left text-sm">
            <thead className="bg-coal border-blood/20 border-b">
              <tr className="text-blood-bright font-mono text-[9px] tracking-[0.3em] uppercase">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">País</th>
                <th className="px-4 py-3">Lang</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Alta</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-blood/10 divide-y">
              {loading && fans === null && (
                <tr>
                  <td colSpan={7} className="text-ink-dim p-6 text-center font-mono text-xs">
                    cargando…
                  </td>
                </tr>
              )}
              {fans && fans.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-ink p-6 text-center text-xs">
                    No hay fans que coincidan con los filtros.
                  </td>
                </tr>
              )}
              {fans?.map((f) => (
                <tr key={f.id} className={f.unsubscribedAt ? 'opacity-50' : ''}>
                  <td className="text-bone px-4 py-3">{f.email}</td>
                  <td className="text-ink px-4 py-3">{f.name ?? '—'}</td>
                  <td className="text-ink px-4 py-3">{f.country ?? '—'}</td>
                  <td className="text-ink px-4 py-3 font-mono text-[10px]">{f.language}</td>
                  <td className="text-ink-dim px-4 py-3 font-mono text-[10px]">{f.source}</td>
                  <td className="text-ink-dim px-4 py-3 font-mono text-[10px]">
                    {formatDate(f.optedInAt)}
                  </td>
                  <td className="px-4 py-3">
                    {f.unsubscribedAt ? (
                      <span className="border-ink-dim text-ink-dim border px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] uppercase">
                        Baja
                      </span>
                    ) : (
                      <span className="bg-blood/30 text-blood-bright px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] uppercase">
                        Activo
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {fans && fans.length >= 500 && (
          <p className="text-ink-dim font-mono text-[10px]">
            Mostrando los primeros 500 — afiná los filtros si necesitas algo específico.
          </p>
        )}
      </div>
    </AdminLayout>
  );
}
