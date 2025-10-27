import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <header className="header">
      <div className="header-content">
        {/* Логотип и бренд */}
        <Link to="/" className="logo" onClick={() => setIsMobileMenuOpen(false)}>
          <span className="logo-icon">💆</span>
          <span className="logo-text">Cosmetology</span>
        </Link>

        {/* Навигация для десктопа */}
        <nav className="nav hide-md">
          {user ? (
            <>
              {/* Навигация для администратора */}
              {user.role === 'admin' && (
                <div className="admin-switcher">
                  <Link to="/admin" className={`nav-link ${isAdminRoute ? 'active' : ''}`}>
                    👑 Панель управления
                  </Link>
                  <Link to="/" className={`nav-link ${!isAdminRoute ? 'active' : ''}`}>
                    👀 Вид клиента
                  </Link>
                </div>
              )}

              {/* Навигация для пользователя */}
              {user.role !== 'admin' && (
                <>
                  <Link to="/" className={`nav-link ${isActiveRoute('/') ? 'active' : ''}`}>
                    💆 Услуги
                  </Link>
                  <Link
                    to="/booking"
                    className={`nav-link ${isActiveRoute('/booking') ? 'active' : ''}`}>
                    📅 Запись
                  </Link>
                </>
              )}

              {/* Общая навигация */}
              <Link
                to="/profile"
                className={`nav-link ${isActiveRoute('/profile') ? 'active' : ''}`}>
                👤 Профиль
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                🔐 Войти
              </Link>
              <Link to="/register" className="nav-link">
                ✨ Регистрация
              </Link>
            </>
          )}
        </nav>

        {/* Блок пользователя */}
        <div className="user-section">
          {user ? (
            <>
              <div className="user-info hide-sm">
                <span className="welcome">
                  Привет, <strong>{user.name}</strong>
                  {user.role === 'admin' && ' 👑'}
                </span>
              </div>

              <button onClick={handleLogout} className="logout-btn">
                🚪 Выйти
              </button>
            </>
          ) : (
            <div className="auth-buttons hide-sm">
              <Link to="/login" className="btn btn--secondary btn--small">
                Войти
              </Link>
              <Link to="/register" className="btn btn--primary btn--small">
                Регистрация
              </Link>
            </div>
          )}

          {/* Кнопка мобильного меню */}
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            {user ? (
              <>
                {/* Мобильная навигация для администратора */}
                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin"
                      className={`mobile-nav-link ${isAdminRoute ? 'active' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}>
                      👑 Панель управления
                    </Link>
                    <Link
                      to="/"
                      className={`mobile-nav-link ${!isAdminRoute ? 'active' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}>
                      👀 Вид клиента
                    </Link>
                  </>
                )}

                {/* Мобильная навигация для пользователя */}
                {user.role !== 'admin' && (
                  <>
                    <Link
                      to="/"
                      className={`mobile-nav-link ${isActiveRoute('/') ? 'active' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}>
                      💆 Услуги
                    </Link>
                    <Link
                      to="/booking"
                      className={`mobile-nav-link ${isActiveRoute('/booking') ? 'active' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}>
                      📅 Запись
                    </Link>
                  </>
                )}

                {/* Общая мобильная навигация */}
                <Link
                  to="/profile"
                  className={`mobile-nav-link ${isActiveRoute('/profile') ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}>
                  👤 Профиль
                </Link>

                <div className="mobile-user-info">
                  <span>Привет, {user.name}</span>
                  {user.role === 'admin' && <span className="admin-badge">👑 Админ</span>}
                </div>

                <button onClick={handleLogout} className="mobile-logout-btn">
                  🚪 Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  🔐 Войти
                </Link>
                <Link
                  to="/register"
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  ✨ Регистрация
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
