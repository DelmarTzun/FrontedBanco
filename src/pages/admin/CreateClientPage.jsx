import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Mail,
  Phone,
  IdCard,
  Hash,
  User,
  Building,
  ArrowRight,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { TIPOS_CUENTA } from '../../lib/tipoCuenta';
import { cuentasApi } from '../../api/cuentas.api';
import { pushToast } from '../../store/notificationStore';
import clsx from 'clsx';

const empty = {
  dpi: '',
  nit: '',
  nombre: '',
  apellido: '',
  celular: '',
  email: '',
  idTipoCuenta: 1,
};

export default function CreateClientPage() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await cuentasApi.crearPerfil({
        Dpi: form.dpi,
        Nit: form.nit,
        Nombre: form.nombre,
        Apellido: form.apellido,
        telefono: form.celular,
        Email: form.email,
        IdTipoCuenta: Number(form.idTipoCuenta),
      });
      setResult(res);
      pushToast({
        type: 'success',
        title: 'Cliente creado',
        message: `Usuario asignado: ${res.usuarioAsignado}`,
      });
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'No se pudo crear',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    pushToast({ type: 'success', title: 'Copiado', message: `${label} copiado.` });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Crear cuentahabiente"
        description="Registra un nuevo cliente con apertura de cuenta."
        icon={UserPlus}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader title="Datos personales" />
          <CardBody>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={onChange}
                  required
                  leftIcon={User}
                />
                <Input
                  label="Apellido"
                  name="apellido"
                  value={form.apellido}
                  onChange={onChange}
                  required
                  leftIcon={User}
                />
                <Input
                  label="DPI"
                  name="dpi"
                  value={form.dpi}
                  onChange={onChange}
                  required
                  leftIcon={IdCard}
                  maxLength={13}
                />
                <Input
                  label="NIT"
                  name="nit"
                  value={form.nit}
                  onChange={onChange}
                  required
                  leftIcon={Hash}
                />
                <Input
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  leftIcon={Mail}
                />
                <Input
                  label="Celular"
                  name="celular"
                  value={form.celular}
                  onChange={onChange}
                  leftIcon={Phone}
                />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-ink-500 dark:text-ink-300 mb-2">
                  Tipo de cuenta
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {TIPOS_CUENTA.map((t) => {
                    const active = Number(form.idTipoCuenta) === t.id;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() =>
                          setForm((f) => ({ ...f, idTipoCuenta: t.id }))
                        }
                        className={clsx(
                          'rounded-xl border p-3 text-left transition-all',
                          active
                            ? 'border-brand-500 bg-brand-500/10'
                            : 'border-ink-200 dark:border-white/10 hover:border-brand-400'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Building
                            className={clsx(
                              'h-4 w-4',
                              active ? 'text-brand-500' : 'text-ink-400'
                            )}
                          />
                          <p className="text-sm font-semibold">{t.nombre}</p>
                        </div>
                        <p className="mt-1 text-xs text-muted">
                          Código contable: {t.codigo}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  size="lg"
                  loading={loading}
                  rightIcon={ArrowRight}
                >
                  Crear cuentahabiente
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Resultado" subtitle="Credenciales generadas para el cliente" />
          <CardBody>
            {result ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" />
                  <p className="text-sm font-semibold">Creado exitosamente</p>
                </div>
                <Field label="ID Cliente" value={String(result.idCliente)} onCopy={() => copy(String(result.idCliente), 'ID Cliente')} />
                <Field label="Nombre completo" value={result.nombreCompleto} />
                <Field label="DPI" value={result.dpi} />
                <Field label="Usuario asignado" value={result.usuarioAsignado} onCopy={() => copy(result.usuarioAsignado, 'Usuario')} />
                <Field
                  label="Password temporal"
                  value={result.passwordTemporal}
                  highlight
                  onCopy={() => copy(result.passwordTemporal, 'Password')}
                />
                <p className="text-xs text-amber-500">
                  ⚠️ Comparte estas credenciales por un canal seguro. El cliente
                  debe cambiar su contraseña al primer ingreso.
                </p>
              </motion.div>
            ) : (
              <p className="text-sm text-muted">
                Completa el formulario para emitir las credenciales del nuevo
                cuentahabiente.
              </p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value, highlight, onCopy }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl glass-soft p-3">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted">
          {label}
        </p>
        <p
          className={clsx(
            'font-mono text-sm truncate',
            highlight
              ? 'text-brand-500 font-semibold'
              : 'text-ink-900 dark:text-ink-50'
          )}
        >
          {value}
        </p>
      </div>
      {onCopy && (
        <button
          onClick={onCopy}
          className="text-ink-400 hover:text-brand-500"
          aria-label={`Copiar ${label}`}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
