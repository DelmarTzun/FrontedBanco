import { useState } from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, Hash, Coins } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { operacionesApi } from '../../api/operaciones.api';
import { pushToast } from '../../store/notificationStore';
import { fmtMoney } from '../../lib/format';

export default function ActivateAccountPage() {
  const [idCuenta, setIdCuenta] = useState('');
  const [monto, setMonto] = useState('100');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!idCuenta || Number(monto) < 100) {
      pushToast({
        type: 'warning',
        title: 'Datos inválidos',
        message: 'ID válido y depósito mínimo Q100.',
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
                  type="number"
                  value={idCuenta}
                  onChange={(e) => setIdCuenta(e.target.value)}
                  placeholder="Ej. 121"
                  leftIcon={Hash}
                />
                <Input
                  label="Depósito de activación"
                  type="number"
                  step="0.01"
                  min="100"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  leftIcon={Coins}
                  hint="Mínimo Q100.00"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  size="lg"
                  loading={loading}
                  rightIcon={ArrowRight}
                  variant="success"
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
