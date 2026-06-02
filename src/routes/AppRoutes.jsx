import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { FullScreenLoader } from '../components/ui/Spinner';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));

// Cliente
const DashboardPage = lazy(() => import('../pages/client/DashboardPage'));
const TransactionsPage = lazy(() => import('../pages/client/TransactionsPage'));
const TransferPage = lazy(() => import('../pages/client/TransferPage'));
const CardsPage = lazy(() => import('../pages/client/CardsPage'));
const PaymentsPage = lazy(() => import('../pages/client/PaymentsPage'));
const StatsPage = lazy(() => import('../pages/client/StatsPage'));
const NotificationsPage = lazy(() => import('../pages/client/NotificationsPage'));
const SettingsPage = lazy(() => import('../pages/client/SettingsPage'));

// Admin
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const ClientsPage = lazy(() => import('../pages/admin/ClientsPage'));
const CreateClientPage = lazy(() => import('../pages/admin/CreateClientPage'));
const ActivateAccountPage = lazy(() => import('../pages/admin/ActivateAccountPage'));
const DepositsPage = lazy(() => import('../pages/admin/DepositsPage'));
const BitacoraPage = lazy(() => import('../pages/admin/BitacoraPage'));
const InternalAccountsPage = lazy(() =>
  import('../pages/admin/InternalAccountsPage')
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<FullScreenLoader label="Preparando tu banca..." />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Área CLIENTE */}
        <Route
          path="/app"
          element={
            <ProtectedRoute role="CLIENTE">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="transacciones" element={<TransactionsPage />} />
          <Route path="transferir" element={<TransferPage />} />
          <Route path="tarjetas" element={<CardsPage />} />
          <Route path="pagos" element={<PaymentsPage />} />
          <Route path="estadisticas" element={<StatsPage />} />
          <Route path="notificaciones" element={<NotificationsPage />} />
          <Route path="ajustes" element={<SettingsPage />} />
        </Route>

        {/* Área ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="clientes" element={<ClientsPage />} />
          <Route path="crear-cliente" element={<CreateClientPage />} />
          <Route path="activar-cuenta" element={<ActivateAccountPage />} />
          <Route path="depositos" element={<DepositsPage />} />
          <Route path="cuentas-internas" element={<InternalAccountsPage />} />
          <Route path="bitacora" element={<BitacoraPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
