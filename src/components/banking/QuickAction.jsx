import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function QuickAction({
  icon: Icon,
  label,
  description,
  onClick,
  gradient = 'from-brand-500 to-accent-500',
  className,
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      className={clsx(
        'group flex w-full items-center gap-4 rounded-2xl glass p-4 text-left transition-all hover:shadow-glow',
        className
      )}
    >
      <span
        className={clsx(
          'grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-glow',
          gradient
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-xs text-muted truncate">{description}</p>
        )}
      </div>
    </motion.button>
  );
}
