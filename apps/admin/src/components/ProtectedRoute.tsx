import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getMe } from '@/lib/api';

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const [state, setState] = useState<'loading' | 'authed' | 'guest'>('loading');

  useEffect(() => {
    let cancelled = false;
    getMe().then((user) => {
      if (cancelled) return;
      setState(user ? 'authed' : 'guest');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="font-mono text-xs tracking-[0.3em] text-ink-dim uppercase">cargando…</span>
      </div>
    );
  }

  if (state === 'guest') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
