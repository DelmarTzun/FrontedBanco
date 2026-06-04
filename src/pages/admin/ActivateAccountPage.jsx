import { useState } from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, Hash, Coins } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { operacionesApi } from '../../api/operaciones.api';
import { pushToast } from '../../store/notificationStore';
import { fmtMoney } from '../../lib/format';
import {
  soloDigitosMax,
  validarIdCuenta,
  LIMITES_OPERACION,
} from '../../lib/validaciones';

const MONTO_MINIMO_APERTURA = 100;
const MONTO_MAXIMO_APERTURA = LIMITES_OPERACION.MONTO_MAXIMO_OPERACION;

export default function ActivateAccountPage() {
  const [idCuenta, setIdCuenta] = useState('');
  const [monto, setMonto] = useState('100');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const idErr = idCuenta ? validarIdCuenta(idCuenta) : null;
  const montoNum = Number(monto);
  let montoErr = null;
  if (monto) {
    if (!Number.isFinite(montoNum)) {
      montoErr = 'El monto debe ser un número válido.';
    } else if (montoNum < MONTO_MINIMO_APERTURA) {
      montoErr = `El depósito mínimo de apertura es Q${MONTO_MINIMO_APERTURA}.00.`;
    } else if (montoNum > MONTO_MAXIMO_APERTURA) {
      montoErr = `El depósito de apertura no puede exceder Q${MONTO_MAXIMO_APERTURA.toLocaleString('es-GT')}.`;
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    if (idErr || montoErr || !idCuenta || !monto) {
      pushToast({
        type: 'warning',
        title: 'Datos inválidos',
        message:
          idErr ||
          montoErr ||
          `Indica el ID de la cuenta y un monto entre Q${MONTO_MINIMO_APERTURA} y Q${MONTO_MAXIMO_APERTURA.toLocaleString('es-GT')}.`,
      });
      return;
    }
    setLoading(true);
    try {
      const res = await operacionesApi.activarCuenta({
        idCuenta: Number(idCuenta),
        montoDeposito: Number(monto),
      });
      setResult(res);
      pushToast({
        type: 'success',
        title: 'Cuenta activada',
        message: `Saldo posterior: ${fmtMoney(res.saldoPosterior)}`,
      });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'No se pudo activar',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activar cuenta"
        description="Aplica el depósito inicial mínimo para activar una cuenta nueva."
        icon={ShieldCheck}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader title="Datos de activación" />
          <CardBody>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="ID de la cuenta"
                  value={idCuenta}
                  onChange={(e) => setIdCuenta(soloDigitosMax(e.target.value, 10))}
                  placeholder="Ej. 121"
                  leftIcon={Hash}
                  inputMode="numeric"
                  maxLength={10}
                  error={idErr}
                />
                <Input
                  label="Depósito de activación"
                  type="number"
                  step="0.01"
                  min={MONTO_MINIMO_APERTURA}
                  max={MONTO_MAXIMO_APERTURA}
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  leftIcon={Coins}
                  hint={`Entre Q${MONTO_MINIMO_APERTURA}.00 y Q${MONTO_MAXIMO_APERTURA.toLocaleString('es-GT')}.00`}
                  error={montoErr}
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  size="lg"
                  loading={loading}
                  rightIcon={ArrowRight}
                  variant="success"
                  disabled={!!idErr || !!montoErr || !idCuenta || !monto}
                >
                  Activar cuenta
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Resultado" />
          <CardBody>
            {result ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" />
                  <p className="text-sm font-semibold">Operación exitosa</p>
                </div>
                <Row label="Tx" value={`#${result.idTransaccion}`} />
                <Row label="Cuenta" value={`#${result.idCuenta}`} />
                <Row label="Depositado" value={fmtMoney(result.monto)} />
                <Row label="Saldo posterior" value={fmtMoney(result.saldoPosterior)} highlight />
                <p className="text-xs text-muted">
                  La cuenta queda ACTIVA y puede operar inmediatamente.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted">
                Indica el ID de cuenta y el monto del depósito inicial.
              </p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between rounded-xl glass-soft p-3">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p
        className={
          'font-mono text-sm ' +
          (highlight
            ? 'text-brand-500 font-semibold'
            : 'text-ink-900 dark:text-ink-50')
        }
      >
        {value}
      </p>
    </div>
  );
}
