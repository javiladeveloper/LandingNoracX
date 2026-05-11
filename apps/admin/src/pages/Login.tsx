import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { login, getMe } from '@/lib/api';
import { useEffect } from 'react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [alreadyAuthed, setAlreadyAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    getMe().then((user) => setAlreadyAuthed(Boolean(user)));
  }, []);

  if (alreadyAuthed) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (res.ok) {
      navigate('/', { replace: true });
    } else {
      setError(res.error ?? 'login_failed');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={onSubmit}
        className="border-blood/30 bg-coal w-full max-w-sm space-y-6 border p-8"
      >
        <header className="space-y-2 text-center">
          <p className="text-blood-bright font-mono text-[10px] tracking-[0.3em] uppercase">
            Admin · NORAC X
          </p>
          <h1 className="font-display text-bone text-3xl">Acceso</h1>
        </header>

        <label className="block space-y-2">
          <span className="text-blood-bright font-mono text-[10px] tracking-[0.3em] uppercase">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-3 text-sm outline-none"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-blood-bright font-mono text-[10px] tracking-[0.3em] uppercase">
            Contraseña
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-ash border-blood/30 text-bone focus:border-blood-bright w-full border p-3 text-sm outline-none"
          />
        </label>

        {error && (
          <p className="border-blood-bright/40 text-blood-bright border bg-black/40 px-3 py-2 font-mono text-xs">
            {error === 'invalid_credentials' ? 'Email o contraseña incorrectos.' : `Error: ${error}`}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blood text-bone hover:bg-blood-bright w-full p-3 font-mono text-xs tracking-[0.25em] uppercase transition-colors disabled:opacity-50"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
