import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCog,
  Search,
  RefreshCcw,
  User,
  IdCard,
  Hash,
  Mail,
  Phone,
  Save,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Lock,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { cuentasApi } from '../../api/cuentas.api';
import { pushToast } from '../../store/notificationStore';
import {
  LIMITES_DB,
  REGLAS,
  soloDigitosMax,
  validarTelefonoGT,
  validarEmail,
} from '../../lib/validaciones';
import clsx from 'clsx';

/**
 * Actualizar perfil de un cuentahabiente (rol ADMIN).
 *
 * Flujo:
 *   1) Buscar y seleccionar un cliente del padrón.
 *   2) El formulario se precarga con los datos actuales.
 *   3) Solo se pueden modificar: nombre, apellido, NIT, celular y correo.
 *      El DPI permanece visible pero bloqueado (es el identificador estable).
 *   4) El botón "Guardar cambios" se habilita únicamente cuando hay
 *      modificaciones reales y todas las validaciones pasan.
 *
 * Endpoint backend: PUT /api/Cuentahabientes/{idCliente}
 */
export default function UpdateClientPage() {
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [q, setQ] = useState('');

  const [seleccionado, setSeleccionado] = useState(null);

  // Snapshot de los datos originales para poder calcular "está sucio" y resetear.
  const [original, setOriginal] = useState(null);
  const [form, setForm] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [ultimoGuardado, setUltimoGuardado] = useState(null);

  /* ---------------- Carga inicial del padrón ---------------- */
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
    return clientes.filter((c) =>
      `${c.nombre ?? ''} ${c.apellido ?? ''} ${c.dpi ?? ''} ${c.nit ?? ''} ${c.email ?? ''} ${c.idCliente}`
        .toLowerCase()
        .includes(t)
    );
  }, [clientes, q]);

  /* ---------------- Seleccionar cliente ---------------- */
  const seleccionar = (c) => {
    const snapshot = {
      nombre: c.nombre ?? '',
      apellido: c.apellido ?? '',
      nit: c.nit ?? '',
      celular: c.celular ?? c.telefono ?? '',
      email: c.email ?? '',
    };
    setSeleccionado(c);
    setOriginal(snapshot);
    setForm(snapshot);
    setUltimoGuardado(null);
  };

  /* ---------------- Validaciones ---------------- */
  const errores = useMemo(() => {
    if (!form) return {};
    return {
      nombre: !form.nombre.trim() ? 'Ingresa el nombre.' : null,
      apellido: !form.apellido.trim() ? 'Ingresa el apellido.' : null,
      nit:
        !form.nit.trim()
          ? 'Ingresa el NIT (o "CF" si es consumidor final).'
          : !REGLAS.nit.regex.test(form.nit.trim()) &&
            form.nit.trim().toUpperCase() !== 'CF'
          ? 'NIT no válido. Usa solo números (con opción a dígito verificador o K).'
          : null,
      email: !form.email.trim()
        ? 'El correo electrónico es obligatorio.'
        : validarEmail(form.email),
      celular: !form.celular.trim()
        ? 'El teléfono celular es obligatorio.'
        : validarTelefonoGT(form.celular),
    };
  }, [form]);

  const hayErrores = Object.values(errores).some(Boolean);

  const estaSucio = useMemo(() => {
    if (!form || !original) return false;
    return (
      form.nombre.trim() !== (original.nombre ?? '').trim() ||
      form.apellido.trim() !== (original.apellido ?? '').trim() ||
      form.nit.trim() !== (original.nit ?? '').trim() ||
      (form.celular ?? '').trim() !== (original.celular ?? '').trim() ||
      (form.email ?? '').trim() !== (original.email ?? '').trim()
    );
  }, [form, original]);

  const puedeGuardar = !!seleccionado && estaSucio && !hayErrores && !guardando;

  /* ---------------- Guardar cambios ---------------- */
  const onSubmit = async (e) => {
    e?.preventDefault?.();
    if (!puedeGuardar) {
      if (!estaSucio) {
        pushToast({
          type: 'info',
          title: 'Sin cambios',
          message: 'No has modificado ningún dato del cliente.',
        });
      } else if (hayErrores) {
        pushToast({
          type: 'warning',
          title: 'Revisa el formulario',
          message:
            Object.values(errores).find(Boolean) ||
            'Hay datos inválidos en el formulario.',
        });
      }
      return;
    }
    setGuardando(true);
    try {
      const actualizado = await cuentasApi.actualizarPerfil(
        seleccionado.idCliente,
        {
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          nit: form.nit.trim(),
          celular: form.celular.trim() || null,
          email: form.email.trim() || null,
        }
      );
      // Reemplazar la fila en el listado local sin recargar todo.
      setClientes((prev) =>
        prev.map((c) =>
          c.idCliente === actualizado.idCliente ? actualizado : c
        )
      );
      setSeleccionado(actualizado);
      const snapshot = {
        nombre: actualizado.nombre ?? '',
        apellido: actualizado.apellido ?? '',
        nit: actualizado.nit ?? '',
        celular: actualizado.celular ?? actualizado.telefono ?? '',
        email: actualizado.email ?? '',
      };
      setOriginal(snapshot);
      setForm(snapshot);
      setUltimoGuardado(actualizado);
      pushToast({
        type: 'success',
        title: 'Datos actualizados',
        message: `${actualizado.nombre} ${actualizado.apellido} actualizado correctamente.`,
      });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'No se pudo actualizar',
        message: err.message,
      });
    } finally {
      setGuardando(false);
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="space-y-6">
      <PageHeader
        title="Actualizar cuentahabiente"
        description="Modifica nombre, NIT, correo y celular de los clientes registrados."
        icon={UserCog}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ---------------- COLUMNA IZQUIERDA: padrón ---------------- */}
        <Card className="lg:col-span-2">
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <span>Cuentahabientes</span>
                <Badge tone="brand">{filtrados.length}</Badge>
              </div>
            }
            subtitle="Selecciona a quién vas a editar"
            action={
              <Button
                variant="ghost"
                size="icon"
                onClick={cargarClientes}
                aria-label="Recargar padrón"
              >
                <RefreshCcw
                  className={clsx('h-4 w-4', loadingClientes && 'animate-spin')}
                />
              </Button>
            }
          />
          <CardBody>
            <Input
              leftIcon={Search}
              placeholder="Nombre, DPI, NIT, correo o ID..."
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
                  const activo = seleccionado?.idCliente === c.idCliente;
                  return (
                    <button
                      key={c.idCliente}
                      onClick={() => seleccionar(c)}
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

        {/* ---------------- COLUMNA DERECHA: formulario ---------------- */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader
              title={
                seleccionado
                  ? `Editando: ${seleccionado.nombre} ${seleccionado.apellido}`
                  : 'Selecciona un cuentahabiente'
              }
              subtitle={
                seleccionado
                  ? `ID #${seleccionado.idCliente} · DPI ${seleccionado.dpi}`
                  : 'A la izquierda están todos los clientes registrados'
              }
              action={
                estaSucio && seleccionado ? (
                  <Badge tone="warning" icon={AlertTriangle}>
                    Cambios sin guardar
                  </Badge>
                ) : null
              }
            />
            <CardBody>
              {!seleccionado ? (
                <EmptyState
                  icon={UserCog}
                  title="Sin cuentahabiente seleccionado"
                  description="Busca y selecciona a un cliente del padrón para editar sus datos."
                />
              ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nombre"
                      value={form.nombre}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, nombre: e.target.value }))
                      }
                      required
                      leftIcon={User}
                      maxLength={LIMITES_DB.cliente.nombre}
                      error={form.nombre ? errores.nombre : null}
                      disabled={guardando}
                    />
                    <Input
                      label="Apellido"
                      value={form.apellido}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, apellido: e.target.value }))
                      }
                      required
                      leftIcon={User}
                      maxLength={LIMITES_DB.cliente.apellido}
                      error={form.apellido ? errores.apellido : null}
                      disabled={guardando}
                    />
                    <Input
                      label="DPI / CUI"
                      value={seleccionado.dpi}
                      readOnly
                      leftIcon={Lock}
                      hint="No se puede modificar el DPI"
                    />
                    <Input
                      label="NIT"
                      value={form.nit}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, nit: e.target.value }))
                      }
                      required
                      leftIcon={Hash}
                      maxLength={LIMITES_DB.cliente.nit}
                      hint='Solo números (o "CF" si no aplica)'
                      error={form.nit ? errores.nit : null}
                      disabled={guardando}
                    />
                    <Input
                      label="Correo electrónico"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      required
                      leftIcon={Mail}
                      maxLength={LIMITES_DB.cliente.email}
                      autoComplete="email"
                      hint="También se sincroniza con sus credenciales"
                      error={form.email ? errores.email : null}
                      disabled={guardando}
                    />
                    <Input
                      label="Celular"
                      value={form.celular}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          celular: soloDigitosMax(e.target.value, 8),
                        }))
                      }
                      required
                      leftIcon={Phone}
                      maxLength={8}
                      inputMode="numeric"
                      hint="Obligatorio · 8 dígitos"
                      error={form.celular ? errores.celular : null}
                      disabled={guardando}
                    />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 pt-2">
                    <p className="text-xs text-muted">
                      Los cambios se aplican inmediatamente y quedan registrados
                      en la bitácora del banco.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setForm(original)}
                        disabled={!estaSucio || guardando}
                      >
                        Descartar
                      </Button>
                      <Button
                        type="submit"
                        variant="success"
                        leftIcon={Save}
                        loading={guardando}
                        disabled={!puedeGuardar}
                      >
                        Guardar cambios
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </CardBody>
          </Card>

          <AnimatePresence>
            {ultimoGuardado && (
              <motion.div
                key={ultimoGuardado.idCliente}
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
                          Última actualización: {ultimoGuardado.nombre}{' '}
                          {ultimoGuardado.apellido}{' '}
                          <span className="text-muted font-normal">
                            (#{ultimoGuardado.idCliente})
                          </span>
                        </p>
                        <p className="text-xs text-muted truncate">
                          NIT {ultimoGuardado.nit} · {ultimoGuardado.email} ·
                          tel {ultimoGuardado.celular || '—'}
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
    </div>
  );
}
