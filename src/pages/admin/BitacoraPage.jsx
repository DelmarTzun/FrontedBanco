import { useEffect, useMemo, useState } from 'react';
import {
  History,
  Search,
  RefreshCcw,
  Filter,
  Users,
  Landmark,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import TransactionRow from '../../components/banking/TransactionRow';
import { cuentasApi } from '../../api/cuentas.api';
import { bitacoraApi } from '../../api/bitacora.api';
import { pushToast } from '../../store/notificationStore';
import { fmtMoney } from '../../lib/format';
import { getTipoCuenta } from '../../lib/tipoCuenta';

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'in', label: 'Ingresos' },
  { key: 'out', label: 'Egresos' },
];

// El <select> nativo hereda colores del sistema y en dark mode el dropdown
// abierto queda con texto gris ilegible. Forzamos colores explícitos en el
// control y, sobre todo, en las <option> (fondo sólido + texto blanco).
const selectClassName =
  'h-11 w-full appearance-none rounded-xl border border-ink-200/40 ' +
  'bg-white/80 dark:bg-ink-800 text-ink-900 dark:text-ink-50 ' +
  'pl-10 pr-9 text-sm outline-none ring-focus disabled:opacity-60';

const optionClassName =
  'bg-white text-ink-900 dark:bg-ink-800 dark:text-ink-50';

