import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  UserPlus,
  TrendingUp,
  ArrowRight,
  Activity,
  Banknote,
  RefreshCcw,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import BalanceCard from '../../components/banking/BalanceCard';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { cuentasApi } from '../../api/cuentas.api';
import { bitacoraApi } from '../../api/bitacora.api';
import { pushToast } from '../../store/notificationStore';

export default function AdminDashboardPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState(null);
  const [loadingMetricas, setLoadingMetricas] = useState(true);

  const cargarMetricas = async () => {
    setLoadingMetricas(true);
    try {
      const data = await bitacoraApi.metricasAdmin();
      setMetricas(data);
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'No se pudieron cargar las métricas',
        message: err.message,
      });
    } finally {
      setLoadingMetricas(false);
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await cuentasApi.listarTodos();
        if (alive) setClientes(Array.isArray(data) ? data : []);
      } catch (err) {
        pushToast({ type: 'error', title: 'Error', message: err.message });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    cargarMetricas();
    return () => {
      alive = false;
    };
  }, []);

  // Si las métricas todavía no llegaron, usamos clientes.length como fallback
  // optimista para que la primera tarjeta no se vea "0" durante la carga.
  const totalClientes = metricas?.clientesRegistrados ?? clientes.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consola de administración"
        description="Visión general del padrón de cuentahabientes y operaciones."
        icon={ShieldCheck}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={cargarMetricas}
              disabled={loadingMetricas}
              aria-label="Recargar métricas"
              title="Recargar métricas"
            >
              <RefreshCcw
                className={`h-4 w-4 ${loadingMetricas ? 'animate-spin' : ''}`}
              />
            </Button>
            <Link to="/admin/depositos">
              <Button variant="secondary" leftIcon={Banknote} size="md">
                Depositar
              </Button>
            </Link>
            <Link to="/admin/crear-cliente">
              <Button leftIcon={UserPlus} size="md">
                Nuevo cliente
              </Button>
            </Link>
          </div>
        }
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loadingMetricas && !metricas ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))
        ) : (
          <>
            <BalanceCard
              label="Clientes registrados"
              amount={totalClientes}
              icon={Users}
              tone="brand"
              format="number"
            />
            <BalanceCard
              label="Operaciones hoy"
              amount={metricas?.operacionesHoy ?? 0}
              icon={Activity}
              tone="accent"
              format="number"
            />
            <BalanceCard
              label="Volumen mensual"
              amount={metricas?.volumenMensual ?? 0}
              icon={TrendingUp}
              tone="success"
            />
            <BalanceCard
              label="Cuentas inactivas"
              amount={metricas?.cuentasInactivas ?? 0}
              icon={ShieldCheck}
              tone="warning"
              format="number"
            />
          </>
        )}
      </section>

      <Card>
        <CardHeader
          title="Últimos clientes"
          subtitle="Listado obtenido en vivo desde la API."
          action={
            <Link to="/admin/clientes">
              <Button variant="ghost" size="sm" rightIcon={ArrowRight}>
                Ver todos
              </Button>
            </Link>
          }
        />
        <CardBody>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : clientes.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Sin clientes"
              description="Aún no hay cuentahabientes registrados en el sistema."
            />
          ) : (
            <ul className="divide-y divide-ink-100 dark:divide-white/5">
              {clientes.slice(0, 8).map((c) => (
                <li key={c.idCliente} className="flex items-center gap-3 py-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white text-sm font-semibold">
                    {(c.nombre || '?').slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {c.nombre} {c.apellido}
                    </p>
                    <p className="text-xs text-muted">
                      DPI {c.dpi || '—'} · NIT {c.nit || '—'}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-wider text-muted">
                    #{c.idCliente}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
