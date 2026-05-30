import { forwardRef } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-gradient-brand text-white shadow-glow hover:brightness-110 active:brightness-95',
  secondary:
    'bg-ink-100 text-ink-900 dark:bg-ink-700/70 dark:text-ink-50 hover:bg-ink-200 dark:hover:bg-ink-700',
  ghost:
    'bg-transparent text-ink-700 dark:text-ink-100 hover:bg-ink-100/70 dark:hover:bg-white/5',
  outline:
    'bg-transparent border border-ink-200 dark:border-white/10 text-ink-900 dark:text-ink-50 hover:bg-ink-100/60 dark:hover:bg-white/5',
  danger:
    'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-[0_10px_30px_-12px_rgba(244,63,94,0.6)] hover:brightness-110',
  success:
    'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_10px_30px_-12px_rgba(16,185,129,0.6)] hover:brightness-110',
};

const sizes = {
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-11 px-4 text-sm rounded-xl',
  lg: 'h-12 px-5 text-base rounded-xl',
  xl: 'h-14 px-6 text-base rounded-2xl',
  icon: 'h-10 w-10 rounded-xl',
};

const Button = forwardRef(function Button(
  {
    children,
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    type = 'button',
    disabled,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={clsx(
        'group inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200',
        'ring-focus select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:brightness-100',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        LeftIcon && <LeftIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
      )}
      {children}
      {!loading && RightIcon && (
        <RightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      )}
    </button>
  );
});

export default Button;
