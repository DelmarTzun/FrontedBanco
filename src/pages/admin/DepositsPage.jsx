import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Banknote,
  Search,
  RefreshCcw,
  Landmark,
  Coins,
  FileText,
  ArrowRight,
  CheckCircle2,
  User,
  ChevronRight,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { cuentasApi } from '../../api/cuentas.api';
import { operacionesApi } from '../../api/operaciones.api';
import { pushToast } from '../../store/notificationStore';
import { fmtMoney } from '../../lib/format';
import { getTipoCuenta } from '../../lib/tipoCuenta';
import { getEstadoCuenta } from '../../lib/estadoCuenta';
import {
  LIMITES_DB,
  validarMontoPositivo,
} from '../../lib/validaciones';
import clsx from 'clsx';

/**
 * Consola de depósitos (rol ADMIN).
 *
 * Flujo:
 *   1) Busca y selecciona un cuentahabiente.
 *   2) Carga sus cuentas y selecciona una (con badge de estado).
 *   3) Indica monto + referencia y confirma el depósito.
 *
 * El endpoint POST /api/Operaciones/deposito ahora exige rol ADMIN
 * (los clientes ya no pueden auto-depositar desde el portal).
 */
export default function DepositsPage() {
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [q, setQ] = useState('');

  const [clienteSel, setClienteSel] = useState(null);
  const [cuentas, setCuentas] = useState([]);
  const [loadingCuentas, setLoadingCuentas] = useState(false);

  const [cuentaSel, setCuentaSel] = useState(null);

  const [monto, setMonto] = useState('');
  const [referencia, setReferencia] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [confirmando, setConfirmando] = useState(false);
  const [comprobante, setComprobante] = useState(null);

  /* ---------------- Carga inicial de clientes ---------------- */
  const cargarClientes = async () => {
    setLoadingClientes(true);
    try {
      const data = await cuentasApi.listarTodos();
      setClientes(Array.isArray(data) ? data : []);
    } catch (err) {
      pushToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoadingClientes(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  /* ---------------- Filtro local ---------------- */
  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return clientes;
    return clientes.filter((c) => {
      const hay = `${c.nombre ?? ''} ${c.apellido ?? ''} ${c.dpi ?? ''} ${c.nit ?? ''} ${c.email ?? ''} ${c.idCliente}`
        .toLowerCase();
      return hay.includes(t);
    });
  }, [clientes, q]);

  /* ---------------- Carga de cuentas del cliente ---------------- */
  const seleccionarCliente = async (c) => {
    setClienteSel(c);
    setCuentaSel(null);
    setCuentas([]);
    setLoadingCuentas(true);
    try {
      const data = await cuentasApi.listarPorCliente(c.idCliente);
      setCuentas(Array.isArray(data) ? data : []);
    } catch (err) {
      pushToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoadingCuentas(false);
    }
  };

  const recargarCuentas = async () => {
    if (!clienteSel) return;
    setLoadingCuentas(true);
    try {
      const data = await cuentasApi.listarPorCliente(clienteSel.idCliente);
      setCuentas(Array.isArray(data) ? data : []);
      if (cuentaSel) {
        const actualizada = data?.find((x) => x.idCuenta === cuentaSel.idCuenta);
        if (actualizada) setCuentaSel(actualizada);
      }
    } catch (err) {
      pushToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoadingCuentas(false);
    }
  };

  /* ---------------- Validaciones del formulario ---------------- */
  const montoErr = monto ? validarMontoPositivo(monto) : null;
  const puedeDepositar =
    !!cuentaSel &&
    !montoErr &&
    !!monto &&
    cuentaSel.idEstado === 1; // solo cuentas activas

  /* ---------------- Submit (con confirmación) ---------------- */
  const ejecutarDeposito = async () => {
    if (!puedeDepositar) return;
    setEnviando(true);
    try {
      const res = await operacionesApi.depositar({
        idCuenta: cuentaSel.idCuenta,
        monto: Number(monto),
        referencia: referencia || null,
      });
      setComprobante({
        ...res,
        cliente: clienteSel,
        cuenta: cuentaSel,
        monto: Number(monto),
        referencia,
      });
      pushToast({
        type: 'success',
        title: 'Depósito acreditado',
        message: `Saldo posterior: ${fmtMoney(res.saldoPosterior)}.`,
      });
      setMonto('');
      setReferencia('');
      setConfirmando(false);
      // refrescar saldo de la cuenta seleccionada
      recargarCuentas();
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'No se pudo depositar',
        message: err.message,
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Depósitos en ventanilla"
        description="Acredita efectivo a la cuenta de un cuentahabiente. Solo administradores."
        icon={Banknote}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ---------------- COLUMNA IZQUIERDA: clientes ---------------- */}
        <Card className="lg:col-span-2">
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <span>Cuentahabientes</span>
                <Badge tone="brand">{filtrados.length}</Badge>
              </div>
            }
            subtitle="Selecciona a quién le vas a depositar"
            action={
              <Button
                variant="ghost"
                size="icon"
                onClick={cargarClientes}
                aria-label="Recargar"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            }
          />
          <CardBody>
            <Input
              leftIcon={Search}
              placeholder="Nombre, DPI, NIT o ID..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <div className="mt-3 max-h-[28rem] space-y-1 overflow-y-auto pr-1">
              {loadingClientes ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))
              ) : filtrados.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="Sin resultados"
                  description="Prueba con otro nombre, DPI o NIT."
                />
              ) : (
                filtrados.map((c) => {
                  const activo = clienteSel?.idCliente === c.idCliente;
                  return (
                    <button
                      key={c.idCliente}
                      onClick={() => seleccionarCliente(c)}
                      className={clsx(
                        'group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
                        activo
                          ? 'border-brand-500 bg-brand-500/10'
                          : 'border-transparent hover:border-brand-400 hover:bg-white/40 dark:hover:bg-white/5'
                      )}
                    >
                      <div
                        className={clsx(
                          'grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-semibold',
                          activo
                            ? 'bg-gradient-brand text-white shadow-glow'
                            : 'bg-brand-500/10 text-brand-500'
                        )}
                      >
                        {(c.nombre || 'U').slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {c.nombre} {c.apellido}
                        </p>
                        <p className="truncate text-xs text-muted">
                          DPI {c.dpi} · #{c.idCliente}
                        </p>
                      </div>
                      <ChevronRight
                        className={clsx(
                          'h-4 w-4 transition-transform',
                          activo
                            ? 'text-brand-500 translate-x-0.5'
                            : 'text-ink-400 group-hover:translate-x-0.5'
                        )}
                      />
                    </button>
                  );
                })
              )}
            </div>
          </CardBody>
        </Card>

        {/* ---------------- COLUMNA DERECHA: cuentas + formulario ---------------- */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader
              title="Cuenta destino"
              subtitle={
                clienteSel
                  ? `Cuentas de ${clienteSel.nombre} ${clienteSel.apellido}`
                  : 'Elige primero un cuentahabiente'
              }
            />
            <CardBody>
              {!clienteSel ? (
                <EmptyState
                  icon={User}
                  title="Selecciona un cuentahabiente"
                  description="A la izquierda están todos los clientes registrados."
                />
              ) : loadingCuentas ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : cuentas.length === 0 ? (
                <EmptyState
                  icon={Landmark}
                  title="Sin cuentas"
                  description="Este cuentahabiente no tiene cuentas creadas."
                />
              ) : (
                <div className="space-y-2">
                  {cuentas.map((cu) => {
                    const tipo = getTipoCuenta(cu.idTipoCuenta);
                    const estado = getEstadoCuenta(cu.idEstado);
                    const activa = cuentaSel?.idCuenta === cu.idCuenta;
                    const disponible = cu.idEstado === 1;
                    return (
                      <button
                        key={cu.idCuenta}
                        onClick={() => disponible && setCuentaSel(cu)}
                        disabled={!disponible}
                        className={clsx(
                          'flex w-full flex-wrap items-center gap-3 rounded-xl border p-3 text-left transition-all',
                          activa
                            ? 'border-brand-500 bg-brand-500/10'
                            : disponible
                            ? 'border-ink-200 dark:border-white/10 hover:border-brand-400'
                            : 'border-ink-200/60 dark:border-white/5 opacity-60 cursor-not-allowed'
                        )}
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-500">
                          <Landmark className="h-4 w-4" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">
                            {tipo.nombre} · {cu.noCuenta}
                          </p>
                          <p className="text-xs text-muted">
                            Saldo: {fmtMoney(cu.saldo)} · cuenta #{cu.idCuenta}
                          </p>
                        </div>
                        <Badge tone={estado.tone} icon={estado.icon}>
                          {estado.label}
                        </Badge>
                      </button>
                    );
                  })}
                  {cuentaSel && cuentaSel.idEstado !== 1 && (
                    <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-300">
                      Solo se puede depositar a cuentas <b>activas</b>. Si la cuenta
                      está inactiva, primero actívala desde "Activar cuenta".
                    </p>
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Datos del depósito"
              subtitle={
                cuentaSel
                  ? `Acreditarás a ${getTipoCuenta(cuentaSel.idTipoCuenta).nombre} ${cuentaSel.noCuenta}`
                  : 'Selecciona una cuenta primero'
              }
            />
            <CardBody>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (puedeDepositar) setConfirmando(true);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Monto a depositar"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="0.00"
                    leftIcon={Coins}
                    error={montoErr}
                    disabled={!cuentaSel || enviando}
                  />
                  <Input
                    label="Saldo actual"
                    value={cuentaSel ? fmtMoney(cuentaSel.saldo) : '—'}
                    leftIcon={Landmark}
                    readOnly
                    hint={
                      cuentaSel
                        ? `Saldo estimado: ${fmtMoney(
                            (cuentaSel.saldo || 0) + (Number(monto) || 0)
                          )}`
                        : undefined
                    }
                  />
                </div>
                <Input
                  label="Referencia (opcional)"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ej. Depósito en ventanilla zona 9"
                  leftIcon={FileText}
                  maxLength={LIMITES_DB.bitacora.referencia}
                  hint={`Máximo ${LIMITES_DB.bitacora.referencia} caracteres`}
                  disabled={!cuentaSel || enviando}
                />

                <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 pt-2">
                  <p className="text-xs text-muted">
                    Esta operación se registra en la bitácora y queda asociada al
                    usuario administrador autenticado.
                  </p>
                  <Button
                    type="submit"
                    size="lg"
                    variant="success"
                    rightIcon={ArrowRight}
                    disabled={!puedeDepositar}
                  >
                    Continuar
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          <AnimatePresence>
            {comprobante && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                <Card>
                  <CardBody>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-500">
                        <CheckCircle2 className="h-5 w-5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">
                          Último depósito acreditado · Tx #{comprobante.idTransaccion}
                        </p>
                        <p className="text-xs text-muted">
                          {fmtMoney(comprobante.monto)} a{' '}
                          {comprobante.cuenta.noCuenta} ({comprobante.cliente.nombre}{' '}
                          {comprobante.cliente.apellido}) · saldo posterior{' '}
                          <strong>
                            {fmtMoney(comprobante.saldoPosterior)}
                          </strong>
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ---------------- Modal de confirmación ---------------- */}
      <Modal
        open={confirmando}
        onClose={() => !enviando && setConfirmando(false)}
        title="Confirmar depósito"
        description="Revisa los datos antes de acreditar el efectivo."
        size="md"
      >
        {cuentaSel && (
          <div className="space-y-4">
            <div className="space-y-2 rounded-2xl glass-soft p-4">
              <Row label="Cuentahabiente">
                {clienteSel?.nombre} {clienteSel?.apellido}{' '}
                <span className="text-muted">(#{clienteSel?.idCliente})</span>
              </Row>
              <Row label="Cuenta">
                {getTipoCuenta(cuentaSel.idTipoCuenta).nombre} · {cuentaSel.noCuenta}{' '}
                <span className="font-mono text-muted">
                  (#{cuentaSel.idCuenta})
                </span>
              </Row>
              <Row label="Saldo actual">{fmtMoney(cuentaSel.saldo)}</Row>
              <Row label="Monto a depositar" highlight>
                {fmtMoney(Number(monto))}
              </Row>
              <Row label="Saldo proyectado">
                {fmtMoney((cuentaSel.saldo || 0) + Number(monto))}
              </Row>
              {referencia && <Row label="Referencia">{referencia}</Row>}
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="ghost"
                onClick={() => setConfirmando(false)}
                disabled={enviando}
              >
                Cancelar
              </Button>
              <Button
                variant="success"
                leftIcon={Banknote}
                loading={enviando}
                onClick={ejecutarDeposito}
              >
                Acreditar depósito
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, highlight, children }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <p
        className={clsx(
          'text-sm font-medium',
          highlight
            ? 'font-mono text-brand-500 text-base font-semibold'
            : 'text-ink-900 dark:text-ink-50'
        )}
      >
        {children}
      </p>
    </div>
  );
}
