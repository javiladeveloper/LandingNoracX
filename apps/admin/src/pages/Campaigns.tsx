import { useEffect, useState, type FormEvent } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  listCampaigns,
  previewCampaign,
  sendCampaign,
  type CampaignRow,
  type CampaignPreview,
  type CampaignSendResult,
} from '@/lib/api';

const DEFAULT_TEMPLATE_HTML = `<!doctype html>
<html lang="es">
<body style="margin:0;padding:0;background:#000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#b8b0a8;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#000;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:560px;background:#0a0a0a;border:1px solid rgba(179,7,7,0.3);">
        <tr><td style="padding:48px 32px 16px;text-align:center;">
          <h1 style="margin:0;font-size:32px;color:#f4ede0;font-family:Georgia,serif;">NORAC <span style="color:#e60a0a;font-style:italic;">X</span></h1>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#f4ede0;">Hola.</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
            [Reemplazá este texto con el contenido real del email.]
          </p>
          <p style="margin:0;font-size:15px;line-height:1.7;">— NORAC X</p>
        </td></tr>
        <tr><td style="padding:24px 32px;border-top:1px solid rgba(179,7,7,0.2);text-align:center;">
          <p style="margin:0;font-size:10px;color:#6a625c;letter-spacing:0.2em;text-transform:uppercase;font-family:'Courier New',monospace;">
            Para darte de baja respondé este mail con UNSUBSCRIBE
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const DEFAULT_TEMPLATE_TEXT = `Hola.

[Reemplazá este texto con el contenido real del email.]

— NORAC X

