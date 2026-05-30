import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * Guard de rutas:
 *  - Si no hay token válido, redirige a /login
 *  - Si se especifica un rol y no coincide, redirige a su área correspondiente
 */
export default function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  const userRole = useAuthStore((s) => s.rol);

  if (!isAuth) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && String(userRole).toUpperCase() !== String(role).toUpperCase()) {
    const fallback = userRole === 'ADMIN' ? '/admin' : '/app';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
