import { useMemo } from 'react';
import { Bell, ArrowDownLeft, ArrowUpRight, Receipt, Shuffle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';
import { useCuentas } from '../../hooks/useCuentas';
import { useKardex } from '../../hooks/useKardex';
import { fmtRelative, fmtMoney } from '../../lib/format';

function iconFor(code = '') {
  const c = code.toUpperCase();
  if (c.startsWith('DEP')) return ArrowDownLeft;
  if (c.startsWith('RET')) return ArrowUpRight;
  if (c.includes('TRF')) return Shuffle;
  if (c.startsWith('PAG')) return Receipt;
  return Bell;
}

export default function NotificationsPage() {
  const { cuentaActiva } = useCuentas();
  const { data, loading } = useKardex({ idCuenta: cuentaActiva?.idCuenta });

  const items = useMemo(
    () =>
      [...data]
        .sort((a, b) => new Date(b.fechaUtc) - new Date(a.fechaUtc))
        .slice(0, 30),
    [data]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificaciones"
        description="Mantente al día con cada movimiento de tus cuentas."
        icon={Bell}
      />
      <Card>
        <CardHeader
          title={
            <span className="inline-flex items-center gap-2">
              Centro de actividad <Badge tone="brand">{items.length}</Badge>
            </span>
          }
        />
        <CardBody>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Sin notificaciones"
              description="Recibirás alertas en tiempo real sobre depósitos, retiros y pagos."
            />
          ) : (
            <ul className="divide-y divide-ink-100 dark:divide-white/5">
              {items.map((m) => {
                const Icon = iconFor(m.codigoTipoTransaccion);
                const code = (m.codigoTipoTransaccion || '').toUpperCase();
                const isIn = code.startsWith('DEP') || code.includes('TRF_IN');
                return (
                  <li
                    key={m.idTransaccion}
                    className="flex items-start gap-3 py-3"
                  >
                    <div
                      className={
                        'grid h-10 w-10 shrink-0 place-items-center rounded-xl ' +
                        (isIn
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-brand-500/15 text-brand-500')
                      }
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">
                        {m.descripcionTipoTransaccion || code}
                      </p>
                      <p className="text-xs text-muted">
                        {fmtRelative(m.fechaUtc)} · {fmtMoney(Math.abs(m.monto))}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
