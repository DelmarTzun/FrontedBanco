import { Menu, Search, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

export default function Topbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const nombre = useAuthStore((s) => s.nombre);
  const rol = useAuthStore((s) => s.rol);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3">
      <div className="glass rounded-2xl flex items-center gap-2 px-3 py-2 shadow-soft">
        <button
          onClick={toggleSidebar}
          aria-label="Abrir menú"
          className="ring-focus grid h-10 w-10 place-items-center rounded-xl glass-soft lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="hidden sm:flex flex-1 items-center gap-2 rounded-xl bg-white/40 dark:bg-white/5 px-3 h-10">
          <Search className="h-4 w-4 text-ink-400" />
          <input
            type="text"
            placeholder="Buscar movimientos, beneficiarios..."
            className="h-full w-full bg-transparent text-sm outline-none placeholder:text-ink-400"
          />
          <kbd className="hidden sm:inline-flex h-6 items-center rounded-md border border-ink-200 dark:border-white/10 px-1.5 text-[10px] font-mono text-muted">
            ⌘K
          </kbd>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() =>
              navigate(rol === 'ADMIN' ? '/admin' : '/app/notificaciones')
            }
            className="ring-focus relative grid h-10 w-10 place-items-center rounded-xl glass-soft"
            aria-label="Notificaciones"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-ink-800" />
          </button>
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-2 pl-2">
            <div className="text-right leading-tight">
              <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                {nombre || 'Usuario'}
              </p>
              <p className="text-[11px] uppercase tracking-wider text-muted">
                {rol === 'ADMIN' ? 'Administrador' : 'Cliente'}
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white text-sm font-semibold">
              {(nombre || 'U').slice(0, 1).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
