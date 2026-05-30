import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Landmark } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { fmtMoney } from '../../lib/format';
import { getTipoCuenta } from '../../lib/tipoCuenta';

export default function AccountSelector({
  cuentas = [],
  cuentaActiva,
  onChange,
  className,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!cuentaActiva) return null;
  const tipo = getTipoCuenta(cuentaActiva.idTipoCuenta);

  return (
    <div ref={ref} className={clsx('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="ring-focus glass flex items-center gap-3 rounded-2xl px-3 py-2 shadow-soft hover:shadow-glow transition-shadow"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500/15 text-brand-500">
          <Landmark className="h-4 w-4" />
        </span>
        <div className="text-left">
          <p className="text-[11px] uppercase tracking-wider text-muted">
            {tipo.nombre} · {cuentaActiva.noCuenta}
          </p>
          <p className="font-mono text-sm font-semibold text-ink-900 dark:text-ink-50">
            {fmtMoney(cuentaActiva.saldo)}
          </p>
        </div>
        <ChevronDown
          className={clsx(
            'h-4 w-4 text-ink-400 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {open && cuentas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="absolute z-30 mt-2 w-72 rounded-2xl glass p-2 shadow-glass"
          >
            {cuentas.map((c) => {
              const t = getTipoCuenta(c.idTipoCuenta);
              const selected = c.idCuenta === cuentaActiva.idCuenta;
              return (
                <button
                  key={c.idCuenta}
                  onClick={() => {
                    onChange?.(c.idCuenta);
                    setOpen(false);
                  }}
                  className={clsx(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors',
                    selected
                      ? 'bg-brand-500/15'
                      : 'hover:bg-white/50 dark:hover:bg-white/5'
                  )}
                >
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted">
                      {t.nombre} · {c.noCuenta}
                    </p>
                    <p className="font-mono text-sm font-semibold text-ink-900 dark:text-ink-50">
                      {fmtMoney(c.saldo)}
                    </p>
                  </div>
                  {selected && <Check className="h-4 w-4 text-brand-500" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
