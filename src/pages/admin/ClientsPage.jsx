import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Search,
  RefreshCcw,
  CreditCard,
  IdCard,
  Landmark,
  KeyRound,
  ShieldAlert,
  Copy,
  Check,
  Ban,
  PlayCircle,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import VirtualCard from '../../components/banking/VirtualCard';
import { cuentasApi } from '../../api/cuentas.api';
import { operacionesApi } from '../../api/operaciones.api';
import { pushToast } from '../../store/notificationStore';
import { fmtMoney } from '../../lib/format';
import { getTipoCuenta } from '../../lib/tipoCuenta';
import { getEstadoCuenta } from '../../lib/estadoCuenta';

export default function ClientsPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState(null); // idCliente
  const [cuentasMap, setCuentasMap] = useState({}); // idCliente -> cuentas[]
  const [emitiendo, setEmitiendo] = useState(null); // idCuenta
  const [showCard, setShowCard] = useState(null); // TarjetaDebitoDto

  // Reset de contraseña
  const [confirmReset, setConfirmReset] = useState(null); // cliente
  const [reseteando, setReseteando] = useState(null); // idCliente
  const [showPassword, setShowPassword] = useState(null); // PasswordReseteadaDto
  const [copiado, setCopiado] = useState(false);

  // Suspender / reactivar cuenta
  const [confirmEstado, setConfirmEstado] = useState(null); // { cuenta, accion: 'suspender' | 'reactivar', cliente }
  const [cambiandoEstado, setCambiandoEstado] = useState(null); // idCuenta

  const load = async () => {
    setLoading(true);
    try {
      const data = await cuentasApi.listarTodos();
      setClientes(Array.isArray(data) ? data : []);
    } catch (err) {
      pushToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!q) return clientes;
    const s = q.toLowerCase();
    return clientes.filter(
      (c) =>
        (c.nombre + ' ' + c.apellido).toLowerCase().includes(s) ||
        String(c.dpi || '').includes(s) ||
        String(c.nit || '').includes(s)
    );
  }, [clientes, q]);

  const toggleCuentas = async (c) => {
    const id = c.idCliente;
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    if (!cuentasMap[id]) {
      try {
        const cuentas = await cuentasApi.listarPorCliente(id);
        setCuentasMap((m) => ({ ...m, [id]: cuentas }));
      } catch (err) {
        pushToast({ type: 'error', title: 'Error', message: err.message });
      }
    }
  };

  const resetearPassword = async (cliente) => {
    setReseteando(cliente.idCliente);
    try {
      const data = await cuentasApi.resetearPassword(cliente.idCliente);
      setShowPassword(data);
      setConfirmReset(null);
      pushToast({
        type: 'success',
        title: 'Contraseña reseteada',
        message: 'Comparte la nueva contraseña con el cuentahabiente.',
      });
    } catch (err) {
      pushToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setReseteando(null);
    }
  };

  const copiarPassword = async () => {
    if (!showPassword) return;
    try {
      await navigator.clipboard.writeText(showPassword.passwordTemporal);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      pushToast({
        type: 'error',
        title: 'No se pudo copiar',
        message: 'Selecciona y copia manualmente.',
      });
    }
  };

  const emitirTarjeta = async (cuenta) => {
    setEmitiendo(cuenta.idCuenta);
    try {
      const tarjeta = await cuentasApi.asociarTarjeta(cuenta.idCuenta);
      // Adjuntamos contexto de la cuenta para mostrarlo en el modal
      setShowCard({ ...tarjeta, cuenta });
      pushToast({
        type: 'success',
        title: 'Tarjeta emitida',
        message: 'Comparte los datos con el cuentahabiente.',
      });
    } catch (err) {
      pushToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setEmitiendo(null);
    }
  };

  const ejecutarCambioEstado = async () => {
    if (!confirmEstado) return;
    const { cuenta, accion, cliente } = confirmEstado;
    setCambiandoEstado(cuenta.idCuenta);
    try {
      const resultado =
        accion === 'suspender'
          ? await operacionesApi.suspenderCuenta(cuenta.idCuenta)
          : await operacionesApi.reactivarCuenta(cuenta.idCuenta);

      // Refrescar la lista de cuentas del cliente para reflejar el nuevo estado
      const cuentasActualizadas = await cuentasApi.listarPorCliente(cliente.idCliente);
      setCuentasMap((m) => ({ ...m, [cliente.idCliente]: cuentasActualizadas }));

      const tarjetasMsg =
        accion === 'suspender' && resultado.tarjetasAfectadas > 0
          ? ` Tarjetas bloqueadas: ${resultado.tarjetasAfectadas}.`
          : '';
      pushToast({
        type: 'success',
        title: accion === 'suspender' ? 'Cuenta suspendida' : 'Cuenta reactivada',
        message:
          accion === 'suspender'
            ? `La cuenta ${resultado.noCuenta} queda inactiva.${tarjetasMsg}`
            : `La cuenta ${resultado.noCuenta} vuelve a estar activa.`,
      });
      setConfirmEstado(null);
    } catch (err) {
      pushToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setCambiandoEstado(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cuentahabientes"
        description="Padrón completo del banco."
        icon={Users}
        actions={
          <Button variant="ghost" leftIcon={RefreshCcw} onClick={load}>
            Recargar
          </Button>
        }
      />

      <Card>
        <CardHeader
          title="Listado"
          action={
            <Input
              leftIcon={Search}
              placeholder="Buscar por nombre, DPI o NIT..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="min-w-64"
            />
          }
        />
        <CardBody>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Sin resultados"
              description="No se encontraron cuentahabientes para tu búsqueda."
            />
          ) : (
            <ul className="divide-y divide-ink-100 dark:divide-white/5">
              {filtered.map((c) => {
                const open = expanded === c.idCliente;
                const cuentasDe = cuentasMap[c.idCliente];
                return (
                  <li key={c.idCliente} className="py-3">
                    <button
                      onClick={() => toggleCuentas(c)}
                      className="flex w-full items-center gap-3 text-left"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white text-sm font-semibold">
                        {(c.nombre || '?').slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {c.nombre} {c.apellido}
                        </p>
                        <p className="text-xs text-muted">
                          DPI {c.dpi || '—'} · NIT {c.nit || '—'}
                          {c.celular ? ` · Tel ${c.celular}` : ''}
                        </p>
                      </div>
                      <span className="text-xs uppercase tracking-wider text-muted">
                        #{c.idCliente}
                      </span>
                    </button>

                    {open && (
                      <div className="mt-3 ml-12 space-y-2">
                        {cuentasDe ? (
                          cuentasDe.length === 0 ? (
                            <p className="text-xs text-muted">
                              Este cliente no tiene cuentas.
                            </p>
                          ) : (
                            cuentasDe.map((cu) => {
                              const t = getTipoCuenta(cu.idTipoCuenta);
                              const estado = getEstadoCuenta(cu.idEstado);
                              return (
                                <div
                                  key={cu.idCuenta}
                                  className="flex flex-wrap items-center gap-3 rounded-xl glass-soft p-3"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold">
                                      {t.nombre} · {cu.noCuenta}
                                    </p>
                                    <p className="font-mono text-xs text-muted">
                                      {fmtMoney(cu.saldo)} · cuenta #{cu.idCuenta}
                                    </p>
                                  </div>
                                  <Badge tone={estado.tone} icon={estado.icon}>
                                    {estado.label}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    leftIcon={CreditCard}
                                    loading={emitiendo === cu.idCuenta}
                                    disabled={cu.idEstado !== 1}
                                    onClick={() => emitirTarjeta(cu)}
                                    title={
                                      cu.idEstado !== 1
                                        ? 'Sólo cuentas activas pueden emitir tarjeta'
                                        : undefined
                                    }
                                  >
                                    {cu.numeroTarjeta ? 'Reemitir tarjeta' : 'Emitir tarjeta'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    leftIcon={KeyRound}
                                    loading={reseteando === c.idCliente}
                                    onClick={() => setConfirmReset(c)}
                                    title="Resetear contraseña del cuentahabiente"
                                  >
                                    Resetear clave
                                  </Button>
                                  {cu.idEstado === 1 && (
                                    <Button
                                      size="sm"
                                      variant="danger"
                                      leftIcon={Ban}
                                      loading={cambiandoEstado === cu.idCuenta}
                                      onClick={() =>
                                        setConfirmEstado({
                                          cuenta: cu,
                                          accion: 'suspender',
                                          cliente: c,
                                        })
                                      }
                                      title="Suspender cuenta (bloquea operaciones de débito y tarjetas)"
                                    >
                                      Suspender
                                    </Button>
                                  )}
                                  {cu.idEstado === 2 && (
                                    <Button
                                      size="sm"
                                      variant="success"
                                      leftIcon={PlayCircle}
                                      loading={cambiandoEstado === cu.idCuenta}
                                      onClick={() =>
                                        setConfirmEstado({
                                          cuenta: cu,
                                          accion: 'reactivar',
                                          cliente: c,
                                        })
                                      }
                                      title="Reactivar cuenta (vuelve a estar operativa)"
                                    >
                                      Reactivar
                                    </Button>
                                  )}
                                </div>
                              );
                            })
                          )
                        ) : (
                          <Skeleton className="h-14 w-full" />
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>

      <Modal
        open={!!showCard}
        onClose={() => setShowCard(null)}
        title="Tarjeta emitida"
        description="Estos datos solo se mostrarán una vez."
        size="lg"
      >
        {showCard && (
          <div className="space-y-4">
            {showCard.cuenta && (
              <div className="flex flex-wrap items-center gap-3 rounded-2xl glass-soft p-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/15 text-brand-500">
                  <Landmark className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wider text-muted">
                    Asociada a la cuenta
                  </p>
                  <p className="text-sm font-semibold">
                    {getTipoCuenta(showCard.cuenta.idTipoCuenta).nombre} ·{' '}
                    {showCard.cuenta.noCuenta}{' '}
                    <span className="font-mono text-muted">
                      (#{showCard.cuenta.idCuenta})
                    </span>
                  </p>
                </div>
                {(() => {
                  const estado = getEstadoCuenta(showCard.cuenta.idEstado);
                  return (
                    <Badge tone={estado.tone} icon={estado.icon}>
                      {estado.label}
                    </Badge>
                  );
                })()}
              </div>
            )}

            <VirtualCard
              numero={showCard.numeroTarjeta}
              titular="CUENTAHABIENTE"
              vencMes={showCard.mesVencimiento}
              vencAnio={showCard.anioVencimiento}
              saldo={0}
              variant="alt"
              hideAmount
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <Box label="Número" value={showCard.numeroTarjeta} />
              <Box
                label="Vence"
                value={`${String(showCard.mesVencimiento).padStart(2, '0')}/${showCard.anioVencimiento}`}
              />
              <Box label="PIN" value={showCard.pin} />
            </div>
            <p className="flex items-start gap-2 text-xs text-muted">
              <IdCard className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              Comparte estos datos por un canal seguro. El cuentahabiente debe
              memorizar su PIN.
            </p>
          </div>
        )}
      </Modal>

      <Modal
        open={!!confirmReset}
        onClose={() => setConfirmReset(null)}
        title="Resetear contraseña"
        description="Se generará una nueva contraseña temporal y se invalidará la anterior."
        size="md"
      >
        {confirmReset && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p>
                El cuentahabiente <b>{confirmReset.nombre} {confirmReset.apellido}</b>{' '}
                (#{confirmReset.idCliente}) ya no podrá iniciar sesión con su
                contraseña actual. La nueva password sólo se mostrará una vez.
              </p>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="ghost"
                onClick={() => setConfirmReset(null)}
                disabled={reseteando === confirmReset.idCliente}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                leftIcon={KeyRound}
                loading={reseteando === confirmReset.idCliente}
                onClick={() => resetearPassword(confirmReset)}
              >
                Sí, generar nueva contraseña
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!showPassword}
        onClose={() => {
          setShowPassword(null);
          setCopiado(false);
        }}
        title="Nueva contraseña temporal"
        description="Estos datos sólo se mostrarán una vez."
        size="md"
      >
        {showPassword && (
          <div className="space-y-4">
            <div className="space-y-2 rounded-2xl glass-soft p-4">
              <p className="text-xs uppercase tracking-wider text-muted">
                Cuentahabiente
              </p>
              <p className="text-sm font-semibold">
                {showPassword.nombreCompleto}{' '}
                <span className="font-mono text-muted">
                  (#{showPassword.idCliente})
                </span>
              </p>
              <p className="text-xs text-muted">
                Correo: {showPassword.correoElectronico || '—'}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted">
                Contraseña temporal
              </p>
              <div className="flex items-center gap-2 rounded-xl border border-ink-200/40 bg-black/40 px-3 py-3 font-mono text-base">
                <span className="flex-1 break-all">
                  {showPassword.passwordTemporal}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={copiado ? Check : Copy}
                  onClick={copiarPassword}
                >
                  {copiado ? 'Copiado' : 'Copiar'}
                </Button>
              </div>
            </div>

            <p className="flex items-start gap-2 text-xs text-muted">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              Entrégala al cuentahabiente por un canal seguro. Al primer login
              exitoso el banco la rehasheará con BCrypt automáticamente.
            </p>
          </div>
        )}
      </Modal>

      <Modal
        open={!!confirmEstado}
        onClose={() => setConfirmEstado(null)}
        title={
          confirmEstado?.accion === 'suspender'
            ? 'Suspender cuenta'
            : 'Reactivar cuenta'
        }
        description={
          confirmEstado?.accion === 'suspender'
            ? 'La cuenta dejará de poder operar (depositar, retirar, transferir o pagar servicios). Sus tarjetas activas quedarán bloqueadas.'
            : 'La cuenta volverá a estar operativa. Recuerda emitir una nueva tarjeta si la necesita.'
        }
        size="md"
      >
        {confirmEstado && (
          <div className="space-y-4">
            <div className="space-y-1 rounded-2xl glass-soft p-4">
              <p className="text-xs uppercase tracking-wider text-muted">
                Cuenta
              </p>
              <p className="text-sm font-semibold">
                {getTipoCuenta(confirmEstado.cuenta.idTipoCuenta).nombre} ·{' '}
                {confirmEstado.cuenta.noCuenta}{' '}
                <span className="font-mono text-muted">
                  (#{confirmEstado.cuenta.idCuenta})
                </span>
              </p>
              <p className="text-xs text-muted">
                Cuentahabiente: {confirmEstado.cliente.nombre}{' '}
                {confirmEstado.cliente.apellido} · saldo actual{' '}
                {fmtMoney(confirmEstado.cuenta.saldo)}
              </p>
            </div>

            <div
              className={
                'flex items-start gap-3 rounded-2xl border p-3 text-xs ' +
                (confirmEstado.accion === 'suspender'
                  ? 'border-rose-500/30 bg-rose-500/10'
                  : 'border-emerald-500/30 bg-emerald-500/10')
              }
            >
              <ShieldAlert
                className={
                  'mt-0.5 h-4 w-4 shrink-0 ' +
                  (confirmEstado.accion === 'suspender'
                    ? 'text-rose-500'
                    : 'text-emerald-500')
                }
              />
              <p>
                {confirmEstado.accion === 'suspender' ? (
                  <>
                    Tras suspender:
                    <br />· La cuenta NO podrá depositar, retirar, transferir
                    ni pagar servicios.
                    <br />· Las tarjetas activas se bloquean (INACTIVAS).
                    <br />· La cuenta SÍ podrá seguir <b>recibiendo</b>{' '}
                    transferencias y mostrando saldo.
                  </>
                ) : (
                  <>
                    Tras reactivar: la cuenta vuelve a operar normalmente. Si
                    quieres devolverle al cliente una tarjeta funcional, usa
                    "Emitir tarjeta" después de reactivar.
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="ghost"
                onClick={() => setConfirmEstado(null)}
                disabled={cambiandoEstado === confirmEstado.cuenta.idCuenta}
              >
                Cancelar
              </Button>
              <Button
                variant={
                  confirmEstado.accion === 'suspender' ? 'danger' : 'success'
                }
                leftIcon={
                  confirmEstado.accion === 'suspender' ? Ban : PlayCircle
                }
                loading={cambiandoEstado === confirmEstado.cuenta.idCuenta}
                onClick={ejecutarCambioEstado}
              >
                {confirmEstado.accion === 'suspender'
                  ? 'Sí, suspender'
                  : 'Sí, reactivar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Box({ label, value }) {
  return (
    <div className="rounded-xl glass-soft p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className="font-mono text-sm font-semibold break-all">{value}</p>
    </div>
  );
}
