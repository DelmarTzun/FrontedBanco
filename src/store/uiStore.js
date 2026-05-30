import { create } from 'zustand';

const STORAGE_KEY = 'cosmosbank.theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export const useUIStore = create((set, get) => ({
  theme: 'dark',
  sidebarOpen: false,

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    set({ theme: next });
  },
  setTheme: (t) => {
    applyTheme(t);
    localStorage.setItem(STORAGE_KEY, t);
    set({ theme: t });
  },

  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));

/** Aplica el tema al cargar la app (antes del render). */
export function initTheme() {
  const t = getInitialTheme();
  applyTheme(t);
  useUIStore.setState({ theme: t });
}
