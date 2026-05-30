import { useMemo } from 'react';
import { BarChart3, ArrowDownLeft, ArrowUpRight, Activity } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import BalanceCard from '../../components/banking/BalanceCard';
import BalanceTrendChart from '../../components/charts/BalanceTrendChart';
import CategoryDonut from '../../components/charts/CategoryDonut';
import AccountSelector from '../../components/banking/AccountSelector';
import { useCuentas } from '../../hooks/useCuentas';
import { useKardex } from '../../hooks/useKardex';

export default function StatsPage() {
  const { cuentas, cuentaActiva, setCuentaActiva } = useCuentas();
  const { data: movimientos } = useKardex({
    idCuenta: cuentaActiva?.idCuenta,
  });

  const { ingresos, egresos, num } = useMemo(() => {
    let i = 0,
      o = 0,
      n = 0;
    for (const m of movimientos) {
      n++;
      const code = (m.codigoTipoTransaccion || '').toUpperCase();
      if (code.startsWith('DEP') || code.includes('TRF_IN'))
        i += Math.abs(m.monto);
      else o += Math.abs(m.monto);
    }
    return { ingresos: i, egresos: o, num: n };
  }, [movimientos]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estadísticas financieras"
        description="Comprende cómo entra y sale tu dinero."
        icon={BarChart3}
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

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BalanceCard label="Ingresos" amount={ingresos} icon={ArrowDownLeft} tone="success" />
        <BalanceCard label="Egresos" amount={egresos} icon={ArrowUpRight} tone="warning" />
        <BalanceCard label="Movimientos" amount={num} icon={Activity} tone="brand" format="number" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader title="Evolución del saldo" subtitle="Últimos movimientos" />
          <CardBody>
            <BalanceTrendChart
              movimientos={movimientos}
              saldoActual={cuentaActiva?.saldo || 0}
              height={280}
            />
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Distribución de egresos" subtitle="Por tipo de movimiento" />
          <CardBody>
            <CategoryDonut movimientos={movimientos} height={280} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
