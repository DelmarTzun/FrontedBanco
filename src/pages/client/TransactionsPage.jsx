import { useMemo, useState } from 'react';
import {
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  RefreshCcw,
  Plus,
  Minus,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import TransactionRow from '../../components/banking/TransactionRow';
import AccountSelector from '../../components/banking/AccountSelector';
import { useCuentas } from '../../hooks/useCuentas';
import { useKardex } from '../../hooks/useKardex';
import { operacionesApi } from '../../api/operaciones.api';
import { pushToast } from '../../store/notificationStore';
import { fmtMoney } from '../../lib/format';

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'in', label: 'Ingresos' },
  { key: 'out', label: 'Egresos' },
];

export default function TransactionsPage() {
  const { cuentas, cuentaActiva, setCuentaActiva } = useCuentas();
  const { data, loading, refresh } = useKardex({
    idCuenta: cuentaActiva?.idCuenta,
  });
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [openModal, setOpenModal] = useState(null); // 'dep' | 'ret' | null
  const [montoModal, setMontoModal] = useState('');
  const [refModal, setRefModal] = useState('');
  const [enviando, setEnviando] = useState(false);

  const filtered = useMemo(() => {
    return data.filter((m) => {
      const code = (m.codigoTipoTransaccion || '').toUpperCase();
      const isIn = code.startsWith('DEP') || code.includes('TRF_IN');
      if (filter === 'in' && !isIn) return false;
      if (filter === 'out' && isIn) return false;
      if (!q) return true;
      const haystack = `${code} ${m.descripcionTipoTransaccion || ''} ${m.monto}`.toLowerCase();
      return haystack.includes(q.toLowerCase());
    });
  }, [data, q, filter]);

  const onSubmitMov = async (e) => {
    e.preventDefault();
    const monto = Number(montoModal);
    if (!monto || monto <= 0) {
      pushToast({ type: 'error', title: 'Monto inválido', message: 'Ingresa un valor > 0.' });
      return;
    }
    if (!cuentaActiva) return;
    setEnviando(true);
    try {
      const fn =
        openModal === 'dep'
          ? operacionesApi.depositar
          : operacionesApi.retirar;
      const res = await fn({
        idCuenta: cuentaActiva.idCuenta,
        monto,
        referencia: refModal || null,
      });
      pushToast({
        type: 'success',
        title: openModal === 'dep' ? 'Depósito exitoso' : 'Retiro exitoso',
        message: `Saldo posterior: ${fmtMoney(res.saldoPosterior)}`,
      });
      setOpenModal(null);
      setMontoModal('');
      setRefModal('');
      refresh();
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'No se pudo procesar',
        message: err.message,
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transacciones"
        description="Historial cronológico de los movimientos de tu cuenta."
        icon={Receipt}
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              leftIcon={Minus}
              onClick={() => setOpenModal('ret')}
            >
              Retirar
            </Button>
            <Button
              size="md"
              leftIcon={Plus}
              onClick={() => setOpenModal('dep')}
            >
              Depositar
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <span>Kardex</span>
              <Badge tone="brand">{filtered.length}</Badge>
            </div>
          }
          subtitle="Filtra y busca movimientos"
          action={
            <div className="flex items-center gap-2">
              {cuentaActiva && (
                <AccountSelector
                  cuentas={cuentas}
                  cuentaActiva={cuentaActiva}
                  onChange={setCuentaActiva}
                />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={refresh}
                aria-label="Recargar"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          }
        />
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <Input
                leftIcon={Search}
                placeholder="Buscar por código, descripción o monto..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="flex gap-1 rounded-xl glass-soft p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={
                    'px-3 h-10 rounded-lg text-sm font-medium transition-colors ' +
                    (filter === f.key
                      ? 'bg-gradient-brand text-white shadow-glow'
                      : 'text-muted hover:text-ink-900 dark:hover:text-white')
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Filter}
              title="Sin resultados"
              description="Prueba con otros filtros o realiza tu primera operación."
            />
          ) : (
            <div className="-mx-2 space-y-1">
              {filtered.map((m) => (
                <TransactionRow key={m.idTransaccion} movimiento={m} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        open={!!openModal}
        onClose={() => setOpenModal(null)}
        title={openModal === 'dep' ? 'Depósito a tu cuenta' : 'Retiro de tu cuenta'}
        description={
          openModal === 'dep'
            ? 'Suma fondos a la cuenta activa.'
            : 'Retira efectivo de la cuenta activa.'
        }
      >
        <form onSubmit={onSubmitMov} className="space-y-4">
          <Input
            label="Monto"
            type="number"
            min="0.01"
            step="0.01"
            value={montoModal}
            onChange={(e) => setMontoModal(e.target.value)}
            placeholder="0.00"
            leftIcon={openModal === 'dep' ? ArrowDownLeft : ArrowUpRight}
          />
          <Input
            label="Referencia (opcional)"
            value={refModal}
            onChange={(e) => setRefModal(e.target.value)}
            placeholder="Ej. Pago de salario"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpenModal(null)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={enviando}
              variant={openModal === 'dep' ? 'success' : 'primary'}
            >
              Confirmar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
