import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function Card({
  as = 'div',
  className,
  variant = 'glass',
  hoverable = false,
  children,
  ...props
}) {
  const Comp = motion[as] || motion.div;
  const variantClass =
    variant === 'glass'
      ? 'glass'
      : variant === 'solid'
      ? 'surface'
      : 'glass-soft';

  return (
    <Comp
      className={clsx(
        'rounded-2xl shadow-soft transition-all',
        variantClass,
        hoverable && 'hover:-translate-y-0.5 hover:shadow-glow',
        className
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div
      className={clsx(
        'flex items-start justify-between gap-4 p-5 sm:p-6',
        className
      )}
    >
      <div className="space-y-1">
        {title && (
          <h3 className="text-base font-semibold text-ink-900 dark:text-ink-50">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-muted">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }) {
  return (
    <div className={clsx('px-5 pb-5 sm:px-6 sm:pb-6', className)}>{children}</div>
  );
}
