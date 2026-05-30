import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PiggyBank,
  Search,
  CreditCard,
  Lock,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Hash,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { SERVICIOS, TIPO_SERVICIO } from '../../lib/tipoServicio';
import { pagosApi } from '../../api/pagos.api';
import { pushToast } from '../../store/notificationStore';
import { fmtMoney } from '../../lib/format';
import clsx from 'clsx';

export default function PaymentsPage() {
  const [tipo, setTipo] = useState(TIPO_SERVICIO.UNIVERSIDAD);
  const [identificador, setIdentificador] = useState('');
  const [validando, setValidando] = useState(false);
  const [deuda, setDeuda] = useState(null);
  const [validacion, setValidacion] = useState(null);

  const [tarjeta, setTarjeta] = useState('');
  const [pin, setPin] = useState('');
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');
  const [referencia, setReferencia] = useState('');
  const [pagando, setPagando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const servicio = SERVICIOS.find((s) => s.id === tipo);

  const onValidar = async () => {
    if (!identificador) return;
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
        message: 'Cargamos la deuda pendiente.',
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

  const onPagar = async (e) => {
    e.preventDefault();
    if (!validacion?.esValido || !deuda) {
      pushToast({
        type: 'warning',
        title: 'Validación pendiente',
        message: 'Primero valida el identificador y consulta la deuda.',
      });
      return;
    }
    setPagando(true);
    try {
      const res = await pagosApi.ejecutar({
        numeroTarjeta: tarjeta.replace(/\s/g, ''),
        pin,
        tipoServicio: tipo,
        identificador,
        monto: Number(deuda.monto),
        referenciaCliente: referencia,
        mesVencimiento: mes ? Number(mes) : null,
        anioVencimiento: anio ? Number(anio) : null,
      });
      setResultado(res);
      pushToast({
        type: 'success',
        title: 'Pago realizado',
        message: `Saldo posterior: ${fmtMoney(res.saldoPosteriorCuentahabiente)}`,
      });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'No se pudo pagar',
        message: err.message,
      });
    } finally {
      setPagando(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pagar servicios"
        description="Universidad, telefonía y energía eléctrica desde tu tarjeta de débito."
        icon={PiggyBank}
      />

      {/* Selector de servicio */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SERVICIOS.map((s) => (
          <motion.button
            key={s.id}
            onClick={() => {
              setTipo(s.id);
              setDeuda(null);
              setValidacion(null);
              setResultado(null);
            }}
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
        <Card className="lg:col-span-3">
          <CardHeader title="Datos del pago" subtitle={`Servicio: ${servicio.nombre}`} />
          <CardBody>
            <form onSubmit={onPagar} className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    label="Identificador"
                    placeholder={servicio.placeholder}
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    leftIcon={Hash}
                  />
                </div>
                <div className="self-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onValidar}
                    loading={validando}
                    leftIcon={Search}
                  >
                    Validar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Número de tarjeta"
                  placeholder="0000 0000 0000 0000"
                  value={tarjeta}
                  onChange={(e) => setTarjeta(e.target.value)}
                  leftIcon={CreditCard}
                  maxLength={19}
                />
                <Input
                  label="PIN"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  leftIcon={Lock}
                  maxLength={6}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Mes"
                  type="number"
                  min="1"
                  max="12"
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                  placeholder="MM"
                  leftIcon={Calendar}
                />
                <Input
                  label="Año"
                  type="number"
                  min="2024"
                  max="2099"
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                  placeholder="YYYY"
                />
                <Input
                  label="Referencia"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Opcional"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  size="lg"
                  rightIcon={ArrowRight}
                  loading={pagando}
                  disabled={!deuda || !validacion?.esValido}
                >
                  Pagar {deuda ? fmtMoney(deuda.monto) : ''}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <div
              className={clsx(
                'bg-gradient-to-br p-5 text-white',
                servicio.accent
              )}
            >
              <p className="text-[10px] uppercase tracking-widest text-white/70">
                Resumen del servicio
              </p>
              <p className="mt-2 text-lg font-semibold">{servicio.nombre}</p>
              <p className="text-xs text-white/80">{servicio.descripcion}</p>
            </div>
            <CardBody>
              {validacion ? (
                <div className="space-y-2 text-sm">
                  <Row label="Estado" value={validacion.esValido ? 'Válido' : 'Inválido'} />
                  <Row label="Mensaje" value={validacion.mensaje || '—'} />
                  <Row label="Referencia externa" value={validacion.referenciaExterna || '—'} />
                </div>
              ) : (
                <p className="text-sm text-muted">
                  Ingresa el identificador y pulsa <strong>Validar</strong> para
                  consultar la deuda.
                </p>
              )}

              {deuda && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-2xl bg-brand-500/10 p-4"
                >
                  <p className="text-xs uppercase tracking-wider text-brand-500">
                    Deuda pendiente
                  </p>
                  <p className="font-mono text-2xl font-bold text-ink-900 dark:text-ink-50">
                    {fmtMoney(deuda.monto || 0)}
                  </p>
                </motion.div>
              )}

              {resultado && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 rounded-2xl bg-emerald-500/10 p-4"
                >
                  <div className="flex items-center gap-2 text-emerald-500">
                    <CheckCircle2 className="h-4 w-4" />
                    <p className="text-sm font-semibold">Pago confirmado</p>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <Stat label="Total" value={fmtMoney(resultado.montoTotal)} />
                    <Stat
                      label="Acreditado"
                      value={fmtMoney(resultado.montoAcreditadoPrestadora)}
                    />
                    <Stat
                      label="Comisión"
                      value={fmtMoney(resultado.comisionBanco)}
                    />
                    <Stat
                      label="Saldo posterior"
                      value={fmtMoney(resultado.saldoPosteriorCuentahabiente)}
                    />
                  </div>
                </motion.div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-white/40 dark:bg-white/5 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className="font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}
