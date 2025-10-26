import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage'; // ← Этот импорт
import BookingPage from './pages/BookingPage';
import ClientDashboard from './pages/ClientDashboard';
import ClientSettings from './pages/ClientSettings';
import AdminDashboard from './pages/AdminDashboard';
import './styles/main.scss';

const App = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate to={user?.role === 'admin' ? '/admin' : '/client'} />
            )
          }
        />
        <Route
          path="/admin/login"
          element={!isAuthenticated ? <AdminLoginPage /> : <Navigate to="/admin" />}
        />

        {/* Protected client routes */}
        {isAuthenticated && user?.role === 'client' && (
          <>
            <Route path="/client" element={<ClientDashboard />} />
            <Route
              path="/client/history"
              element={
                <div className="card">
                  <h2>История записей</h2>
                </div>
              }
            />
            <Route path="/client/settings" element={<ClientSettings />} />
            <Route path="/booking" element={<BookingPage />} />
          </>
        )}

        {/* Admin routes */}
        {isAuthenticated && user?.role === 'admin' && (
          <>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route
              path="/admin/services"
              element={
                <div className="card">
                  <h2>Управление услугами</h2>
                </div>
              }
            />
            <Route
              path="/admin/clients"
              element={
                <div className="card">
                  <h2>Управление клиентами</h2>
                </div>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <div className="card">
                  <h2>Управление уведомлениями</h2>
                </div>
              }
            />
          </>
        )}

        {/* Redirects */}
        <Route
          path="/"
          element={
            <Navigate
              to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/client') : '/login'}
              replace
            />
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
