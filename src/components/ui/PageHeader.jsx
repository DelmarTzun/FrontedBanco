import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={clsx(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-50">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted max-w-2xl">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </motion.header>
  );
}
