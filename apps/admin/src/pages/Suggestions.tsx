import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  listContactMessages,
  patchContactMessage,
  type ContactMessageRow,
  type ContactMessageAction,
} from '@/lib/api';

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SuggestionsPage() {
  const [messages, setMessages] = useState<ContactMessageRow[] | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await listContactMessages();
    if (!res) {
      setError('No se pudieron cargar las sugerencias.');
      return;
    }
    const filteredMessages = res.data.filter((m) => m.type === 'suggestion');
    setMessages(filteredMessages);
    setUnreadCount(filteredMessages.filter((m) => !m.readAt).length);
    setError(null);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAction(id: string, action: ContactMessageAction) {
    const ok = await patchContactMessage(id, action);
    if (ok) load();
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <header className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-blood-bright font-mono text-[10px] tracking-[0.3em] uppercase">
              Feedback de Fans
            </p>
            <h2 className="font-display text-bone mt-2 text-3xl">
              Sugerencias de Temas{' '}
              {unreadCount > 0 && (
                <span className="text-blood-bright text-base">({unreadCount} sin leer)</span>
              )}
            </h2>
          </div>
          <button
            onClick={load}
            className="border-blood/40 hover:border-blood-bright hover:text-blood-bright text-ink border px-3 py-2 font-mono text-[10px] tracking-[0.25em] uppercase transition-colors"
          >
            Refrescar
          </button>
        </header>

        {error && (
          <p className="border-blood-bright/40 text-blood-bright mb-4 border bg-black/40 px-3 py-2 font-mono text-xs">
            {error}
          </p>
        )}

        {messages === null && !error && (
          <p className="text-ink-dim font-mono text-xs tracking-[0.3em] uppercase">cargando…</p>
        )}

        {messages && messages.length === 0 && (
          <p className="text-ink font-mono text-xs">
            Todavía no hay sugerencias de temas.
          </p>
        )}

        {messages && messages.length > 0 && (
          <div className="border-blood/20 bg-coal divide-blood/10 divide-y border">
            {messages.map((m) => {
              const isUnread = m.readAt === null;
              const isExpanded = expandedId === m.id;
              return (
                <article key={m.id} className={isUnread ? 'bg-black/40' : ''}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : m.id)}
                    className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {isUnread && (
                          <span className="bg-blood-bright inline-block h-2 w-2 rounded-full" />
                        )}
                        <span className="text-bone font-display text-sm">{m.name || 'Anónimo'}</span>
                        <span className="bg-blood/30 text-blood-bright px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] uppercase">
                          SUGERENCIA
                        </span>
                      </div>
                      <p className="text-ink mt-2 line-clamp-1 text-sm">{m.message}</p>
                    </div>
                    <span className="text-ink-faint font-mono text-[10px] whitespace-nowrap">
                      {formatDate(m.createdAt)}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="border-blood/10 border-t px-5 py-4">
                      <pre className="text-ink mb-4 font-sans text-sm leading-relaxed whitespace-pre-wrap">
                        {m.message}
                      </pre>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleAction(m.id, isUnread ? 'mark-read' : 'mark-unread')}
                          className="border-blood/40 hover:border-blood-bright hover:text-blood-bright text-ink border px-3 py-2 font-mono text-[10px] tracking-[0.25em] uppercase transition-colors"
                        >
                          {isUnread ? 'Marcar leído' : 'Marcar no leído'}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
