import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Header from './components/common/Header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import UserProfile from './components/profile/UserProfile';
import BookingFlow from './components/booking/BookingFlow';
import AdminDashboard from './components/AdminDashboard';
import ServiceSelection from './components/booking/ServiceSelection';
import './styles/globals.css';

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="loading__spinner"></div>
          <p>Проверяем авторизацию...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

// Компонент для публичных маршрутов (редирект если уже авторизован)
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="loading__spinner"></div>
          <p>Проверяем авторизацию...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" />;
  }

  return children;
};

// Главный компонент приложения с роутингом
const AppContent = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          {/* Публичные маршруты */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Защищенные маршруты для всех авторизованных */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <BookingFlow />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <ServiceSelection />
              </ProtectedRoute>
            }
          />

          {/* Маршруты только для админов */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Главная страница - разная для админа и пользователя */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {user?.role === 'admin' ? <Navigate to="/admin" /> : <ServiceSelection />}
              </ProtectedRoute>
            }
          />

          {/* Роут для несуществующих страниц */}
          <Route
            path="*"
            element={
              <div className="container">
                <div className="card text-center">
                  <div className="error-page">
                    <h1>404</h1>
                    <p>Страница не найдена</p>
                    <Navigate to="/" replace />
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

// Главный компонент приложения
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
