import { useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Fingerprint,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { pushToast } from '../../store/notificationStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  const rol = useAuthStore((s) => s.rol);
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({ credencial: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (isAuth) {
    const dest = rol === 'ADMIN' ? '/admin' : '/app';
    return <Navigate to={dest} replace />;
  }

  const onChange = (e) => {
    setError(null); // limpia mensaje al volver a tipear
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.credencial.trim() || !form.password) {
      setError('Ingresa tu usuario/correo y tu contraseña para continuar.');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.login({
        credencial: form.credencial.trim(),
        password: form.password,
      });
      login({
        token: data.token,
        idUsuario: data.idUsuario,
        idCliente: data.idCliente,
        rol: data.rol,
      });
      pushToast({
        type: 'success',
        title: '¡Bienvenido!',
        message: 'Sesión iniciada correctamente.',
      });
      const dest =
        location.state?.from?.pathname ||
        (String(data.rol).toUpperCase() === 'ADMIN' ? '/admin' : '/app');
      navigate(dest, { replace: true });
    } catch (err) {
      // err viene normalizado del interceptor de http.js
      let msg;
      if (err?.status === 0) {
        msg = 'No pudimos conectar con el banco. Revisa tu conexión a internet.';
      } else if (err?.status === 401) {
        msg =
          'Credenciales incorrectas. Revisa tu usuario o correo y tu contraseña.';
      } else if (err?.status === 400) {
        msg =
          err.message ||
          'La información del formulario no es válida. Verifica los campos.';
      } else if (err?.status >= 500) {
        msg =
          'El servicio del banco está respondiendo con un error. Intenta nuevamente en unos minutos.';
      } else {
        msg = err?.message || 'No pudimos iniciar tu sesión. Intenta de nuevo.';
      }
      setError(msg);
      pushToast({
        type: 'error',
        title: 'No pudimos iniciar sesión',
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Floating orbs */}
      <div
        aria-hidden
        className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl animate-float"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-accent-500/25 blur-3xl animate-float"
        style={{ animationDelay: '1.5s' }}
      />

      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* HERO panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col justify-between p-12 text-ink-900 dark:text-ink-50"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-brand shadow-glow">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none">
                <path d="M4 17 L12 5 L20 17 Z" fill="currentColor" />
                <circle cx="12" cy="19.5" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <p className="text-lg font-bold tracking-tight">
              {import.meta.env.VITE_APP_NAME || 'Cosmos Bank'}
            </p>
          </div>

          <div className="space-y-6 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full glass-soft px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-brand-500" />
              Banca digital de nueva generación
            </div>
            <h1 className="text-5xl xl:text-6xl font-bold leading-[1.05] tracking-tight">
              Mueve tu dinero{' '}
              <span className="gradient-text">a la velocidad</span> que vives.
            </h1>
            <p className="text-lg text-muted">
              Cuentas, tarjetas virtuales, transferencias instantáneas y pagos de
              servicios — todo en una experiencia diseñada para que pierdas
              menos tiempo y sumes más.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-4">
              {[
                { icon: ShieldCheck, label: 'Cifrado JWT', desc: 'Seguridad bancaria' },
                { icon: Fingerprint, label: 'Acceso 24/7', desc: 'Desde cualquier dispositivo' },
                { icon: Sparkles, label: 'Tiempo real', desc: 'Saldo siempre actualizado' },
              ].map((f) => (
                <div key={f.label} className="glass-soft rounded-2xl p-3">
                  <f.icon className="h-4 w-4 text-brand-500" />
                  <p className="mt-2 text-sm font-semibold">{f.label}</p>
                  <p className="text-xs text-muted">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {import.meta.env.VITE_APP_NAME || 'Cosmos Bank'}
            . Todos los derechos reservados.
          </p>
        </motion.div>

        {/* FORM panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center justify-center p-6 sm:p-10"
        >
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand shadow-glow">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none">
                  <path d="M4 17 L12 5 L20 17 Z" fill="currentColor" />
                  <circle cx="12" cy="19.5" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <p className="text-lg font-bold tracking-tight">
                {import.meta.env.VITE_APP_NAME || 'Cosmos Bank'}
              </p>
            </div>

            <div className="glass rounded-3xl p-8 shadow-glass">
              <h2 className="text-2xl font-bold tracking-tight">
                Inicia sesión
              </h2>
              <p className="mt-1 text-sm text-muted">
                Ingresa con tu correo o usuario y tu contraseña.
              </p>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <Input
                  label="Usuario o correo"
                  name="credencial"
                  value={form.credencial}
                  onChange={onChange}
                  placeholder="cuentahabiente@correo.com"
                  leftIcon={Mail}
                  autoComplete="username"
                />
                <Input
                  label="Contraseña"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={onChange}
                  placeholder="••••••••"
                  leftIcon={Lock}
                  rightIcon={showPwd ? EyeOff : Eye}
                  autoComplete="current-password"
                />
                <div className="flex items-center justify-between text-xs">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-ink-300 text-brand-500 focus:ring-brand-400"
                      defaultChecked
                    />
                    <span className="text-muted">Recordarme</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="text-brand-500 hover:underline"
                  >
                    {showPwd ? 'Ocultar' : 'Mostrar'} contraseña
                  </button>
                </div>

                {error && (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-600 dark:text-rose-300"
                  >
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="leading-snug">{error}</span>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  loading={loading}
                  rightIcon={ArrowRight}
                  className="w-full"
                >
                  {loading ? 'Verificando...' : 'Entrar a mi cuenta'}
                </Button>

                <p className="text-center text-xs text-muted">
                  ¿No tienes cuenta?{' '}
                  <Link
                    to="/login"
                    onClick={(e) => {
                      e.preventDefault();
                      pushToast({
                        type: 'info',
                        title: 'Registro presencial',
                        message:
                          'La apertura de cuenta es realizada por un administrador del banco.',
                      });
                    }}
                    className="font-semibold text-brand-500 hover:underline"
                  >
                    Solicita apertura
                  </Link>
                </p>
              </form>
            </div>

            <p className="mt-6 text-center text-xs text-muted">
              Tus datos viajan cifrados con TLS. Nunca te pediremos tu contraseña
              por teléfono o correo.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
