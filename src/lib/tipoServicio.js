import { GraduationCap, Phone, Zap } from 'lucide-react';

/** Coincide con enum TipoServicioPublico de la API */
export const TIPO_SERVICIO = {
  UNIVERSIDAD: 1,
  TELEFONIA: 2,
  ENERGIA: 3,
};

/**
 * Cada servicio declara:
 *   - maxLength : límite duro del identificador
 *   - inputMode : pista de teclado en móvil ('numeric' por defecto)
 *   - regex     : validación final del identificador
 *   - sanitizar : función para limpiar caracteres no válidos en onChange
 */
export const SERVICIOS = [
  {
    id: TIPO_SERVICIO.UNIVERSIDAD,
    nombre: 'Universidad',
    descripcion: 'Pago universitario por código de carné',
    placeholder: 'Carné del estudiante (11 caracteres)',
    icon: GraduationCap,
    accent: 'from-violet-500 to-fuchsia-500',
    maxLength: 11,
    inputMode: 'text',
    // El carné UMG admite dígitos, letras y guiones (ej. 1001-26-0050)
    regex: /^[\w-]{1,11}$/,
    sanitizar: (v) => String(v).replace(/[^\w-]/g, '').slice(0, 11),
    mensajeInvalido: 'El carné debe tener máximo 11 caracteres válidos.',
  },
  {
    id: TIPO_SERVICIO.TELEFONIA,
    nombre: 'Telefonía',
    descripcion: 'Pago por número telefónico (8 dígitos)',
    placeholder: 'Número telefónico (8 dígitos)',
    icon: Phone,
    accent: 'from-cyan-500 to-blue-500',
    maxLength: 8,
    inputMode: 'numeric',
    regex: /^\d{8}$/,
    sanitizar: (v) => String(v).replace(/\D+/g, '').slice(0, 8),
    mensajeInvalido: 'El número telefónico debe tener exactamente 8 dígitos.',
  },
  {
    id: TIPO_SERVICIO.ENERGIA,
    nombre: 'Energía eléctrica',
    descripcion: 'Pago por número de contador (8 caracteres)',
    placeholder: 'Número de contador (8 caracteres)',
    icon: Zap,
    accent: 'from-amber-400 to-orange-500',
    maxLength: 8,
    // Los contadores de la empresa eléctrica pueden mezclar letras y dígitos
    // (ej. "AB123456", "12345678"), así que aceptamos alfanuméricos hasta 8.
    inputMode: 'text',
    regex: /^[A-Za-z0-9]{8}$/,
    sanitizar: (v) =>
      String(v)
        .replace(/[^A-Za-z0-9]+/g, '')
        .toUpperCase()
        .slice(0, 8),
    mensajeInvalido:
      'El número de contador debe tener exactamente 8 caracteres (letras o números).',
  },
];

export const getServicio = (id) => SERVICIOS.find((s) => s.id === Number(id));
