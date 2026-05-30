import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  RefreshCcw,
  History,
  Wallet,
  Receipt,
  GraduationCap,
  Phone,
  Zap,
  Filter,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import TransactionRow from '../../components/banking/TransactionRow';
import { cuentasApi } from '../../api/cuentas.api';
import { bitacoraApi } from '../../api/bitacora.api';
import { pushToast } from '../../store/notificationStore';
import { fmtMoney } from '../../lib/format';

// Etiquetas amigables para las cuentas internas operacionales del banco.
// Los ids coinciden con el seed de `schema/wipe_and_admin.sql` y con la
// configuración de "Pagos" en appsettings.json.
const METADATA = {
  100: {
    nombre: 'Comisiones del banco',
    descripcion: 'Recauda el 5% de cada pago de servicio.',
    icon: Receipt,
    tone: 'from-amber-500 to-rose-500',
  },
  101: {
    nombre: 'Recaudación · Universidad UMG',
    descripcion: 'Acreditación del 95% de pagos universitarios.',
    icon: GraduationCap,
    tone: 'from-brand-500 to-indigo-500',
  },
  102: {
    nombre: 'Recaudación · Telefonía',
    descripcion: 'Acreditación del 95% de pagos de telefonía.',
    icon: Phone,
    tone: 'from-emerald-500 to-teal-500',
  },
  103: {
    nombre: 'Recaudación · Energía Eléctrica',
    descripcion: 'Acreditación del 95% de pagos de energía.',
    icon: Zap,
    tone: 'from-yellow-500 to-orange-500',
  },
};

const fallbackMeta = {
  nombre: 'Cuenta interna',
  descripcion: 'Cuenta operacional del banco.',
  icon: Wallet,
  tone: 'from-ink-400 to-ink-600',
};

function getMeta(idCuenta) {
  return METADATA[idCuenta] || fallbackMeta;
}

function estadoBadge(descripcionEstado) {
  const code = (descripcionEstado || '').toUpperCase();
  if (code === 'ACTIVO') return { label: 'Activa', tone: 'success' };
  if (code === 'INACTIVO') return { label: 'Inactiva', tone: 'danger' };
  return { label: descripcionEstado || '—', tone: 'neutral' };
}

export default function InternalAccountsPage() {
  const [cuentas, setCuentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cuentaKardex, setCuentaKardex] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [cargandoKardex, setCargandoKardex] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await cuentasApi.listarCuentasInternas();
      setCuentas(Array.isArray(data) ? data : []);
    } catch (err) {
      pushToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const totalSaldo = useMemo(
    () => cuentas.reduce((acc, c) => acc + Number(c.saldoActual || 0), 0),
    [cuentas]
  );

  const abrirKardex = async (cuenta) => {
    setCuentaKardex(cuenta);
    setMovimientos([]);
    setCargandoKardex(true);
    try {
      const data = await bitacoraApi.kardex({ idCuenta: cuenta.idCuenta });
      setMovimientos(Array.isArray(data) ? data : []);
    } catch (err) {
      pushToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setCargandoKardex(false);
    }
  };

  const cerrarKardex = () => {
    setCuentaKardex(null);
    setMovimientos([]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cuentas internas del banco"
        description="Saldos operacionales de comisiones y recaudación de prestadoras de servicios."
        icon={Building2}
        actions={
          <Button variant="ghost" leftIcon={RefreshCcw} onClick={cargar}>
            Recargar
          </Button>
        }
      />

      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted">
                Total acumulado
              </p>
              <p className="text-2xl font-bold text-ink-900 dark:text-ink-50">
                {fmtMoney(totalSaldo)}
              </p>
            </div>
            <p className="text-xs text-muted max-w-xs sm:text-right">
              Cuentas asociadas al banco.
            </p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Listado" subtitle="Una fila por cada cuenta interna activa." />
        <CardBody>
          {cargando ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : cuentas.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="Sin cuentas internas"
              description="El catálogo no tiene cuentas del tipo CUENTA_INTERNA_BANCO."
            />
          ) : (
            <div className="space-y-3">
              {cuentas.map((cu) => {
                const meta = getMeta(cu.idCuenta);
                const Icon = meta.icon;
                const badge = estadoBadge(cu.descripcionEstado);
                return (
                  <div
                    key={cu.idCuenta}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-ink-200/40 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] p-3"
                  >
                    <div
                      className={
                        'grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-glow bg-gradient-to-br ' +
                        meta.tone
                      }
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-ink-900 dark:text-ink-50">
                          {meta.nombre}
                        </p>
                        <Badge tone={badge.tone}>{badge.label}</Badge>
                      </div>
                      <p className="text-xs text-muted">
                        Cuenta {cu.noCuenta} · #{cu.idCuenta}
                      </p>
                      <p className="text-xs text-muted mt-0.5">{meta.descripcion}</p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-[11px] uppercase tracking-wider text-muted">
                        Saldo
                      </p>
                      <p className="font-mono text-lg font-semibold text-ink-900 dark:text-ink-50 tabular-nums">
                        {fmtMoney(cu.saldoActual)}
                      </p>
                    </div>

                    <div>
                      <Button
                        variant="ghost"
                        leftIcon={History}
                        onClick={() => abrirKardex(cu)}
                      >
                        Ver movimientos
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        open={!!cuentaKardex}
        onClose={cerrarKardex}
        title={
          cuentaKardex
            ? `Movimientos · ${getMeta(cuentaKardex.idCuenta).nombre}`
            : 'Movimientos'
        }
        description={
          cuentaKardex
            ? `Cuenta ${cuentaKardex.noCuenta} · saldo ${fmtMoney(cuentaKardex.saldoActual)}`
            : null
        }
        size="lg"
      >
        {cargandoKardex ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : movimientos.length === 0 ? (
          <EmptyState
            icon={Filter}
            title="Sin movimientos"
            description="La cuenta no tiene transacciones registradas todavía."
          />
        ) : (
          <div className="-mx-2 max-h-[60vh] overflow-y-auto space-y-1 pr-1">
            {movimientos.map((m) => (
              <TransactionRow key={m.idTransaccion} movimiento={m} />
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
