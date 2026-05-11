import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, logout, type MeResponse } from '@/lib/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<MeResponse['user'] | null>(null);

  useEffect(() => {
    getMe().then(setUser);
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="border-blood/20 flex items-center justify-between border-b px-8 py-5">
        <div>
          <p className="text-blood-bright font-mono text-[10px] tracking-[0.3em] uppercase">
            Admin
          </p>
          <h1 className="font-display text-bone text-xl">
            NORAC <span className="text-blood-bright italic">X</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {user && <span className="text-ink-dim font-mono">{user.email}</span>}
          <button
            onClick={handleLogout}
            className="border-blood/40 hover:border-blood-bright hover:text-blood-bright text-ink border px-3 py-2 font-mono text-[10px] tracking-[0.25em] uppercase transition-colors"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="p-8">
        <div className="border-blood/20 bg-coal max-w-2xl border p-8">
          <p className="text-blood-bright font-mono text-[10px] tracking-[0.3em] uppercase">
            Dashboard · placeholder
          </p>
          <h2 className="font-display text-bone mt-3 text-2xl">
            Auth funciona. Próximos CRUDs en construcción.
          </h2>
          <p className="text-ink mt-4 text-sm leading-relaxed">
            Cuando el equipo de Fase 3b agregue CRUDs de canciones, frases, fans y campañas, este
            espacio se convierte en el panel completo. Por ahora confirma que la sesión está activa
            y el backend reconoce al usuario.
          </p>
        </div>
      </main>
    </div>
  );
}
