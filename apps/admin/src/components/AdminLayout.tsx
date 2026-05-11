import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getMe, logout, type MeResponse } from '@/lib/api';

interface Props {
  children: ReactNode;
}

interface NavItem {
  to: string;
  label: string;
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard' },
  { to: '/messages', label: 'Mensajes' },
  { to: '/songs', label: 'Canciones', disabled: true },
  { to: '/quotes', label: 'Frases', disabled: true },
  { to: '/fans', label: 'Fans', disabled: true },
];

export default function AdminLayout({ children }: Props) {
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
    <div className="flex min-h-screen">
      <aside className="border-blood/20 bg-coal w-56 shrink-0 border-r">
        <div className="border-blood/20 border-b px-6 py-6">
          <p className="text-blood-bright font-mono text-[9px] tracking-[0.3em] uppercase">Admin</p>
          <h1 className="font-display text-bone mt-1 text-lg">
            NORAC <span className="text-blood-bright italic">X</span>
          </h1>
        </div>

        <nav className="flex flex-col py-4">
          {NAV_ITEMS.map((item) => {
            if (item.disabled) {
              return (
                <span
                  key={item.to}
                  className="text-ink-faint px-6 py-2.5 font-mono text-[11px] tracking-[0.2em] uppercase opacity-40"
                  title="próximamente"
                >
                  {item.label}
                </span>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `px-6 py-2.5 font-mono text-[11px] tracking-[0.2em] uppercase transition-colors ${
                    isActive
                      ? 'text-blood-bright border-blood-bright border-l-2 bg-black/30'
                      : 'text-ink hover:text-bone hover:bg-black/20'
                  }`
                }
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="border-blood/20 flex items-center justify-end gap-4 border-b px-8 py-4 text-xs">
          {user && <span className="text-ink-dim font-mono">{user.email}</span>}
          <button
            onClick={handleLogout}
            className="border-blood/40 hover:border-blood-bright hover:text-blood-bright text-ink border px-3 py-2 font-mono text-[10px] tracking-[0.25em] uppercase transition-colors"
          >
            Salir
          </button>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
