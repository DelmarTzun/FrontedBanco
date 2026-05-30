import { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Bell,
  ShieldCheck,
  LogOut,
  KeyRound,
  Lock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { pushToast } from '../../store/notificationStore';
import { authApi } from '../../api/auth.api';

export default function SettingsPage() {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const nombre = useAuthStore((s) => s.nombre);
  const rol = useAuthStore((s) => s.rol);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const [openCambio, setOpenCambio] = useState(false);
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirma, setConfirma] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState({});

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const resetFormulario = () => {
    setActual('');
    setNueva('');
    setConfirma('');
    setErrores({});
  };

  const cerrarCambio = () => {
    if (enviando) return;
    setOpenCambio(false);
    resetFormulario();
  };

  const validar = () => {
    const errs = {};
    if (!actual) errs.actual = 'Ingresa tu contraseña actual.';
    if (!nueva) errs.nueva = 'Ingresa la nueva contraseña.';
    else if (nueva.length < 8)
      errs.nueva = 'La nueva contraseña debe tener al menos 8 caracteres.';
    else if (nueva === actual)
      errs.nueva = 'La nueva contraseña debe ser distinta a la actual.';
    if (nueva !== confirma)
      errs.confirma = 'La confirmación no coincide.';
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const enviarCambio = async (e) => {
    e?.preventDefault();
    if (!validar()) return;
    setEnviando(true);
    try {
      await authApi.cambiarPassword({
        passwordActual: actual,
        passwordNueva: nueva,
      });
      pushToast({
        type: 'success',
        title: 'Contraseña actualizada',
        message: 'Tu nueva contraseña ya está activa.',
      });
      setOpenCambio(false);
      resetFormulario();
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'No se pudo cambiar la contraseña',
        message: err?.message || 'Inténtalo de nuevo.',
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ajustes"
        description="Configura preferencias de tu cuenta y experiencia."
        icon={Settings}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="Perfil" />
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-white text-base font-semibold shadow-glow">
                {(nombre || 'U').slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold">{nombre || 'Usuario'}</p>
                <p className="text-xs text-muted uppercase tracking-wider">
                  {rol}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Apariencia" />
          <CardBody>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={
                  'group flex items-center gap-2 rounded-xl border p-3 transition-all ' +
                  (theme === 'light'
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-ink-200 dark:border-white/10 hover:border-brand-400')
                }
              >
                <Sun className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Claro</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={
                  'group flex items-center gap-2 rounded-xl border p-3 transition-all ' +
                  (theme === 'dark'
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-ink-200 dark:border-white/10 hover:border-brand-400')
                }
              >
                <Moon className="h-4 w-4 text-brand-400" />
                <span className="text-sm font-medium">Oscuro</span>
              </button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Seguridad" />
          <CardBody>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 rounded-xl glass-soft p-3">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="font-medium">JWT activo</p>
                  <p className="text-xs text-muted">Sesión cifrada con HS256</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl glass-soft p-3">
                <Bell className="h-4 w-4 text-brand-500" />
                <div>
                  <p className="font-medium">Alertas en vivo</p>
                  <p className="text-xs text-muted">Activadas para esta cuenta</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-500">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Cambiar contraseña</p>
                <p className="text-xs text-muted">
                  Actualiza tu clave de acceso. Necesitarás tu contraseña actual.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              leftIcon={KeyRound}
              onClick={() => setOpenCambio(true)}
            >
              Cambiar contraseña
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Cerrar sesión</p>
              <p className="text-xs text-muted">
                Se eliminará tu token de este dispositivo.
              </p>
            </div>
            <Button variant="danger" leftIcon={LogOut} onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </CardBody>
      </Card>

      <Modal
        open={openCambio}
        onClose={cerrarCambio}
        title="Cambiar contraseña"
        description="Tu nueva contraseña debe tener al menos 8 caracteres."
        size="sm"
      >
        <form onSubmit={enviarCambio} className="space-y-4">
          <Input
            label="Contraseña actual"
            type="password"
            leftIcon={Lock}
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            error={errores.actual}
            autoComplete="current-password"
            disabled={enviando}
          />

          <Input
            label="Nueva contraseña"
            type="password"
            leftIcon={KeyRound}
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            error={errores.nueva}
            hint="Mínimo 8 caracteres, distinta a la actual."
            autoComplete="new-password"
            disabled={enviando}
          />

          <Input
            label="Confirmar nueva contraseña"
            type="password"
            leftIcon={KeyRound}
            value={confirma}
            onChange={(e) => setConfirma(e.target.value)}
            error={errores.confirma}
            autoComplete="new-password"
            disabled={enviando}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={cerrarCambio}
              disabled={enviando}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={enviando}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
