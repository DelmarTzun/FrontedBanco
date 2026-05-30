import clsx from 'clsx';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-200 dark:border-white/10 p-10 text-center',
        className
      )}
    >
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
          <Icon className="h-6 w-6" />
        </div>
      )}
      {title && (
        <h4 className="text-base font-semibold text-ink-900 dark:text-ink-50">
          {title}
        </h4>
      )}
      {description && (
        <p className="max-w-sm text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
