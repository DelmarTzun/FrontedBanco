import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  PiggyBank,
  ReceiptText,
  Shuffle,
  Wallet,
} from 'lucide-react';
import clsx from 'clsx';
import { fmtMoney, fmtDateTime } from '../../lib/format';

/**
 * Mapea el código que envía el backend (descripcion completa del
 * tipo_transaccion en la BD) a la metadata de UI: etiqueta legible, ícono
 * y "tone" (in = ingreso/verde, out = egreso/rojo, neutral = gris).
 *
 * Los códigos completos vienen del seed (schema/wipe_and_admin.sql):
 *   DEPOSITO, RETIRO,
 *   PAGO_SERVICIO_DEBITO_CUENTAHABIENTE,
 *   PAGO_SERVICIO_ACREDITACION_PRESTADORA,
 *   PAGO_SERVICIO_COMISION_BANCO,
 *   TRANSFERENCIA_ORIGEN, TRANSFERENCIA_DESTINO,
 *   PAGO_VENTANILLA_INGRESO_EFECTIVO,
 *   PAGO_VENTANILLA_TRANSFERENCIA_PRESTADORA.
 *
 * También aceptamos los códigos cortos legacy (DEP, RET, TRF_IN, TRF_OUT,
 * PAG, COM) por compatibilidad con clientes que aún los emitan.
 */
const META_POR_CODIGO = {
  DEPOSITO: { label: 'Depósito', icon: ArrowDownLeft, tone: 'in' },
  RETIRO: { label: 'Retiro', icon: ArrowUpRight, tone: 'out' },

  TRANSFERENCIA_DESTINO: {
    label: 'Transferencia recibida',
    icon: ArrowDownLeft,
    tone: 'in',
  },
  TRANSFERENCIA_ORIGEN: {
    label: 'Transferencia enviada',
    icon: Shuffle,
    tone: 'out',
  },

  PAGO_SERVICIO_DEBITO_CUENTAHABIENTE: {
    label: 'Pago de servicio',
    icon: ReceiptText,
    tone: 'out',
  },
  PAGO_SERVICIO_ACREDITACION_PRESTADORA: {
    label: 'Acreditación prestadora',
    icon: ArrowDownLeft,
    tone: 'in',
  },
  PAGO_SERVICIO_COMISION_BANCO: {
    label: 'Comisión bancaria',
    icon: PiggyBank,
    tone: 'in',
  },

  PAGO_VENTANILLA_INGRESO_EFECTIVO: {
    label: 'Ingreso ventanilla',
    icon: Banknote,
    tone: 'in',
  },
  PAGO_VENTANILLA_TRANSFERENCIA_PRESTADORA: {
    label: 'Egreso a prestadora',
    icon: Shuffle,
    tone: 'out',
  },

  // Códigos cortos legacy
  DEP: { label: 'Depósito', icon: ArrowDownLeft, tone: 'in' },
  RET: { label: 'Retiro', icon: ArrowUpRight, tone: 'out' },
  TRF_IN: { label: 'Transferencia recibida', icon: ArrowDownLeft, tone: 'in' },
  TRF_OUT: { label: 'Transferencia enviada', icon: Shuffle, tone: 'out' },
  PAG: { label: 'Pago de servicio', icon: ReceiptText, tone: 'out' },
  COM: { label: 'Comisión bancaria', icon: PiggyBank, tone: 'in' },
};

function metaPorCodigo(codigo = '') {
  const c = String(codigo).toUpperCase().trim();
  if (META_POR_CODIGO[c]) return META_POR_CODIGO[c];

  // Fallback heurístico para futuros tipos que aún no estén en la tabla.
  if (c.startsWith('DEP') || c.includes('INGRESO') || c.includes('DESTINO') || c.includes('ACREDITACION'))
    return { label: codigo, icon: ArrowDownLeft, tone: 'in' };
  if (c.startsWith('RET') || c.includes('EGRESO') || c.includes('ORIGEN') || c.includes('DEBITO'))
    return { label: codigo, icon: ArrowUpRight, tone: 'out' };

  return { label: codigo || 'Movimiento', icon: Wallet, tone: 'neutral' };
}

export default function TransactionRow({ movimiento }) {
  if (!movimiento) return null;
  const {
    monto,
    codigoTipoTransaccion,
    descripcionTipoTransaccion,
    fechaUtc,
  } = movimiento;

  const meta = metaPorCodigo(codigoTipoTransaccion);
  const inflow = meta.tone === 'in';
  const outflow = meta.tone === 'out';

  return (
    <div className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/40 dark:hover:bg-white/5">
      <div
        className={clsx(
          'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
          inflow && 'bg-emerald-500/15 text-emerald-500',
          outflow && 'bg-rose-500/10 text-rose-500',
          !inflow && !outflow && 'bg-ink-500/10 text-ink-500'
        )}
      >
        <meta.icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-50">
          {meta.label || descripcionTipoTransaccion || codigoTipoTransaccion}
        </p>
        <p className="text-xs text-muted">{fmtDateTime(fechaUtc)}</p>
      </div>
      <div
        className={clsx(
          'shrink-0 font-mono text-sm font-semibold tabular-nums',
          inflow && 'text-emerald-500',
          outflow && 'text-rose-500',
          !inflow && !outflow && 'text-ink-900 dark:text-ink-50'
        )}
      >
        {inflow ? '+ ' : outflow ? '− ' : ''}
        {fmtMoney(Math.abs(monto))}
      </div>
    </div>
  );
}
