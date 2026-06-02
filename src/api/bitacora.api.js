import { http } from './http';

export const bitacoraApi = {
  /** GET /api/Bitacora/kardex/{idCuenta}?desde&hasta */
  async kardex({ idCuenta, desde, hasta }) {
    const params = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    const { data } = await http.get(`/Bitacora/kardex/${idCuenta}`, { params });
    return data; // MovimientoBitacoraDto[]
  },

  /**
   * GET /api/Bitacora/metricas-admin  (ADMIN)
   * Devuelve métricas agregadas para el dashboard administrativo:
   *   { clientesRegistrados, operacionesHoy, volumenMensual,
   *     cuentasInactivas, generadoUtc }
   */
  async metricasAdmin() {
    const { data } = await http.get('/Bitacora/metricas-admin');
    return data;
  },
};
