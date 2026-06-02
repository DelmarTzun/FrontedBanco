import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Shuffle,
  Receipt,
  PiggyBank,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import BalanceCard from '../../components/banking/BalanceCard';
import VirtualCard from '../../components/banking/VirtualCard';
import QuickAction from '../../components/banking/QuickAction';
import TransactionRow from '../../components/banking/TransactionRow';
import AccountSelector from '../../components/banking/AccountSelector';
import BalanceTrendChart from '../../components/charts/BalanceTrendChart';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { useCuentas } from '../../hooks/useCuentas';
import { useKardex } from '../../hooks/useKardex';
import { useAuthStore } from '../../store/authStore';

export default function DashboardPage() {
  const nombre = useAuthStore((s) => s.nombre);
  const { cuentas, cuentaActiva, loading, setCuentaActiva } = useCuentas();
  const { data: movimientos, loading: loadingMov } = useKardex({
    idCuenta: cuentaActiva?.idCuenta,
  });

  const saldoTotal = useMemo(
    () => cuentas.reduce((acc, c) => acc + Number(c.saldo || 0), 0),
    [cuentas]
  );

  const { ingresos, egresos } = useMemo(() => {
    let i = 0,
      o = 0;
    for (const m of movimientos) {
      const code = (m.codigoTipoTransaccion || '').toUpperCase();
      if (code.startsWith('DEP') || code.includes('TRF_IN'))
        i += Math.abs(m.monto);
      else o += Math.abs(m.monto);
    }
    return { ingresos: i, egresos: o };
  }, [movimientos]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hola ${nombre || 'cuentahabiente'} 👋`}
        description="Este es el resumen en tiempo real de tus cuentas, movimientos y tarjetas."
        actions={
          cuentaActiva && (
            <AccountSelector
              cuentas={cuentas}
              cuentaActiva={cuentaActiva}
              onChange={setCuentaActiva}
            />
          )
        }
      />

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <BalanceCard
          label="Saldo total"
          amount={saldoTotal}
          icon={Wallet}
          tone="brand"
        />
        <BalanceCard
          label="Cuenta activa"
          amount={cuentaActiva?.saldo || 0}
          icon={TrendingUp}
          tone="accent"
        />
        <BalanceCard
          label="Ingresos del periodo"
          amount={ingresos}
          icon={ArrowDownLeft}
          tone="success"
        />
        <BalanceCard
          label="Egresos del periodo"
          amount={egresos}
          icon={ArrowUpRight}
          tone="warning"
        />
      </section>

      {/* Card + acciones rápidas */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <Skeleton className="aspect-[1.6/1] w-full rounded-3xl" />
          ) : cuentaActiva?.numeroTarjeta ? (
            <VirtualCard
              numero={cuentaActiva.numeroTarjeta}
              titular={nombre || 'CUENTAHABIENTE'}
              vencMes={cuentaActiva.mesVencimiento || 12}
              vencAnio={cuentaActiva.anioVencimiento || 2028}
              saldo={cuentaActiva.saldo}
            />
          ) : (
            <VirtualCard
              numero={`0000${cuentaActiva?.noCuenta || ''}`.slice(-16).padStart(16, '0')}
              titular={nombre || 'CUENTAHABIENTE'}
              vencMes={12}
              vencAnio={new Date().getFullYear() + 3}
              saldo={cuentaActiva?.saldo || 0}
              variant="alt"
              hideAmount
            />
          )}

          <Card className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted">
              Acciones rápidas
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <QuickAction
                icon={Shuffle}
                label="Transferir"
                description="Entre cuentas del banco"
                onClick={() => (window.location.href = '/app/transferir')}
                gradient="from-brand-500 to-accent-500"
              />
              <QuickAction
                icon={Receipt}
                label="Pagar servicio"
                description="Universidad · Energía · Telefonía"
                onClick={() => (window.location.href = '/app/pagos')}
                gradient="from-amber-500 to-rose-500"
              />
              <QuickAction
                icon={ArrowUpRight}
                label="Retirar"
                description="Saca efectivo de tu cuenta"
                onClick={() => (window.location.href = '/app/transacciones')}
                gradient="from-rose-500 to-orange-500"
              />
              <QuickAction
                icon={PiggyBank}
                label="Mis tarjetas"
                description="Datos y CVV virtual"
                onClick={() => (window.location.href = '/app/tarjetas')}
                gradient="from-fuchsia-500 to-violet-500"
              />
            </div>
          </Card>
        </div>

        {/* Tendencia */}
        <Card className="lg:col-span-3 p-0">
          <CardHeader
            title="Tendencia del saldo"
            subtitle="Reconstruido a partir de tus movimientos recientes"
            action={
              <span className="text-[11px] uppercase tracking-wider text-muted">
                {cuentaActiva?.noCuenta || '—'}
              </span>
            }
          />
          <CardBody>
            {loadingMov ? (
              <Skeleton className="h-56 w-full" />
            ) : movimientos.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="Aún no hay movimientos"
                description="Cuando realices depósitos, retiros o transferencias verás aquí la evolución de tu saldo."
              />
            ) : (
              <BalanceTrendChart
                movimientos={movimientos}
                saldoActual={cuentaActiva?.saldo || 0}
              />
            )}
          </CardBody>
        </Card>
      </section>

      {/* Últimos movimientos */}
      <Card>
        <CardHeader
          title="Movimientos recientes"
          subtitle="Tus últimas operaciones"
          action={
            <Link to="/app/transacciones">
              <Button variant="ghost" size="sm" rightIcon={ChevronRight}>
                Ver todos
              </Button>
            </Link>
          }
        />
        <CardBody>
          {loadingMov ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : movimientos.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Sin movimientos por ahora"
              description="Tus depósitos, retiros, transferencias y pagos aparecerán aquí."
            />
          ) : (
            <div className="space-y-1">
              {movimientos.slice(0, 6).map((m) => (
                <TransactionRow key={m.idTransaccion} movimiento={m} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