—
Para darte de baja respondé este mail con UNSUBSCRIBE`;

function formatDate(ts: string | number | null): string {
  if (!ts) return '—';
  const d = typeof ts === 'string' ? new Date(ts) : new Date(ts * 1000);
  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CampaignsPage() {
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState(DEFAULT_TEMPLATE_HTML);
  const [bodyText, setBodyText] = useState(DEFAULT_TEMPLATE_TEXT);
  const [lang, setLang] = useState<'' | 'es' | 'en'>('');
  const [country, setCountry] = useState('');

  const [preview, setPreview] = useState<CampaignPreview | null>(null);
  const [result, setResult] = useState<CampaignSendResult | null>(null);
  const [history, setHistory] = useState<CampaignRow[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadHistory() {
    const rows = await listCampaigns();
    if (rows) setHistory(rows);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const segment = {
    lang: lang || undefined,
    country: country || undefined,
  };

  async function handlePreview(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoadingPreview(true);
    const res = await previewCampaign(segment);
    setLoadingPreview(false);
    if (!res) {
      setError('No se pudo obtener preview.');
      return;
    }
    setPreview(res);
  }

  async function handleSend() {
    if (!preview) {
      setError('Primero corre Preview para confirmar destinatarios.');
      return;
    }
    if (!subject.trim() || bodyHtml.length < 10 || bodyText.length < 10) {
      setError('Subject, HTML y text son obligatorios.');
      return;
    }
    if (
      !window.confirm(
        `Enviar a ${preview.recipients} destinatarios? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    setError(null);
    setSending(true);
    const res = await sendCampaign({
      subject: subject.trim(),
      bodyHtml,
      bodyText,
      segment,
    });
    setSending(false);
    setResult(res);
    if (res?.ok) {
      // Limpiar después de envío exitoso
      setSubject('');
      setPreview(null);
      loadHistory();
    }
  }

  return (
    <AdminLayout>
      <div className="grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Composer (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          <header>
            <p className="text-blood-bright font-mono text-[10px] tracking-[0.3em] uppercase">
              Composer
            </p>
            <h2 className="font-display text-bone mt-2 text-3xl">Nueva campaña</h2>
          </header>

          <form onSubmit={handlePreview} className="space-y-4">
            <label className="block space-y-1">
              <span className="text-blood-bright font-mono text-[9px] tracking-[0.3em] uppercase">
                Subject
              </span>
              <input
                type="text"
                required
                maxLength={200}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="ej. Nuevo single: Ecos de Ti — ya en Spotify"
                className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-2 text-sm outline-none"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-blood-bright font-mono text-[9px] tracking-[0.3em] uppercase">
                  Body HTML
                </span>
                <textarea
                  required
                  value={bodyHtml}
                  onChange={(e) => setBodyHtml(e.target.value)}
                  rows={16}
                  className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-2 font-mono text-xs outline-none"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-blood-bright font-mono text-[9px] tracking-[0.3em] uppercase">
                  Body texto plano (fallback)
                </span>
                <textarea
                  required
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  rows={16}
                  className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-2 font-mono text-xs outline-none"
                />
              </label>
            </div>

            <fieldset className="border-blood/20 bg-coal flex flex-wrap items-end gap-3 border p-4">
              <legend className="text-blood-bright px-2 font-mono text-[9px] tracking-[0.3em] uppercase">
                Segmento
              </legend>
              <label className="block space-y-1">
                <span className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                  Idioma
                </span>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as '' | 'es' | 'en')}
                  className="bg-ash border-blood/30 text-bone border p-2 text-sm outline-none"
                >
                  <option value="">Todos</option>
                  <option value="es">ES</option>
                  <option value="en">EN</option>
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-ink-dim font-mono text-[9px] tracking-[0.3em] uppercase">
                  País (ISO)
                </span>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value.toUpperCase())}
                  maxLength={2}
                  placeholder="PE"
                  className="bg-ash border-blood/30 text-bone w-20 border p-2 text-sm outline-none"
                />
              </label>
              <button
                type="submit"
                disabled={loadingPreview}
                className="border-blood/40 hover:border-blood-bright hover:text-blood-bright text-ink border px-4 py-2 font-mono text-[10px] tracking-[0.25em] uppercase transition-colors disabled:opacity-50"
              >
                {loadingPreview ? 'Calculando…' : 'Preview destinatarios'}
              </button>
            </fieldset>
          </form>

          {preview && (
            <div className="border-blood/40 bg-coal space-y-3 border p-4">
              <p className="text-bone text-sm">
                <span className="font-display text-2xl">{preview.recipients}</span> destinatarios
                en el segmento.
              </p>
              {preview.sample.length > 0 && (
                <ul className="text-ink-dim font-mono text-[11px]">
                  {preview.sample.map((s) => (
                    <li key={s.email}>· {s.email}</li>
                  ))}
                  {preview.recipients > preview.sample.length && (
                    <li>· y {preview.recipients - preview.sample.length} más…</li>
                  )}
                </ul>
              )}
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || preview.recipients === 0}
                className="bg-blood text-bone hover:bg-blood-bright px-6 py-3 font-mono text-xs tracking-[0.25em] uppercase transition-colors disabled:opacity-50"
              >
                {sending ? 'Enviando…' : `Enviar a ${preview.recipients} fans`}
              </button>
            </div>
          )}

          {error && (
            <p className="border-blood-bright/40 text-blood-bright border bg-black/40 px-3 py-2 font-mono text-xs">
              {error}
            </p>
          )}

          {result && (
            <div
              className={`border p-3 font-mono text-xs ${
                result.ok
                  ? 'border-blood/40 bg-coal text-bone'
                  : 'border-blood-bright/40 text-blood-bright bg-black/40'
              }`}
            >
              {result.ok ? (
                <p>
                  ✅ Enviada a {result.sentCount} / {result.targeted}.
                </p>
              ) : (
                <>
                  <p>
                    ⚠️ Errores. Enviados: {result.sentCount} / {result.targeted}.
                  </p>
                  {result.errors?.map((e, i) => (
                    <p key={i} className="mt-1 text-[10px]">
                      {e}
                    </p>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Historial (1/3) */}
        <aside className="border-blood/20 bg-coal border p-4">
          <p className="text-blood-bright font-mono text-[10px] tracking-[0.3em] uppercase">
            Historial
          </p>
          {history.length === 0 ? (
            <p className="text-ink-dim mt-4 text-xs">Sin campañas todavía.</p>
          ) : (
            <ul className="divide-blood/10 mt-4 divide-y">
              {history.map((c) => (
                <li key={c.id} className="py-3">
                  <p className="text-bone text-sm">{c.subject}</p>
                  <p className="text-ink-dim mt-1 font-mono text-[10px]">
                    {formatDate(c.sentAt)} · {c.sentCount} destinatarios
                    {c.segmentLang && ` · ${c.segmentLang}`}
                    {c.segmentCountry && ` · ${c.segmentCountry}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </AdminLayout>
  );
}
