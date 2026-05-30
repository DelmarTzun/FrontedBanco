import { http } from './http';

export const cuentasApi = {
  /** GET /api/Cuentahabientes/{idCliente}/cuentas */
  async listarPorCliente(idCliente) {
    const { data } = await http.get(`/Cuentahabientes/${idCliente}/cuentas`);
    return data; // CuentaListadaDto[]
  },

  /** POST /api/Cuentahabientes/perfil  (ADMIN) */
  async crearPerfil(dto) {
    const { data } = await http.post('/Cuentahabientes/perfil', dto);
    return data; // CuentahabienteCreadoDto
  },

  /** POST /api/Cuentahabientes/tarjeta  (ADMIN) */
  async asociarTarjeta(idCuenta) {
    const { data } = await http.post('/Cuentahabientes/tarjeta', {
      IdCuenta: idCuenta,
    });
    return data; // TarjetaDebitoDto
  },

  /** GET /api/Cuentahabientes  (ADMIN) */
  async listarTodos() {
    const { data } = await http.get('/Cuentahabientes');
    return data;
  },

  /** GET /api/Cuentahabientes/cuentas-internas  (ADMIN)
   *  Devuelve CuentaInternaDto[] con saldos y estados de las cuentas operacionales del banco.
   */
  async listarCuentasInternas() {
    const { data } = await http.get('/Cuentahabientes/cuentas-internas');
    return data;
  },

  /** POST /api/Cuentahabientes/{idCliente}/reset-password  (ADMIN)
   *  Devuelve { idCliente, nombreCompleto, correoElectronico, passwordTemporal }.
   */
  async resetearPassword(idCliente) {
    const { data } = await http.post(
      `/Cuentahabientes/${idCliente}/reset-password`
    );
    return data;
  },
};
