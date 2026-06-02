import { http } from './http';

export const operacionesApi = {
  /**
   * POST /api/Operaciones/deposito  (ADMIN)
   *
   * Los depósitos ya no se hacen desde el portal del cliente: solo el
   * administrador (ventanilla) puede acreditar fondos a una cuenta.
   */
  async depositar({ idCuenta, monto, referencia }) {
    const { data } = await http.post('/Operaciones/deposito', {
      IdCuenta: idCuenta,
      Monto: monto,
      Referencia: referencia ?? null,
    });
    return data; // MovimientoFinancieroResultadoDto
  },

  /** POST /api/Operaciones/retiro  (CLIENTE) */
  async retirar({ idCuenta, monto, referencia }) {
    const { data } = await http.post('/Operaciones/retiro', {
      IdCuenta: idCuenta,
      Monto: monto,
      Referencia: referencia ?? null,
    });
    return data;
  },

  /** GET /api/Operaciones/saldo/{idCuenta}  (CLIENTE) */
  async consultarSaldo(idCuenta) {
    const { data } = await http.get(`/Operaciones/saldo/${idCuenta}`);
    return data; // ConsultaSaldoDto
  },

  /** POST /api/Operaciones/transferir  (CLIENTE) */
  async transferir({ idCuentaOrigen, idCuentaDestino, monto, descripcion }) {
    const { data } = await http.post('/Operaciones/transferir', {
      IdCuentaOrigen: idCuentaOrigen,
      IdCuentaDestino: idCuentaDestino,
      Monto: monto,
      Descripcion: descripcion ?? '',
    });
    return data;
  },

  /** POST /api/Operaciones/activar-cuenta  (ADMIN) */
  async activarCuenta({ idCuenta, montoDeposito }) {
    const { data } = await http.post('/Operaciones/activar-cuenta', {
      IdCuenta: idCuenta,
      MontoDeposito: montoDeposito,
    });
    return data;
  },

  /** POST /api/Operaciones/suspender-cuenta/{idCuenta}  (ADMIN) */
  async suspenderCuenta(idCuenta) {
    const { data } = await http.post(`/Operaciones/suspender-cuenta/${idCuenta}`);
    return data; // CambioEstadoCuentaDto
  },

  /** POST /api/Operaciones/reactivar-cuenta/{idCuenta}  (ADMIN) */
  async reactivarCuenta(idCuenta) {
    const { data } = await http.post(`/Operaciones/reactivar-cuenta/${idCuenta}`);
    return data; // CambioEstadoCuentaDto
  },
};
