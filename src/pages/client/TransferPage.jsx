import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shuffle,
  ArrowRight,
  Wallet,
  Send,
  CheckCircle2,
  FileText,
  Hash,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AccountSelector from '../../components/banking/AccountSelector';
import { useCuentas } from '../../hooks/useCuentas';
import { operacionesApi } from '../../api/operaciones.api';
import { pushToast } from '../../store/notificationStore';
import { fmtMoney } from '../../lib/format';
import {
  LIMITES_DB,
  soloDigitosMax,
  validarIdCuenta,
  validarMontoPositivo,
} from '../../lib/validaciones';

export default function TransferPage() {
  const { cuentas, cuentaActiva, setCuentaActiva, refresh } = useCuentas();
  const [destino, setDestino] = useState('');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const saldo = cuentaActiva?.saldo || 0;
  const montoNum = Number(monto) || 0;
  const excede = montoNum > saldo;
  const destinoErr = destino ? validarIdCuenta(destino) : null;
  const mismaCuenta =
    destino && cuentaActiva && Number(destino) === cuentaActiva.idCuenta
      ? 'No puedes transferir a la misma cuenta de origen.'
      : null;
  const montoErr = monto ? validarMontoPositivo(monto) : null;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!cuentaActiva) return;
    if (!destino || !monto) {
      pushToast({
        type: 'error',
        title: 'Datos incompletos',
        message: 'Completa la cuenta destino y el monto.',
      });
      return;
    }
    if (destinoErr || mismaCuenta || montoErr) {
      pushToast({
        type: 'warning',
        title: 'Revisa los datos',
        message: destinoErr || mismaCuenta || montoErr,
      });
      return;
    }
    if (excede) {
      pushToast({
        type: 'warning',
        title: 'Saldo insuficiente',
        message: `Tu saldo disponible es ${fmtMoney(saldo)}.`,
      });
      return;
    }
    setLoading(true);
    try {
      const res = await operacionesApi.transferir({
        idCuentaOrigen: cuentaActiva.idCuenta,
        idCuentaDestino: Number(destino),
        monto: montoNum,
        descripcion,
      });
      setResultado(res);
      pushToast({
        type: 'success',
        title: 'Transferencia realizada',
        message: `Se enviaron ${fmtMoney(montoNum)} a la cuenta ${destino}.`,
      });
      setDestino('');
      setMonto('');
      setDescripcion('');
      refresh();
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'No se pudo transferir',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transferir entre cuentas"
        description="Mueve dinero entre cuentas del banco al instante."
        icon={Shuffle}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Nueva transferencia"
            subtitle="Tu cuenta origen es la activa en la barra superior."
          />
          <CardBody>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Cuenta origen"
                  value={cuentaActiva?.noCuenta || ''}
                  leftIcon={Wallet}
                  readOnly
                  hint={`Saldo disponible: ${fmtMoney(saldo)}`}
                />
                <Input
                  label="ID cuenta destino"
                  value={destino}
                  onChange={(e) => setDestino(soloDigitosMax(e.target.value, 10))}
                  placeholder="Ej. 105"
                  leftIcon={Hash}
                  inputMode="numeric"
                  maxLength={10}
                  hint="Identificador interno del banco"
                  error={destinoErr || mismaCuenta}
                />
              </div>
              <Input
                label="Monto a transferir"
                type="number"
                step="0.01"
                min="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                leftIcon={Send}
                error={
                  excede
                    ? 'El monto supera tu saldo disponible'
                    : montoErr || undefined
                }
              />
              <Input
                label="Descripción (opcional)"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej. Pago renta noviembre"
                leftIcon={FileText}
                maxLength={LIMITES_DB.bitacora.referencia}
                hint={`Máximo ${LIMITES_DB.bitacora.referencia} caracteres`}
              />

              <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-2">
                <p className="text-xs text-muted">
                  Las transferencias entre cuentas del banco son instantáneas y sin comisión.
                </p>
                <Button
                  type="submit"
                  size="lg"
                  rightIcon={ArrowRight}
                  loading={loading}
                  className="sm:w-auto"
                  disabled={
                    excede ||
                    !!destinoErr ||
                    !!mismaCuenta ||
                    !!montoErr ||
                    !destino ||
                    !monto
                  }
                >
                  Enviar dinero
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Resumen" subtitle="Vista previa en tiempo real" />
          <CardBody>
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-brand p-5 text-white shadow-glow">
                <p className="text-[10px] uppercase tracking-widest text-white/70">
                  Vas a enviar
                </p>
                <p className="mt-2 font-mono text-3xl font-bold">
                  {fmtMoney(montoNum)}
                </p>
                <p className="mt-2 text-xs text-white/80">
                  desde {cuentaActiva?.noCuenta || '—'} → {destino || '—'}
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Saldo actual</span>
                  <span className="font-mono">{fmtMoney(saldo)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Saldo estimado</span>
                  <span className="font-mono">
                    {fmtMoney(Math.max(0, saldo - montoNum))}
                  </span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Comisión</span>
                  <span className="font-mono">{fmtMoney(0)}</span>
                </div>
              </div>

              {resultado && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-emerald-500/10 p-4"
                >
                  <div className="flex items-center gap-2 text-emerald-500">
                    <CheckCircle2 className="h-4 w-4" />
                    <p className="text-sm font-semibold">Última transferencia</p>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Tx #{resultado.idTransaccion} · saldo posterior{' '}
                    <strong>{fmtMoney(resultado.saldoPosterior)}</strong>
                  </p>
                </motion.div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
