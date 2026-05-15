import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { getAnalyticsOverview, type AnalyticsOverview } from '@/lib/api';

function fillMissingDays(
  daily: Array<{ day: string; count: number }>,
  days: number,
): Array<{ day: string; count: number }> {
  const map = new Map(daily.map((d) => [d.day, d.count]));
  const out: Array<{ day: string; count: number }> = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ day: key, count: map.get(key) ?? 0 });
  }
  return out;
}

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-ink w-28 truncate font-mono text-[11px]">{label}</span>
      <div className="bg-ash flex-1 overflow-hidden">
        <div
          className="from-blood to-blood-bright h-5 bg-gradient-to-r transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-bone w-12 text-right font-mono text-[11px]">{count}</span>
    </div>
  );
}

function Sparkline({ daily, days }: { daily: Array<{ day: string; count: number }>; days: number }) {
  const padded = fillMissingDays(daily, days);
  const values = padded.map((d) => d.count);
  const max = Math.max(...values, 1);
  const W = 600;
  const H = 120;
  const stepX = W / (padded.length - 1);
  const points = padded.map((d, i) => {
    const x = i * stepX;
    const y = H - (d.count / max) * H * 0.85;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="bg-ash border-blood/20 h-32 w-full border"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e60a0a" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#e60a0a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#spark-grad)" />
      <path d={linePath} fill="none" stroke="#e60a0a" strokeWidth="2" />
      {padded.map((d, i) => (
        <circle
          key={d.day}
          cx={i * stepX}
          cy={H - (d.count / max) * H * 0.85}
          r="3"
          fill="#ff3b1a"
        />
      ))}
    </svg>
  );
}

export default function DashboardPage() {
  const [range, setRange] = useState<string>('7d');
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAnalyticsOverview(range)
      .then((res) => {
        if (!res) setError('No se pudieron cargar las stats.');
        else setData(res);
      })
      .finally(() => setLoading(false));
  }, [range]);

  const maxPath = Math.max(...(data?.topPaths.map((p) => p.count) ?? [0]), 1);
  const maxCountry = Math.max(...(data?.byCountry.map((c) => c.count) ?? [0]), 1);

  const rangeDays = range === 'today' ? 1 : range === '30d' ? 30 : range === 'all' ? 90 : 14;
  const rangeLabels: Record<string, string> = {
    today: 'Hoy',
    '7d': '7 días',
    '30d': '30 días',
    all: 'Todo',
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-blood-bright font-mono text-[10px] tracking-[0.3em] uppercase">
              Dashboard
            </p>
            <h2 className="font-display text-bone mt-2 text-3xl">Visitas</h2>
          </div>
          <div className="border-blood/40 bg-coal flex gap-1 border p-1">
            {Object.entries(rangeLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setRange(key)}
                className={`px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors ${
                  range === key
                    ? 'bg-blood text-bone'
                    : 'text-ink-dim hover:text-bone hover:bg-black/40'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {error && (
          <p className="border-blood-bright/40 text-blood-bright border bg-black/40 px-3 py-2 font-mono text-xs">
            {error}
          </p>
        )}

        {loading && (
          <p className="text-ink-dim font-mono text-xs tracking-[0.3em] uppercase">cargando…</p>
        )}

        {data && (
          <>
            {/* Totales */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border-blood/20 bg-coal border p-5">
                <p className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                  Page views
                </p>
                <p className="font-display text-bone mt-2 text-4xl">{data.totals.views}</p>
              </div>
              <div className="border-blood/20 bg-coal border p-5">
                <p className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                  Sesiones únicas
                </p>
                <p className="font-display text-bone mt-2 text-4xl">
                  {data.totals.uniqueSessions}
                </p>
              </div>
            </div>

            {/* Sparkline */}
            {range !== 'today' && (
              <section className="border-blood/20 bg-coal border p-5">
                <p className="text-blood-bright font-mono text-[10px] tracking-[0.3em] uppercase">
                  Tendencia ({rangeLabels[range]})
                </p>
                <div className="mt-4">
                  <Sparkline daily={data.daily} days={rangeDays} />
                </div>
              </section>
            )}

            {/* Top paths + countries */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <section className="border-blood/20 bg-coal border p-5">
                <p className="text-blood-bright font-mono text-[10px] tracking-[0.3em] uppercase">
                  Top páginas
                </p>
                <div className="mt-4 space-y-2">
                  {data.topPaths.length === 0 ? (
                    <p className="text-ink-dim text-xs">Sin datos todavía.</p>
                  ) : (
                    data.topPaths.map((p) => (
                      <BarRow key={p.path} label={p.path || '/'} count={p.count} max={maxPath} />
                    ))
                  )}
                </div>
              </section>

              <section className="border-blood/20 bg-coal border p-5">
                <p className="text-blood-bright font-mono text-[10px] tracking-[0.3em] uppercase">
                  Por país
                </p>
                <div className="mt-4 space-y-2">
                  {data.byCountry.length === 0 ? (
                    <p className="text-ink-dim text-xs">Sin datos todavía.</p>
                  ) : (
                    data.byCountry.map((b) => (
                      <BarRow
                        key={b.country ?? 'unknown'}
                        label={b.country ?? '—'}
                        count={b.count}
                        max={maxCountry}
                      />
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* Device + Language */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <section className="border-blood/20 bg-coal border p-5">
                <p className="text-blood-bright font-mono text-[10px] tracking-[0.3em] uppercase">
                  Por dispositivo
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  {data.byDevice.map((d) => (
                    <div key={d.device ?? 'unknown'} className="bg-ash p-3">
                      <p className="text-ink-dim font-mono text-[9px] tracking-[0.2em] uppercase">
                        {d.device ?? 'unknown'}
                      </p>
                      <p className="font-display text-bone mt-1 text-2xl">{d.count}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="border-blood/20 bg-coal border p-5">
                <p className="text-blood-bright font-mono text-[10px] tracking-[0.3em] uppercase">
                  Por idioma
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                  {data.byLanguage.map((l) => (
                    <div key={l.language ?? 'unknown'} className="bg-ash p-3">
                      <p className="text-ink-dim font-mono text-[9px] tracking-[0.2em] uppercase">
                        {l.language ?? 'unknown'}
                      </p>
                      <p className="font-display text-bone mt-1 text-2xl">{l.count}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
