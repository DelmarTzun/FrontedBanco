import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Eye, EyeOff, Copy } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import VirtualCard from '../../components/banking/VirtualCard';
import Skeleton from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';
import { useCuentas } from '../../hooks/useCuentas';
import { useAuthStore } from '../../store/authStore';
import { pushToast } from '../../store/notificationStore';
import { chunkCard, fmtMoney } from '../../lib/format';
import { getEstadoCuenta } from '../../lib/estadoCuenta';

const VARIANTS = ['brand', 'alt', 'aqua', 'sunset'];

export default function CardsPage() {
  const { cuentas, loading } = useCuentas();
  const nombre = useAuthStore((s) => s.nombre);
  const [selected, setSelected] = useState(0);
  const [reveal, setReveal] = useState(false);

  const tarjetas = cuentas.filter((c) => c.numeroTarjeta);
  const safeIdx = Math.min(selected, Math.max(0, tarjetas.length - 1));
  const card = tarjetas[safeIdx];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis tarjetas"
        description="Gestiona tus tarjetas virtuales: datos, seguridad y diseño."
        icon={CreditCard}
      />

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="aspect-[1.6/1] rounded-3xl" />
          <Skeleton className="aspect-[1.6/1] rounded-3xl" />
          <Skeleton className="aspect-[1.6/1] rounded-3xl" />
        </div>
      ) : tarjetas.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Aún no tienes tarjetas emitidas"
          description="Solicita a un administrador del banco emitir una tarjeta de débito asociada a tu cuenta."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Carrusel */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {tarjetas.map((t, i) => (
                <motion.button
                  key={t.idCuenta}
                  onClick={() => {
                    setSelected(i);
                    setReveal(false);
                  }}
                  whileHover={{ y: -3 }}
                  className={
                    'relative shrink-0 transition-all ' +
                    (i === safeIdx ? 'opacity-100' : 'opacity-60 hover:opacity-90')
                  }
                  style={{ width: 'min(420px, 80vw)' }}
                >
                  <VirtualCard
                    numero={t.numeroTarjeta}
                    titular={nombre || 'CUENTAHABIENTE'}
                    vencMes={t.mesVencimiento || 12}
                    vencAnio={t.anioVencimiento || 2028}
                    saldo={t.saldo}
                    variant={VARIANTS[i % VARIANTS.length]}
                  />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Detalles */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="Datos de la tarjeta"
              subtitle="Mantén estos datos en privado."
              action={(() => {
                const estado = getEstadoCuenta(card.idEstado);
                return (
                  <Badge tone={estado.tone} icon={estado.icon}>
                    {estado.label}
                  </Badge>
                );
              })()}
            />
            <CardBody>
              <Field label="Titular" value={(nombre || 'CUENTAHABIENTE').toUpperCase()} />
              <Field
                label="Número"
                value={reveal ? chunkCard(card.numeroTarjeta) : '•••• •••• •••• ' + (card.numeroTarjeta || '').slice(-4)}
                copyValue={card.numeroTarjeta}
              />
              <Field
                label="Vence"
                value={`${String(card.mesVencimiento || 12).padStart(2, '0')} / ${card.anioVencimiento || 2028}`}
              />
              <Field label="Cuenta vinculada" value={card.noCuenta} />
              <Field
                label="Saldo disponible"
                value={fmtMoney(card.saldo)}
                tone="brand"
              />

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-muted">
                  Por seguridad, los datos sensibles se ocultan por defecto.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={reveal ? EyeOff : Eye}
                  onClick={() => setReveal((r) => !r)}
                >
                  {reveal ? 'Ocultar' : 'Mostrar'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, tone, copyValue }) {
  const handleCopy = () => {
    if (copyValue) {
      navigator.clipboard.writeText(copyValue);
      pushToast({ type: 'success', title: 'Copiado', message: `${label} copiado.` });
    }
  };
  return (
    <div className="flex items-center justify-between gap-2 py-3 border-b border-ink-100 dark:border-white/5 last:border-0">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <div className="flex items-center gap-2">
        <span
          className={
            'font-mono text-sm ' +
            (tone === 'brand'
              ? 'text-brand-500 font-semibold'
              : 'text-ink-900 dark:text-ink-50')
          }
        >
          {value}
        </span>
        {copyValue && (
          <button
            onClick={handleCopy}
            className="text-ink-400 hover:text-brand-500"
            aria-label={`Copiar ${label}`}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