export default function BitacoraPage() {
  const [clientes, setClientes] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [idCliente, setIdCliente] = useState('');
  const [idCuenta, setIdCuenta] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [movimientos, setMovimientos] = useState([]);
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [cargandoCuentas, setCargandoCuentas] = useState(false);
  const [cargandoKardex, setCargandoKardex] = useState(false);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');

  // Carga inicial del padrón completo de clientes
  useEffect(() => {
    (async () => {
      setCargandoClientes(true);
      try {
        const data = await cuentasApi.listarTodos();
        setClientes(Array.isArray(data) ? data : []);
      } catch (err) {
        pushToast({ type: 'error', title: 'Error', message: err.message });
      } finally {
        setCargandoClientes(false);
      }
    })();
  }, []);

  // Al cambiar de cliente, recargar sus cuentas
  useEffect(() => {
    setCuentas([]);
    setIdCuenta('');
    setMovimientos([]);
    if (!idCliente) return;
    (async () => {
      setCargandoCuentas(true);
      try {
        const data = await cuentasApi.listarPorCliente(idCliente);
        setCuentas(Array.isArray(data) ? data : []);
      } catch (err) {
        pushToast({ type: 'error', title: 'Error', message: err.message });
      } finally {
        setCargandoCuentas(false);
      }
    })();
  }, [idCliente]);

  const cuentaSeleccionada = useMemo(
    () => cuentas.find((c) => String(c.idCuenta) === String(idCuenta)),
    [cuentas, idCuenta]
  );

  const cargarKardex = async () => {
    if (!idCuenta) {
      pushToast({
        type: 'error',
        title: 'Selecciona una cuenta',
        message: 'Debes elegir el cliente y la cuenta antes de consultar.',
      });
      return;
    }
    setCargandoKardex(true);
    try {
      // El backend espera fechas UTC. Convertimos el datetime-local a ISO.
      const params = { idCuenta };
      if (desde) params.desde = new Date(desde).toISOString();
      if (hasta) params.hasta = new Date(hasta).toISOString();
      const data = await bitacoraApi.kardex(params);
      setMovimientos(Array.isArray(data) ? data : []);
    } catch (err) {
      pushToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setCargandoKardex(false);
    }
  };

  const filtrados = useMemo(() => {
    return movimientos.filter((m) => {
      const code = (m.codigoTipoTransaccion || '').toUpperCase();
      const isIn = code.startsWith('DEP') || code.includes('TRF_IN');
      if (filter === 'in' && !isIn) return false;
      if (filter === 'out' && isIn) return false;
      if (!q) return true;
      const haystack = `${code} ${m.descripcionTipoTransaccion || ''} ${m.monto}`.toLowerCase();
      return haystack.includes(q.toLowerCase());
    });
  }, [movimientos, q, filter]);

  const limpiarFiltros = () => {
    setQ('');
    setFilter('all');
    setDesde('');
    setHasta('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bitácora"
        description="Kardex transaccional por cuenta del banco. Acceso administrativo."
        icon={History}
      />

      <Card>
        <CardHeader title="Selección" subtitle="Elige el cuentahabiente y su cuenta." />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-muted">
                Cuentahabiente
              </label>
              <div className="relative">
                <Users className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted z-10" />
                <select
                  value={idCliente}
                  onChange={(e) => setIdCliente(e.target.value)}
                  disabled={cargandoClientes}
                  className={selectClassName}
                >
                  <option value="" className={optionClassName}>
                    {cargandoClientes
                      ? 'Cargando clientes...'
                      : '— Selecciona cliente —'}
                  </option>
                  {clientes.map((c) => (
                    <option
                      key={c.idCliente}
                      value={c.idCliente}
                      className={optionClassName}
                    >
                      #{c.idCliente} · {c.nombre} {c.apellido}
                      {c.dpi ? ` · DPI ${c.dpi}` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-muted">
                Cuenta
              </label>
              <div className="relative">
                <Landmark className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted z-10" />
                <select
                  value={idCuenta}
                  onChange={(e) => setIdCuenta(e.target.value)}
                  disabled={!idCliente || cargandoCuentas}
                  className={selectClassName}
                >
                  <option value="" className={optionClassName}>
                    {!idCliente
                      ? '— Primero elige un cliente —'
                      : cargandoCuentas
                      ? 'Cargando cuentas...'
                      : cuentas.length === 0
                      ? 'Sin cuentas para este cliente'
                      : '— Selecciona cuenta —'}
                  </option>
                  {cuentas.map((cu) => {
                    const t = getTipoCuenta(cu.idTipoCuenta);
                    return (
                      <option
                        key={cu.idCuenta}
                        value={cu.idCuenta}
                        className={optionClassName}
                      >
                        {t.nombre} · {cu.noCuenta} · {fmtMoney(cu.saldo)} (#{cu.idCuenta})
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-muted">
                Desde
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="datetime-local"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  className="h-11 w-full rounded-xl border border-ink-200/40 bg-white/60 dark:bg-white/5 pl-10 pr-3 text-sm outline-none ring-focus"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-muted">
                Hasta
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="datetime-local"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  className="h-11 w-full rounded-xl border border-ink-200/40 bg-white/60 dark:bg-white/5 pl-10 pr-3 text-sm outline-none ring-focus"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <Button variant="ghost" onClick={limpiarFiltros}>
              Limpiar
            </Button>
            <Button
              leftIcon={RefreshCcw}
              loading={cargandoKardex}
              onClick={cargarKardex}
              disabled={!idCuenta}
            >
              Cargar kardex
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <span>Kardex</span>
              <Badge tone="brand">{filtrados.length}</Badge>
            </div>
          }
          subtitle={
            cuentaSeleccionada
              ? `Cuenta ${cuentaSeleccionada.noCuenta} · saldo actual ${fmtMoney(
                  cuentaSeleccionada.saldo
                )}`
              : 'Selecciona una cuenta para visualizar movimientos.'
          }
          action={
            <div className="flex gap-1 rounded-xl glass-soft p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={
                    'px-3 h-9 rounded-lg text-xs font-medium transition-colors ' +
                    (filter === f.key
                      ? 'bg-gradient-brand text-white shadow-glow'
                      : 'text-muted hover:text-ink-900 dark:hover:text-white')
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
          }
        />
        <CardBody>
          <div className="mb-4">
            <Input
              leftIcon={Search}
              placeholder="Buscar por código, descripción o monto..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {cargandoKardex ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !idCuenta ? (
            <EmptyState
              icon={Filter}
              title="Sin cuenta seleccionada"
              description="Elige un cliente y una de sus cuentas para consultar el kardex."
            />
          ) : filtrados.length === 0 ? (
            <EmptyState
              icon={Filter}
              title="Sin movimientos"
              description="La cuenta no tiene transacciones que coincidan con los filtros."
            />
          ) : (
            <div className="-mx-2 space-y-1">
              {filtrados.map((m) => (
                <TransactionRow key={m.idTransaccion} movimiento={m} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
