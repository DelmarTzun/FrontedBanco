/**
 * Centro único de límites/reglas de validación del frontend.
 *
 * Las longitudes coinciden con el schema MySQL del banco
 * (ver API_Banco/schema/Dump20260529.sql). Si algún día cambias
 * una columna en la BD, actualízalo aquí.
 */

export const LIMITES_DB = {
  cliente: {
    dpi: 20,        // varchar(20) en BD — pero CUI guatemalteco son 13 dígitos
    nit: 20,
    nombre: 100,
    apellido: 100,
    telefono: 20,
    email: 100,
  },
  cuenta: {
    noCuenta: 20,
  },
  bitacora: {
    referencia: 100, // referencia_vinculante varchar(100)
  },
  pagos: {
    identificador: 50, // identificador_servicio varchar(50)
  },
  tarjeta: {
    noTarjeta: 16,
    pin: 6,
  },
  usuario: {
    nombreUsuario: 50,
    correo: 150,
  },
};

/**
 * Reglas estrictas de negocio para CUI (DPI guatemalteco): 13 dígitos.
 */
export const REGLAS = {
  dpi: { length: 13, regex: /^\d{13}$/ },
  // NIT GT: 1 a 9 dígitos + opcional guion + dígito o "K"
  nit: { regex: /^\d{1,9}(-?[\dKk])?$/ },
  // Teléfonos GT: 8 dígitos.
  telefonoGT: { length: 8, regex: /^\d{8}$/ },
  email: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  numeroEntero: { regex: /^\d+$/ },
  numeroTarjeta: { length: 16, regex: /^\d{16}$/ },
  pin: { minLength: 4, maxLength: 6, regex: /^\d{4,6}$/ },
};

/* ------------------------------------------------------------------ *
 * Sanitizers: limpian la entrada del usuario en tiempo real.
 * Útiles en onChange para evitar caracteres ilegales.
 * ------------------------------------------------------------------ */

/** Devuelve solo los dígitos. */
export const soloDigitos = (str = '') => String(str).replace(/\D+/g, '');

/** Limita longitud después de filtrar. */
export const soloDigitosMax = (str, max) => soloDigitos(str).slice(0, max);

/** Formato "1234 5678 9012 3456" para tarjetas. */
export function formatearTarjeta(str = '') {
  const digits = soloDigitos(str).slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

/* ------------------------------------------------------------------ *
 * Validadores puntuales (devuelven null si OK, string con el error).
 * ------------------------------------------------------------------ */

export const validarDpi = (v) =>
  REGLAS.dpi.regex.test(v) ? null : 'El DPI debe tener exactamente 13 dígitos.';

export const validarTelefonoGT = (v) =>
  !v || REGLAS.telefonoGT.regex.test(v)
    ? null
    : 'El teléfono debe tener 8 dígitos.';

export const validarEmail = (v) =>
  !v || REGLAS.email.regex.test(v)
    ? null
    : 'El correo no tiene un formato válido.';

export const validarMes = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 12
    ? null
    : 'El mes debe estar entre 1 y 12.';
};

export const validarAnio = (v) => {
  const n = Number(v);
  const anioActual = new Date().getFullYear();
  return Number.isInteger(n) && n >= anioActual && n <= anioActual + 20
    ? null
    : `El año debe estar entre ${anioActual} y ${anioActual + 20}.`;
};

export const validarMontoPositivo = (v, min = 0.01) =>
  Number.isFinite(+v) && +v >= min
    ? null
    : `El monto debe ser mayor o igual a ${min}.`;

export const validarIdCuenta = (v) =>
  Number.isInteger(+v) && +v > 0
    ? null
    : 'El ID de cuenta debe ser un número entero positivo.';

/* ------------------------------------------------------------------ *
 * Topes operativos del banco. DEBEN coincidir con los del backend
 * (API_Banco.Application.Services.Internos.ValidadoresEntrada).
 * ------------------------------------------------------------------ */

/**
 * Tope máximo permitido en una sola operación de ingreso de efectivo:
 * - depósito por ventanilla (admin),
 * - activación de cuenta con saldo inicial.
 *
 * El frontend lo aplica como validación temprana; el backend lo aplica
 * como blindaje final. Cambios aquí requieren cambiar también el backend.
 */
export const LIMITES_OPERACION = {
  MONTO_MAXIMO_OPERACION: 50_000,
};

/**
 * Valida un monto contra el tope operativo del banco. Devuelve null si OK
 * o un mensaje de error legible si excede el tope o no es positivo.
 */
export const validarMontoOperacion = (v, etiqueta = 'monto') => {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) {
    return `El ${etiqueta} debe ser mayor a cero.`;
  }
  if (n > LIMITES_OPERACION.MONTO_MAXIMO_OPERACION) {
    return `El ${etiqueta} no puede exceder Q${LIMITES_OPERACION.MONTO_MAXIMO_OPERACION.toLocaleString('es-GT')}.`;
  }
  return null;
};
