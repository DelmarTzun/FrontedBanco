import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { pushToast } from '../store/notificationStore';

/**
 * Resolución de baseURL:
 *  - Si VITE_USE_PROXY === 'true', usamos ruta relativa "/api"
 *    (las peticiones van al dev server, que las reenvía al backend
 *    según `server.proxy` en vite.config.js; esto sortea CORS).
 *  - En caso contrario, usamos la URL absoluta definida en VITE_API_BASE_URL.
 */
const useProxy = import.meta.env.VITE_USE_PROXY === 'true';
const baseURL = useProxy
  ? '/api'
  : import.meta.env.VITE_API_BASE_URL || '/api';

export const http = axios.create({
  baseURL,
  timeout: 25_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

/* ------------------------------------------------------------------
 * Request interceptor: adjunta el JWT automáticamente
 * ------------------------------------------------------------------ */
http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ------------------------------------------------------------------
 * Response interceptor: normaliza errores y maneja 401
 * ------------------------------------------------------------------ */
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status ?? 0;
    const data = error?.response?.data;
    const url = error?.config?.url || '';
    const isLogin = /\/Auth\/login$/i.test(url);

    // Intentamos sacar el mensaje del backend ({ mensaje, error, detalles, traceId })
    const backendMsg = data?.mensaje || data?.error;

    // Fallbacks amigables por status si el backend no envía cuerpo
    let friendly = backendMsg;
    if (!friendly) {
      if (status === 0) {
        friendly =
          'No se pudo contactar al banco. Revisa tu conexión a internet.';
      } else if (status === 400) {
        friendly = 'Los datos enviados no son válidos. Verifica el formulario.';
      } else if (status === 401) {
        friendly = isLogin
          ? 'Credenciales incorrectas. Verifica tu usuario y contraseña.'
          : 'Tu sesión ya no es válida. Inicia sesión nuevamente.';
      } else if (status === 403) {
        friendly = 'No tienes permisos para realizar esta operación.';
      } else if (status === 404) {
        friendly = 'No se encontró el recurso solicitado.';
      } else if (status === 409) {
        friendly = 'Hay un conflicto con la información enviada (¿duplicado?).';
      } else if (status >= 500) {
        const traceId = data?.traceId ? ` (ref: ${data.traceId.slice(0, 8)}…)` : '';
        friendly = `Ocurrió un error en el banco${traceId}. Intenta de nuevo en unos minutos.`;
      } else {
        friendly = error.message || 'Ha ocurrido un error inesperado.';
      }
    }

    const normalized = {
      status,
      message: friendly,
      details: Array.isArray(data?.detalles) ? data.detalles : [],
      traceId: data?.traceId ?? null,
      isLogin,
      raw: data,
    };

    // Sesión expirada: solo si HAY token previo y NO es la llamada de login
    if (status === 401 && !isLogin) {
      const { token, logout } = useAuthStore.getState();
      if (token) {
        logout();
        pushToast({
          type: 'warning',
          title: 'Sesión expirada',
          message: 'Vuelve a iniciar sesión para continuar.',
        });
      }
    }

    return Promise.reject(normalized);
  }
);
