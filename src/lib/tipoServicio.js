import { GraduationCap, Phone, Zap } from 'lucide-react';

/** Coincide con enum TipoServicioPublico de la API */
export const TIPO_SERVICIO = {
  UNIVERSIDAD: 1,
  TELEFONIA: 2,
  ENERGIA: 3,
};

export const SERVICIOS = [
  {
    id: TIPO_SERVICIO.UNIVERSIDAD,
    nombre: 'Universidad',
    descripcion: 'Pago universitario por carné',
    placeholder: 'Carné del estudiante',
    icon: GraduationCap,
    accent: 'from-violet-500 to-fuchsia-500',
  },
  {
    id: TIPO_SERVICIO.TELEFONIA,
    nombre: 'Telefonía',
    descripcion: 'Recarga / factura por número',
    placeholder: 'Número telefónico',
    icon: Phone,
    accent: 'from-cyan-500 to-blue-500',
  },
  {
    id: TIPO_SERVICIO.ENERGIA,
    nombre: 'Energía eléctrica',
    descripcion: 'Pago por número de contador',
    placeholder: 'NIS / contador',
    icon: Zap,
    accent: 'from-amber-400 to-orange-500',
  },
];

export const getServicio = (id) => SERVICIOS.find((s) => s.id === Number(id));
