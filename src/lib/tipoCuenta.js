/** Catálogo de tipo de cuenta — alineado con la API */
export const TIPOS_CUENTA = [
  { id: 1, nombre: 'Monetaria', codigo: 'MON' },
  { id: 2, nombre: 'Ahorro', codigo: 'AHO' },
];

export const getTipoCuenta = (id) =>
  TIPOS_CUENTA.find((t) => t.id === Number(id)) || {
    id,
    nombre: 'Cuenta',
    codigo: '—',
  };
