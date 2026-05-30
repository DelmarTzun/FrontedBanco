import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Wifi, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { chunkCard, fmtMoney } from '../../lib/format';

/**
 * Tarjeta virtual premium con:
 *  - Glassmorphism con malla degradada
 *  - Tilt 3D al pasar el mouse
 *  - Highlight holográfico (gradiente animado)
 */
export default function VirtualCard({
  numero = '0000000000000000',
  titular = 'CUENTAHABIENTE',
  vencMes = 12,
  vencAnio = 2028,
  saldo = 0,
  variant = 'brand',
  hideAmount = false,
  className,
  onClick,
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50, 50], [10, -10]);
  const rotateY = useTransform(x, [-50, 50], [-10, 10]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const variants = {
    brand: 'bg-gradient-card',
    alt: 'bg-gradient-card-alt',
    aqua: 'bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-700',
    sunset: 'bg-gradient-to-br from-rose-500 via-fuchsia-600 to-indigo-700',
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        'group relative aspect-[1.6/1] w-full max-w-md overflow-hidden rounded-3xl p-6 text-left text-white shadow-glass',
        variants[variant] || variants.brand,
        className
      )}
    >
      {/* Holographic shine */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-x-12 -inset-y-12 bg-shimmer bg-[length:200%_100%] opacity-30 animate-shimmer"
      />
      {/* Pattern */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.35) 0px, transparent 40%)',
        }}
      />

      <div className="relative flex flex-col h-full justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">
              {hideAmount ? 'Tarjeta' : 'Saldo disponible'}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              {hideAmount ? '••••' : fmtMoney(saldo)}
            </p>
          </div>
          <Wifi className="h-5 w-5 rotate-90 text-white/80" />
        </div>

        <div>
          <p className="font-mono text-lg sm:text-xl tracking-[0.18em] text-white/95">
            {chunkCard(numero)}
          </p>
          <div className="mt-3 flex items-end justify-between text-xs">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/60">
                Titular
              </p>
              <p className="text-sm font-semibold uppercase">{titular}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-white/60">
                Expira
              </p>
              <p className="text-sm font-mono">
                {String(vencMes).padStart(2, '0')}/{String(vencAnio).slice(-2)}
              </p>
            </div>
            <svg viewBox="0 0 48 32" className="h-7 w-12" fill="none">
              <circle cx="16" cy="16" r="12" fill="#F59E0B" />
              <circle cx="32" cy="16" r="12" fill="#EF4444" opacity="0.85" />
            </svg>
          </div>
        </div>
      </div>

      {onClick && (
        <ChevronRight className="absolute top-4 right-4 h-4 w-4 text-white/60 opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </motion.button>
  );
}
