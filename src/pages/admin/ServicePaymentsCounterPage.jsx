import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
  Search,
  Hash,
  ArrowRight,
  CheckCircle2,
  User,
  IdCard,
  FileText,
  Coins,
  Banknote,
  Wallet,
  Building2,
  Sparkles,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { SERVICIOS, TIPO_SERVICIO, getServicio } from '../../lib/tipoServicio';
import { pagosApi } from '../../api/pagos.api';
import { pushToast } from '../../store/notificationStore';
import { fmtMoney, fmtDateTime } from '../../lib/format';
import { LIMITES_DB } from '../../lib/validaciones';
import clsx from 'clsx';

/**
 * Consola de pagos de servicios en ventanilla (rol ADMIN).
 *
 * Simula a un cliente que llega físicamente al banco con efectivo a pagar su
 * servicio. No requiere tarjeta ni PIN: el operador captura el identificador,
 * valida con la prestadora, cobra el efectivo y el sistema lo distribuye 95/5.
 *
 * Endpoint backend: POST /api/Pagos/ventanilla
 */
export default function ServicePaymentsCounterPage() {
  const [tipo, setTipo] = useState(TIPO_SERVICIO.UNIVERSIDAD);
  const [identificador, setIdentificador] = useState('');
  const [validando, setValidando] = useState(false);
  const [validacion, setValidacion] = useState(null);
  const [deuda, setDeuda] = useState(null);

  const [nombrePagador, setNombrePagador] = useState('');
  const [documentoPagador, setDocumentoPagador] = useState('');
  const [referencia, setReferencia] = useState('');

  const [confirmando, setConfirmando] = useState(false);
  const [cobrando, setCobrando] = useState(false);
  const [comprobante, setComprobante] = useState(null);

  const servicio = getServicio(tipo);

  /* ---------------- Validaciones ---------------- */
  const identificadorErr =
    identificador.length > 0 && !servicio.regex.test(identificador)
      ? servicio.mensajeInvalido
      : null;

  const documentoErr =
    documentoPagador.length > 0 &&
    !/^[\w-]{1,20}$/.test(documentoPagador)
      ? 'Solo letras, números y guiones (máx. 20).'
      : null;

  const puedeCobrar =
    !!deuda &&
    Number(deuda.monto) > 0 &&
    !!validacion?.esValido &&
    !identificadorErr &&
    !documentoErr;

  /* ---------------- Cambio de tipo de servicio ---------------- */
  const cambiarServicio = (nuevo) => {
    setTipo(nuevo);
    setIdentificador('');
    setValidacion(null);
    setDeuda(null);
    setComprobante(null);
  };

  /* ---------------- Validar identificador ---------------- */
  const onValidar = async () => {
    if (!identificador) {
      pushToast({
        type: 'warning',
        title: 'Falta el identificador',
        message: 'Captura el identificador antes de validar.',
      });
      return;
    }
    if (identificadorErr) {
      pushToast({
        type: 'warning',
        title: 'Identificador inválido',
        message: identificadorErr,
      });
      return;
    }
    setValidando(true);
    setValidacion(null);
    setDeuda(null);
    try {
      const val = await pagosApi.validar({
        tipoServicio: tipo,
        identificador,
      });
      setValidacion(val);
      const d = await pagosApi.consultarDeuda({
        tipoServicio: tipo,
        identificador,
      });
      setDeuda(d);
      pushToast({
        type: 'success',
        title: 'Identificador válido',
        message:
          d.monto > 0
            ? `Deuda pendiente: ${fmtMoney(d.monto)}`
            : 'No hay deuda pendiente para este identificador.',
      });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'No se pudo validar',
        message: err.message,
      });
    } finally {
      setValidando(false);
    }
  };

  /* ---------------- Confirmar y cobrar ---------------- */
  const onContinuar = (e) => {
    e?.preventDefault?.();
    if (!puedeCobrar) {
      pushToast({
        type: 'warning',
        title: 'Validación pendiente',
        message:
          'Valida el identificador y verifica que tenga deuda antes de cobrar.',
      });
      return;
    }
    setConfirmando(true);
  };

  const onCobrar = async () => {
    if (!puedeCobrar) return;
    setCobrando(true);
    try {
      const res = await pagosApi.ejecutarVentanilla({
        tipoServicio: tipo,
        identificador,
        monto: Number(deuda.monto),
        referenciaCliente: referencia || null,
        nombrePagador: nombrePagador || null,
        documentoPagador: documentoPagador || null,
      });
      setComprobante({
        ...res,
        servicio,
        identificador,
        nombrePagador,
        documentoPagador,
        referencia,
      });
      pushToast({
        type: 'success',
        title: 'Pago cobrado en ventanilla',
        message: `Comisión banco: ${fmtMoney(res.comisionBanco)} · Acreditado a prestadora: ${fmtMoney(res.montoAcreditadoPrestadora)}`,
      });
      // Reset de formulario pero mantenemos el servicio seleccionado
      setIdentificador('');
      setValidacion(null);
      setDeuda(null);
      setNombrePagador('');
      setDocumentoPagador('');
      setReferencia('');
      setConfirmando(false);
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'No se pudo cobrar el pago',
        message: err.message,
      });
    } finally {
      setCobrando(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pagos en ventanilla"
        description="Cobra servicios públicos en efectivo a clientes que llegan al banco. Sin tarjeta ni PIN."
        icon={Receipt}
      />

      {/* ---------------- Selector de servicio ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SERVICIOS.map((s) => (
          <motion.button
            key={s.id}
            onClick={() => cambiarServicio(s.id)}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            className={clsx(
              'relative overflow-hidden rounded-2xl p-5 text-left transition-all',
              tipo === s.id
                ? 'glass shadow-glow ring-2 ring-brand-400'
                : 'glass-soft hover:shadow-soft'
            )}
          >
            <div
              className={clsx(
                'grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow-glow',
                s.accent
              )}
            >
              <s.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold">{s.nombre}</p>
            <p className="text-xs text-muted">{s.descripcion}</p>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ---------------- Formulario principal ---------------- */}
        <Card className="lg:col-span-3">
          <CardHeader
            title="Datos del cobro"
            subtitle={`Servicio: ${servicio.nombre} · Cobro en efectivo`}
          />
          <CardBody>
            <form onSubmit={onContinuar} className="space-y-5">
              {/* Identificador + botón validar */}
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    label="Identificador del servicio"
                    placeholder={servicio.placeholder}
                    value={identificador}
                    onChange={(e) =>
                      setIdentificador(servicio.sanitizar(e.target.value))
                    }
                    leftIcon={Hash}
                    maxLength={servicio.maxLength}
                    inputMode={servicio.inputMode}
                    error={identificadorErr}
                    hint={`Máximo ${servicio.maxLength} caracteres`}
                    disabled={cobrando}
                  />
                </div>
                <div className="self-start mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onValidar}
                    loading={validando}
                    leftIcon={Search}
                    disabled={cobrando}
                  >
                    Validar y consultar deuda
                  </Button>
                </div>
              </div>

              {/* Datos del pagador (opcionales) */}
              <div className="rounded-2xl border border-ink-200 dark:border-white/10 p-4 space-y-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Datos del pagador (opcional, para el comprobante)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nombre del pagador"
                    value={nombrePagador}
                    onChange={(e) => setNombrePagador(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    leftIcon={User}
                    maxLength={100}
                    disabled={cobrando}
                  />
                  <Input
                    label="DPI / NIT"
                    value={documentoPagador}
                    onChange={(e) =>
                      setDocumentoPagador(
                        e.target.value.replace(/[^\w-]/g, '').slice(0, 20)
                      )
                    }
                    placeholder="Opcional"
                    leftIcon={IdCard}
                    maxLength={20}
                    error={documentoErr}
                    disabled={cobrando}
                  />
                </div>
                <Input
                  label="Referencia / observación"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ej. Pago en ventanilla sucursal centro"
                  leftIcon={FileText}
                  maxLength={LIMITES_DB.bitacora.referencia}
                  hint={`Máximo ${LIMITES_DB.bitacora.referencia} caracteres`}
                  disabled={cobrando}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 pt-2">
                <p className="text-xs text-muted">
                  El sistema distribuye <strong>95% a la prestadora</strong> y{' '}
                  <strong>5% como comisión del banco</strong>. La cuenta de
                  comisiones actúa como caja y queda balanceada.
                </p>
                <Button
                  type="submit"
                  size="lg"
                  rightIcon={ArrowRight}
                  disabled={!puedeCobrar || cobrando}
                >
                  {deuda
                    ? `Cobrar ${fmtMoney(deuda.monto)} en efectivo`
                    : 'Cobrar en efectivo'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* ---------------- Panel resumen ---------------- */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <div
              className={clsx(
                'bg-gradient-to-br p-5 text-white',
                servicio.accent
              )}
            >
              <p className="text-[10px] uppercase tracking-widest text-white/70">
                Servicio seleccionado
              </p>
              <p className="mt-2 text-lg font-semibold">{servicio.nombre}</p>
              <p className="text-xs text-white/80">{servicio.descripcion}</p>
            </div>
            <CardBody>
              {validacion ? (
                <div className="space-y-2 text-sm">
                  <Row
                    label="Estado"
                    value={
                      <Badge tone={validacion.esValido ? 'success' : 'danger'}>
                        {validacion.esValido ? 'Válido' : 'Inválido'}
                      </Badge>
                    }
                  />
                  <Row label="Mensaje" value={validacion.mensaje || '—'} />
                  {validacion.referenciaExterna && (
                    <Row
                      label="Referencia externa"
                      value={validacion.referenciaExterna}
                    />
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted">
                  Captura el identificador y pulsa{' '}
                  <strong>Validar y consultar deuda</strong> para ver el monto a
                  cobrar.
                </p>
              )}

              {deuda && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-2xl bg-brand-500/10 p-4"
                >
                  <p className="text-xs uppercase tracking-wider text-brand-500">
                    Total a cobrar al pagador
                  </p>
                  <p className="font-mono text-2xl font-bold text-ink-900 dark:text-ink-50">
                    {fmtMoney(deuda.monto || 0)}
                  </p>
                  {Number(deuda.monto) > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <Mini
                        label="Prestadora (95%)"
                        value={fmtMoney(Number(deuda.monto) * 0.95)}
                      />
                      <Mini
                        label="Comisión (5%)"
                        value={fmtMoney(Number(deuda.monto) * 0.05)}
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </CardBody>
          </Card>

          {/* ---------------- Comprobante del último pago ---------------- */}
          <AnimatePresence>
            {comprobante && (
              <motion.div
                key={comprobante.idTransaccionIngresoEfectivo}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                <Card>
                  <CardHeader
                    title={
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Comprobante</span>
                      </div>
                    }
                    subtitle={`Tx #${comprobante.idTransaccionIngresoEfectivo} · ${fmtDateTime(
                      comprobante.fechaUtc
                    )}`}
                  />
                  <CardBody>
                    <div className="space-y-2 text-sm">
                      <Row
                        label="Servicio"
                        value={comprobante.servicio.nombre}
                      />
                      <Row
                        label="Identificador"
                        value={comprobante.identificador}
                      />
                      {comprobante.nombrePagador && (
                        <Row
                          label="Pagador"
                          value={comprobante.nombrePagador}
                        />
                      )}
                      {comprobante.documentoPagador && (
                        <Row
                          label="DPI/NIT"
                          value={comprobante.documentoPagador}
                        />
                      )}
                      <div className="my-2 border-t border-ink-200/60 dark:border-white/10" />
                      <Row
                        label="Total cobrado"
                        value={
                          <span className="font-mono font-semibold">
                            {fmtMoney(comprobante.montoTotal)}
                          </span>
                        }
                      />
                      <Row
                        label="Acreditado a prestadora"
                        value={fmtMoney(comprobante.montoAcreditadoPrestadora)}
                      />
                      <Row
                        label="Comisión banco"
                        value={fmtMoney(comprobante.comisionBanco)}
                      />
                      <div className="mt-3">
                        <Badge
                          tone={
                            comprobante.notificacionEnviada
                              ? 'success'
                              : 'warning'
                          }
                        >
                          {comprobante.notificacionEnviada
                            ? 'Notificación enviada a prestadora'
                            : 'Notificación pendiente · conciliar manualmente'}
                        </Badge>
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
        onClose={() => !cobrando && setConfirmando(false)}
        title="Confirmar cobro en ventanilla"
        description="Revisa los datos. Una vez confirmado, el pago se acredita y se notifica a la prestadora."
        size="md"
      >
        {deuda && (
          <div className="space-y-4">
            <div className="space-y-2 rounded-2xl glass-soft p-4">
              <RowModal label="Servicio">
                <Badge tone="brand" icon={servicio.icon}>
                  {servicio.nombre}
                </Badge>
              </RowModal>
              <RowModal label="Identificador">
                <span className="font-mono">{identificador}</span>
              </RowModal>
              {nombrePagador && (
                <RowModal label="Pagador">{nombrePagador}</RowModal>
              )}
              {documentoPagador && (
                <RowModal label="DPI/NIT">{documentoPagador}</RowModal>
              )}
              {referencia && (
                <RowModal label="Referencia">{referencia}</RowModal>
              )}
              <div className="my-2 border-t border-ink-200/60 dark:border-white/10" />
              <RowModal label="Total a cobrar en efectivo" highlight>
                {fmtMoney(deuda.monto)}
              </RowModal>
              <RowModal label="A la prestadora (95%)">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-muted" />
                  {fmtMoney(Number(deuda.monto) * 0.95)}
                </span>
              </RowModal>
              <RowModal label="Comisión banco (5%)">
                <span className="inline-flex items-center gap-1">
                  <Wallet className="h-3.5 w-3.5 text-muted" />
                  {fmtMoney(Number(deuda.monto) * 0.05)}
                </span>
              </RowModal>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
              <Coins className="inline h-3.5 w-3.5 mr-1" />
              Confirma que has recibido <strong>{fmtMoney(deuda.monto)}</strong>{' '}
              en efectivo del cliente antes de continuar.
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="ghost"
                onClick={() => setConfirmando(false)}
                disabled={cobrando}
              >
                Cancelar
              </Button>
              <Button
                variant="success"
                leftIcon={Banknote}
                loading={cobrando}
                onClick={onCobrar}
              >
                Cobrar y acreditar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-lg bg-white/40 dark:bg-white/5 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className="font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}

function RowModal({ label, highlight, children }) {
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
