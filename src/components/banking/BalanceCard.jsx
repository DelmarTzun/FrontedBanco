import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { fmtMoney, fmtNumber } from '../../lib/format';
import { useCountUp } from '../../hooks/useCountUp';

/**
 * Tarjeta de KPI.
 * @param format 'money' (default) → muestra GTQ. 'number' → entero/conteo sin moneda.
 */
export default function BalanceCard({
  label,
  amount = 0,
  delta,
  tone = 'brand',
  icon: Icon,
  format = 'money',
  suffix,
}) {
  const animated = useCountUp(amount, 750);
  const positive = (delta ?? 0) >= 0;
  const displayValue =
    format === 'number'
      ? fmtNumber(Math.round(animated))
      : fmtMoney(animated);
  const toneRing = {
    brand: 'ring-brand-500/20',
    accent: 'ring-accent-500/20',
    success: 'ring-emerald-500/20',
    warning: 'ring-amber-500/20',
  }[tone];

  const toneIconBg = {
    brand: 'bg-brand-500/15 text-brand-500',
    accent: 'bg-accent-500/15 text-accent-500',
    success: 'bg-emerald-500/15 text-emerald-500',
    warning: 'bg-amber-500/15 text-amber-500',
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={clsx(
        'group relative overflow-hidden rounded-2xl glass p-5 ring-1 shadow-soft hover:-translate-y-0.5 transition-transform',
        toneRing
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-50">
            {displayValue}
            {suffix && (
              <span className="ml-1 text-sm font-medium text-muted">
                {suffix}
              </span>
            )}
          </p>
        </div>
        {Icon && (
          <span
            className={clsx(
              'grid h-10 w-10 place-items-center rounded-xl',
              toneIconBg
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      {typeof delta === 'number' && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span
            className={clsx(
              'inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium',
              positive
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-rose-500/10 text-rose-500'
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {positive ? '+' : ''}
            {delta.toFixed(1)}%
          </span>
          <span className="text-muted">vs. mes anterior</span>
        </div>
      )}
    </motion.div>
  );
}
