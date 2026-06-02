import { useMemo, useState } from 'react';
import {
  Receipt,
  ArrowUpRight,
  Search,
  Filter,
  RefreshCcw,
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
import { LIMITES_DB, validarMontoPositivo } from '../../lib/validaciones';

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
  const [openRetiro, setOpenRetiro] = useState(false);
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

  const montoModalErr = montoModal ? validarMontoPositivo(montoModal) : null;
  const saldoActual = cuentaActiva?.saldo ?? 0;
  const excedeRetiro =
    montoModal && Number(montoModal) > saldoActual
      ? `El monto supera tu saldo disponible (${fmtMoney(saldoActual)}).`
      : null;

  const cerrarRetiro = () => {
    if (enviando) return;
    setOpenRetiro(false);
    setMontoModal('');
    setRefModal('');
  };

  const onSubmitRetiro = async (e) => {
    e.preventDefault();
    const monto = Number(montoModal);
    const err = validarMontoPositivo(monto);
    if (err) {
      pushToast({ type: 'error', title: 'Monto inválido', message: err });
      return;
    }
    if (!cuentaActiva) return;
    if (excedeRetiro) {
      pushToast({
        type: 'warning',
        title: 'Saldo insuficiente',
        message: excedeRetiro,
      });
      return;
    }
    setEnviando(true);
    try {
      const res = await operacionesApi.retirar({
        idCuenta: cuentaActiva.idCuenta,
        monto,
        referencia: refModal || null,
      });
      pushToast({
        type: 'success',
        title: 'Retiro exitoso',
        message: `Saldo posterior: ${fmtMoney(res.saldoPosterior)}`,
      });
      cerrarRetiro();
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
          <Button
            size="md"
            leftIcon={Minus}
            onClick={() => setOpenRetiro(true)}
            disabled={!cuentaActiva || saldoActual <= 0}
          >
            Retirar
          </Button>
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
        open={openRetiro}
        onClose={cerrarRetiro}
        title="Retiro de tu cuenta"
        description={`Retira efectivo de la cuenta ${
          cuentaActiva?.noCuenta || '—'
        }. Saldo disponible: ${fmtMoney(saldoActual)}.`}
      >
        <form onSubmit={onSubmitRetiro} className="space-y-4">
          <Input
            label="Monto a retirar"
            type="number"
            min="0.01"
            step="0.01"
            value={montoModal}
            onChange={(e) => setMontoModal(e.target.value)}
            placeholder="0.00"
            leftIcon={ArrowUpRight}
            error={excedeRetiro || montoModalErr}
            disabled={enviando}
          />
          <Input
            label="Referencia (opcional)"
            value={refModal}
            onChange={(e) => setRefModal(e.target.value)}
            placeholder="Ej. Retiro en cajero"
            maxLength={LIMITES_DB.bitacora.referencia}
            hint={`Máximo ${LIMITES_DB.bitacora.referencia} caracteres`}
            disabled={enviando}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={cerrarRetiro}
              disabled={enviando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={enviando}
              disabled={!!montoModalErr || !!excedeRetiro || !montoModal}
            >
              Confirmar retiro
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
