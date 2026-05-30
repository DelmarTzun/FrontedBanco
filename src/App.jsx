import AppRoutes from './routes/AppRoutes.jsx';
import ToastContainer from './components/feedback/ToastContainer.jsx';

export default function App() {
  return (
    <div className="app-bg min-h-screen">
      <AppRoutes />
      <ToastContainer />
    </div>
  );
}
