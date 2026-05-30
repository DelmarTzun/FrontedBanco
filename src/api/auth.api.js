import { http } from './http';

export const authApi = {
  /**
   * POST /api/Auth/login
   * @param {{ credencial: string, password: string }} payload
   * @returns {Promise<{ idUsuario:number, idCliente:number, rol:string, token:string }>}
   */
  async login({ credencial, password }) {
    const { data } = await http.post('/Auth/login', {
      Credencial: credencial,
      Password: password,
    });
    return data;
  },

  /**
   * POST /api/Auth/cambiar-password
   * Cambia la contraseña del usuario autenticado.
   * @param {{ passwordActual: string, passwordNueva: string }} payload
   * @returns {Promise<{ mensaje: string }>}
   */
  async cambiarPassword({ passwordActual, passwordNueva }) {
    const { data } = await http.post('/Auth/cambiar-password', {
      PasswordActual: passwordActual,
      PasswordNueva: passwordNueva,
    });
    return data;
  },
};
