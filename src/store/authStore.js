import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

/**
 * Sesión persistente en localStorage.
 * Mantenemos solo lo esencial; el resto lo derivamos del JWT.
 */
export const useAuthStore = create()(
  persist(
    (set, get) => ({
      token: null,
      idUsuario: null,
      idCliente: null,
      rol: null,            // 'ADMIN' | 'CLIENTE'
      nombre: null,         // opcional, lo seteamos si vine en claims
      cuentaActivaId: null, // último idCuenta utilizado por el cliente

      isAuthenticated: () => {
        const t = get().token;
        if (!t) return false;
        try {
          const decoded = jwtDecode(t);
          return decoded?.exp ? decoded.exp * 1000 > Date.now() : true;
        } catch {
          return false;
        }
      },

      login: ({ token, idUsuario, idCliente, rol }) => {
        let nombre = null;
        try {
          const d = jwtDecode(token);
          // Preferimos `name` (combinado, lo emite el banco como nombre completo).
          // Si no, combinamos given_name + family_name. unique_name queda de fallback.
          const completo = d?.name?.trim();
          const dado = d?.given_name?.trim();
          const familia = d?.family_name?.trim();
          if (completo) {
            nombre = completo;
          } else if (dado || familia) {
            nombre = [dado, familia].filter(Boolean).join(' ');
          } else {
            nombre = d?.unique_name || null;
          }
        } catch {
          /* ignore */
        }
        set({ token, idUsuario, idCliente, rol: rol?.toUpperCase(), nombre });
      },

      logout: () =>
        set({
          token: null,
          idUsuario: null,
          idCliente: null,
          rol: null,
          nombre: null,
          cuentaActivaId: null,
        }),

      setCuentaActiva: (idCuenta) => set({ cuentaActivaId: idCuenta }),
    }),
    {
      name: 'cosmosbank.session.v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        idUsuario: state.idUsuario,
        idCliente: state.idCliente,
        rol: state.rol,
        nombre: state.nombre,
        cuentaActivaId: state.cuentaActivaId,
      }),
    }
  )
);
