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
    const status = error?.response?.status;
    const data = error?.response?.data;

    // El backend devuelve { mensaje, error, detalles } — normalizamos
    const normalized = {
      status: status ?? 0,
      message:
        data?.mensaje ||
        data?.error ||
        error.message ||
        'Ha ocurrido un error inesperado.',
      details: Array.isArray(data?.detalles) ? data.detalles : [],
      raw: data,
    };

    if (status === 401) {
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
