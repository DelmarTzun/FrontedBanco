import { CheckCircle2, PauseCircle, Clock, HelpCircle } from 'lucide-react';

/**
 * Catálogo de estados de cuenta — alineado con el seed del backend
 * (ver schema/wipe_and_admin.sql y CodigosEstado.cs).
 *
 *   1 → ACTIVO
 *   2 → INACTIVO
 *   3 → PENDIENTE_ACTIVACION
 */
export const ESTADOS_CUENTA = {
  1: {
    id: 1,
    codigo: 'ACTIVO',
    label: 'Activa',
    tone: 'success',
    icon: CheckCircle2,
  },
  2: {
    id: 2,
    codigo: 'INACTIVO',
    label: 'Inactiva',
    tone: 'neutral',
    icon: PauseCircle,
  },
  3: {
    id: 3,
    codigo: 'PENDIENTE_ACTIVACION',
    label: 'Pendiente',
    tone: 'warning',
    icon: Clock,
  },
};

const FALLBACK = {
  id: 0,
  codigo: 'DESCONOCIDO',
  label: 'Sin estado',
  tone: 'neutral',
  icon: HelpCircle,
};

export const getEstadoCuenta = (id) => ESTADOS_CUENTA[Number(id)] || FALLBACK;
