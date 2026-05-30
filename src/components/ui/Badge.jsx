import clsx from 'clsx';

const tones = {
  brand:
    'bg-brand-500/10 text-brand-600 dark:text-brand-300 ring-brand-500/20',
  accent:
    'bg-accent-500/10 text-accent-600 dark:text-accent-400 ring-accent-500/20',
  success:
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 ring-emerald-500/20',
  warning:
    'bg-amber-500/10 text-amber-600 dark:text-amber-300 ring-amber-500/20',
  danger:
    'bg-rose-500/10 text-rose-600 dark:text-rose-300 ring-rose-500/20',
  neutral:
    'bg-ink-200/40 text-ink-700 dark:bg-white/5 dark:text-ink-200 ring-ink-200/40 dark:ring-white/10',
};

export default function Badge({
  children,
  tone = 'brand',
  className,
  icon: Icon,
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        tones[tone],
        className
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}
