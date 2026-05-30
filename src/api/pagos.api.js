import { http } from './http';

/**
 * Tipo de servicio: 1 Universidad · 2 Telefonía · 3 Energía
 */
export const pagosApi = {
  async validar({ tipoServicio, identificador }) {
    const { data } = await http.post('/Pagos/validar', {
      TipoServicio: tipoServicio,
      Identificador: identificador,
    });
    return data; // ValidacionIdentificadorResultadoDto
  },

  /**
   * El backend devuelve un decimal directo (no un objeto).
   * Normalizamos a `{ monto }` para que la UI sea consistente.
   */
  async consultarDeuda({ tipoServicio, identificador }) {
    const { data } = await http.get(
      `/Pagos/consultar-deuda/${tipoServicio}/${encodeURIComponent(identificador)}`
    );
    return { monto: Number(data) };
  },

  async ejecutar({
    numeroTarjeta,
    pin,
    tipoServicio,
    identificador,
    monto,
    referenciaCliente,
    mesVencimiento,
    anioVencimiento,
  }) {
    const { data } = await http.post('/Pagos/ejecutar', {
      NumeroTarjeta: numeroTarjeta,
      Pin: pin,
      TipoServicio: tipoServicio,
      Identificador: identificador,
      Monto: monto,
      ReferenciaCliente: referenciaCliente ?? null,
      MesVencimiento: mesVencimiento ?? null,
      AnioVencimiento: anioVencimiento ?? null,
    });
    return data; // PagoServicioResultadoDto
  },
};
