import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function Spinner({ className, size = 'md' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-9 w-9',
  };
  return (
    <Loader2 className={clsx('animate-spin text-brand-500', sizes[size], className)} />
  );
}

export function FullScreenLoader({ label = 'Cargando...' }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted">
      <Spinner size="lg" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
