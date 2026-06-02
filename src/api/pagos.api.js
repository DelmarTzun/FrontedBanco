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

  /**
   * POST /api/Pagos/ventanilla  (ADMIN)
   * Pago de servicios públicos en ventanilla del banco (efectivo).
   * No requiere tarjeta ni PIN: el operador recibe el dinero en caja y
   * el sistema lo distribuye 95/5 manteniendo las comisiones intactas.
   */
  async ejecutarVentanilla({
    tipoServicio,
    identificador,
    monto,
    referenciaCliente,
    nombrePagador,
    documentoPagador,
  }) {
    const { data } = await http.post('/Pagos/ventanilla', {
      TipoServicio: tipoServicio,
      Identificador: identificador,
      Monto: monto,
      ReferenciaCliente: referenciaCliente ?? null,
      NombrePagador: nombrePagador ?? null,
      DocumentoPagador: documentoPagador ?? null,
    });
    return data; // PagoVentanillaResultadoDto
  },
};
