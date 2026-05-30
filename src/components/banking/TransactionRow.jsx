import {
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  ReceiptText,
  Shuffle,
  Wallet,
} from 'lucide-react';
import clsx from 'clsx';
import { fmtMoney, fmtDateTime } from '../../lib/format';

/**
 * Mapeo defensivo: el backend devuelve codigoTipoTransaccion.
 * Conocidos: DEP, RET, TRF_IN, TRF_OUT, PAG, COM
 */
function metaPorCodigo(codigo = '') {
  const c = codigo.toUpperCase();
  if (c.startsWith('DEP'))
    return { label: 'Depósito', icon: ArrowDownLeft, tone: 'in' };
  if (c.startsWith('RET'))
    return { label: 'Retiro', icon: ArrowUpRight, tone: 'out' };
  if (c.includes('TRF_IN') || c === 'TRF_IN')
    return { label: 'Transferencia recibida', icon: ArrowDownLeft, tone: 'in' };
  if (c.includes('TRF') || c === 'TRF_OUT')
    return { label: 'Transferencia enviada', icon: Shuffle, tone: 'out' };
  if (c.startsWith('PAG'))
    return { label: 'Pago de servicio', icon: ReceiptText, tone: 'out' };
  if (c.startsWith('COM'))
    return { label: 'Comisión bancaria', icon: PiggyBank, tone: 'out' };
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
  const isComission = meta.tone === 'out' && codigoTipoTransaccion?.startsWith('COM');

  return (
    <div className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/40 dark:hover:bg-white/5">
      <div
        className={clsx(
          'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
          inflow
            ? 'bg-emerald-500/15 text-emerald-500'
            : isComission
            ? 'bg-amber-500/15 text-amber-500'
            : 'bg-rose-500/10 text-rose-500'
        )}
      >
        <meta.icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-50">
          {descripcionTipoTransaccion || meta.label}
        </p>
        <p className="text-xs text-muted">{fmtDateTime(fechaUtc)}</p>
      </div>
      <div
        className={clsx(
          'shrink-0 font-mono text-sm font-semibold tabular-nums',
          inflow ? 'text-emerald-500' : 'text-ink-900 dark:text-ink-50'
        )}
      >
        {inflow ? '+' : '−'} {fmtMoney(Math.abs(monto))}
      </div>
    </div>
  );
}
