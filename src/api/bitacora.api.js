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
};
