import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';
import clsx from 'clsx';
import { useNotificationStore } from '../../store/notificationStore';

const styles = {
  success: {
    icon: CheckCircle2,
    ring: 'ring-emerald-400/40',
    accent: 'from-emerald-500/40 to-emerald-500/0',
    text: 'text-emerald-500',
  },
  error: {
    icon: AlertOctagon,
    ring: 'ring-rose-400/40',
    accent: 'from-rose-500/40 to-rose-500/0',
    text: 'text-rose-500',
  },
  warning: {
    icon: AlertTriangle,
    ring: 'ring-amber-400/40',
    accent: 'from-amber-500/40 to-amber-500/0',
    text: 'text-amber-500',
  },
  info: {
    icon: Info,
    ring: 'ring-brand-400/40',
    accent: 'from-brand-500/40 to-brand-500/0',
    text: 'text-brand-500',
  },
};

export default function ToastContainer() {
  const toasts = useNotificationStore((s) => s.toasts);
  const dismiss = useNotificationStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:top-6 sm:items-end sm:right-6 sm:left-auto">
      <AnimatePresence>
        {toasts.map((t) => {
          const s = styles[t.type] || styles.info;
          const Icon = s.icon;
          return (
            <motion.div
              key={t.id}
              role="status"
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.95 }}
              transition={{ duration: 0.22 }}
              className={clsx(
                'pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl glass shadow-glass ring-1',
                s.ring
              )}
            >
              <div
                className={clsx(
                  'absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r',
                  s.accent
                )}
              />
              <div className="flex items-start gap-3 p-4">
                <div className={clsx('mt-0.5', s.text)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  {t.title && (
                    <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">
                      {t.title}
                    </p>
                  )}
                  {t.message && (
                    <p className="mt-0.5 text-sm text-muted">{t.message}</p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-100"
                  aria-label="Cerrar notificación"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
