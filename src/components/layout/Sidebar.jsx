import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  CreditCard,
  PiggyBank,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Users,
  UserPlus,
  ShieldCheck,
  History,
  Building2,
  Banknote,
  Receipt as ReceiptIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

const CLIENT_NAV = [
  { to: '/app', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/app/transacciones', label: 'Transacciones', icon: Receipt },
  { to: '/app/transferir', label: 'Transferir', icon: ArrowLeftRight },
  { to: '/app/tarjetas', label: 'Tarjetas', icon: CreditCard },
  { to: '/app/pagos', label: 'Pagar servicios', icon: PiggyBank },
  { to: '/app/estadisticas', label: 'Estadísticas', icon: BarChart3 },
  { to: '/app/notificaciones', label: 'Notificaciones', icon: Bell },
  { to: '/app/ajustes', label: 'Ajustes', icon: Settings },
];

const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/clientes', label: 'Clientes', icon: Users },
  { to: '/admin/crear-cliente', label: 'Crear cliente', icon: UserPlus },
  { to: '/admin/activar-cuenta', label: 'Activar cuenta', icon: ShieldCheck },
  { to: '/admin/depositos', label: 'Depósitos', icon: Banknote },
  { to: '/admin/pagos-ventanilla', label: 'Pagos en ventanilla', icon: ReceiptIcon },
  { to: '/admin/cuentas-internas', label: 'Cuentas internas', icon: Building2 },
  { to: '/admin/bitacora', label: 'Bitácora', icon: History },
];

export default function Sidebar() {
  const rol = useAuthStore((s) => s.rol);
  const nombre = useAuthStore((s) => s.nombre);
  const logout = useAuthStore((s) => s.logout);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const closeSidebar = useUIStore((s) => s.closeSidebar);
  const navigate = useNavigate();
  const appName = import.meta.env.VITE_APP_NAME || 'Cosmos Bank';

  const nav = rol === 'ADMIN' ? ADMIN_NAV : CLIENT_NAV;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Overlay móvil
       *
       * IMPORTANTE: NO usamos `backdrop-blur` aquí. En iOS Safari y Chrome
       * Android, al cerrarse el overlay con la animación de `exit` (opacity → 0)
       * mientras simultáneamente se monta la nueva ruta, el `backdrop-filter`
       * deja "fantasmas" borrosos sobre el contenido nuevo hasta que el usuario
       * recarga. El degradado oscuro por sí solo ya basta para separar el menú
       * del fondo, y es órdenes de magnitud más barato gráficamente.
       */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeSidebar}
            className="fixed inset-0 z-30 bg-ink-900/70 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={clsx(
          'fixed lg:sticky top-0 z-40 h-screen w-[280px] shrink-0 transition-transform duration-300 ease-out',
          // En escritorio el sidebar siempre es visible.
          'lg:translate-x-0 lg:visible',
          // En móvil, cuando está cerrado lo movemos fuera de pantalla Y lo
          // marcamos como `invisible` para que el navegador no calcule el
          // `backdrop-filter` del panel oculto (causa de los "fantasmas" de
          // blur sobre el resto del UI tras navegar entre rutas).
          sidebarOpen
            ? 'translate-x-0 visible'
            : '-translate-x-full invisible lg:visible'
        )}
        aria-hidden={!sidebarOpen}
      >
        <div className="flex h-full flex-col p-4">
          <div className="glass rounded-3xl p-5 flex flex-col flex-1 shadow-glass">
            {/* Brand */}
            <div className="flex items-center gap-3 px-1">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-brand shadow-glow">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none">
                  <path d="M4 17 L12 5 L20 17 Z" fill="currentColor" />
                  <circle cx="12" cy="19.5" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <div className="leading-tight">
                <p className="text-base font-bold tracking-tight text-ink-900 dark:text-ink-50">
                  {appName}
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                  {rol === 'ADMIN' ? 'Consola admin' : 'Banca personal'}
                </p>
              </div>
            </div>

            <div className="divider my-5" />

            {/* Nav */}
            <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    clsx(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'text-white'
                        : 'text-ink-600 dark:text-ink-200 hover:text-ink-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="activeNav"
                          className="absolute inset-0 rounded-xl bg-gradient-brand shadow-glow"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <item.icon
                        className={clsx(
                          'relative z-10 h-4 w-4 shrink-0',
                          isActive ? 'text-white' : 'text-ink-400 group-hover:text-brand-500'
                        )}
                      />
                      <span className="relative z-10">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="divider my-4" />

            {/* User card */}
            <div className="rounded-2xl glass-soft p-3 flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white text-sm font-semibold">
                {(nombre || rol || 'U').slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-50">
                  {nombre || 'Usuario'}
                </p>
                <p className="text-[11px] uppercase tracking-wider text-muted">
                  {rol || 'invitado'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="ring-focus rounded-lg p-2 text-ink-400 hover:bg-rose-500/10 hover:text-rose-500"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
