import { create } from 'zustand';

let nextId = 1;

export const useNotificationStore = create((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = nextId++;
    const item = {
      id,
      type: 'info',
      duration: 4500,
      ...toast,
    };
    set((s) => ({ toasts: [...s.toasts, item] }));
    if (item.duration > 0) {
      setTimeout(() => get().dismiss(id), item.duration);
    }
    return id;
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

/** Helper para usar fuera de componentes (interceptors, etc.) */
export function pushToast(toast) {
  return useNotificationStore.getState().push(toast);
}
