import { forwardRef, useId } from 'react';
import clsx from 'clsx';

const Input = forwardRef(function Input(
  {
    label,
    hint,
    error,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className,
    id,
    type = 'text',
    ...props
  },
  ref
) {
  const reactId = useId();
  const inputId = id || reactId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium uppercase tracking-wider text-ink-500 dark:text-ink-300"
        >
          {label}
        </label>
      )}
      <div
        className={clsx(
          'group relative flex items-center rounded-xl border transition-all',
          'bg-white/70 dark:bg-ink-800/70 backdrop-blur',
          error
            ? 'border-rose-400/70 focus-within:ring-2 focus-within:ring-rose-400/40'
            : 'border-ink-200 dark:border-white/10 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/30'
        )}
      >
        {LeftIcon && (
          <LeftIcon
            className={clsx(
              'pointer-events-none absolute left-3 h-4 w-4',
              error
                ? 'text-rose-400'
                : 'text-ink-400 group-focus-within:text-brand-500'
            )}
          />
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={clsx(
            'h-12 w-full bg-transparent text-sm text-ink-900 dark:text-ink-50 placeholder:text-ink-400 outline-none',
            LeftIcon ? 'pl-10' : 'pl-4',
            RightIcon ? 'pr-10' : 'pr-4',
            className
          )}
          {...props}
        />
        {RightIcon && (
          <span className="absolute right-3 flex h-5 w-5 items-center justify-center text-ink-400">
            <RightIcon className="h-4 w-4" />
          </span>
        )}
      </div>
      {hint && !error && (
        <p className="text-xs text-ink-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-rose-500 animate-slide-up">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
