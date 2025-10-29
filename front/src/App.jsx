// App.jsx - КОРРЕКТНАЯ ВЕРСИЯ СО СТАРЫМ API
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Header from './components/Header';

import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Services from './pages/Services';
import Admin from './pages/Admin';
import './styles/App.scss';

// Компонент для отображения загрузки
const LoadingSpinner = () => (
  <div className="app-loading">
    <div className="loading-spinner"></div>
    <p>Загрузка...</p>
  </div>
);

// Компонент для обработки ошибок
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Без логирования
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error">
          <h2>Произошла ошибка</h2>
          <p>Пожалуйста, обновите страницу</p>
          <button onClick={() => window.location.reload()}>Обновить</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Функция для определения куда редиректить пользователя
  const getRedirectPath = () => {
    if (!user) return '/login';
    return user.role === 'admin' ? '/admin' : '/services';
  };

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to={getRedirectPath()} replace />} />
          <Route
            path="/login"
            element={
              !user ? (
                <Login />
              ) : (
                <Navigate to={user.role === 'admin' ? '/admin' : '/services'} replace />
              )
            }
          />
          <Route
            path="/register"
            element={
              !user ? (
                <Register />
              ) : (
                <Navigate to={user.role === 'admin' ? '/admin' : '/services'} replace />
              )
            }
          />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
          <Route
            path="/services"
            element={
              user && user.role !== 'admin' ? (
                <Services />
              ) : (
                <Navigate to={user ? '/admin' : '/login'} replace />
              )
            }
          />
          <Route
            path="/admin"
            element={
              user && user.role === 'admin' ? (
                <Admin />
              ) : (
                <Navigate to={user ? '/services' : '/login'} replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        {/* Подавляем предупреждения через future flags в Router */}
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
