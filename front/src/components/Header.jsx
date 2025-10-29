// components/Header.jsx - БЕЗ КЛИЕНТСКИХ КНОПОК ДЛЯ АДМИНА
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Header.scss';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/services');
    } else {
      navigate('/login');
    }
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const getInitials = () => {
    if (!user) return '👤';
    return `${user.name?.[0] || ''}${user.surname?.[0] || ''}`.toUpperCase() || '👤';
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Логотип */}
        <div className="header-brand">
          <a
            href={user?.role === 'admin' ? '/admin' : '/services'}
            onClick={handleLogoClick}
            className="logo">
            <span className="logo-icon">💆‍♀️</span>
            <span className="logo-text">BeautyCRM</span>
          </a>
          <span className="brand-subtitle">
            {user?.role === 'admin' ? 'Админ-панель' : 'Запись на услуги'}
          </span>
        </div>

        {/* Десктопная навигация */}
        <nav className="nav-desktop">
          {user ? (
            <>
              {/* Для администратора показываем только админ-панель */}
              {user.role === 'admin' ? (
                <>
                  <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>
                    <span className="nav-icon">👑</span>
                    Админ-панель
                  </Link>
                </>
              ) : (
                <>
                  {/* Для клиентов обычная навигация */}
                  <Link to="/services" className={`nav-link ${isActive('/services')}`}>
                    <span className="nav-icon">📅</span>
                    Услуги и запись
                  </Link>
                  <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
                    <span className="nav-icon">👤</span>
                    Мой кабинет
                  </Link>
                </>
              )}

              {/* Меню пользователя */}
              <div className="user-menu" ref={userMenuRef}>
                <button
                  className="user-menu-toggle"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                  <div className="user-avatar">
                    {getInitials()}
                    {user.telegramConnected && (
                      <span className="telegram-indicator" title="Telegram привязан">
                        📱
                      </span>
                    )}
                  </div>
                  <span className="user-name">
                    {user.name} {user.surname}
                  </span>
                  <span className={`dropdown-arrow ${isUserMenuOpen ? 'open' : ''}`}>▼</span>
                </button>

                {isUserMenuOpen && (
                  <div className="user-dropdown">
                    <div className="user-info-card">
                      <div className="user-info-header">
                        <div className="user-avatar large">{getInitials()}</div>
                        <div className="user-details">
                          <div className="user-fullname">
                            {user.name} {user.surname}
                          </div>
                          <div className="user-email">{user.email}</div>
                          <div className="user-role-badge">
                            {user.role === 'admin' ? '👑 Администратор' : '👤 Клиент'}
                          </div>
                        </div>
                      </div>
                      {user.telegramConnected && (
                        <div className="telegram-status">
                          <span className="telegram-icon">📱</span>
                          Telegram подключен
                        </div>
                      )}
                    </div>

                    <div className="dropdown-divider"></div>

                    {user.role === 'admin' ? (
                      <>
                        <Link
                          to="/admin"
                          className="dropdown-item"
                          onClick={() => setIsUserMenuOpen(false)}>
                          <span className="item-icon">👑</span>
                          Админ-панель
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/profile"
                          className="dropdown-item"
                          onClick={() => setIsUserMenuOpen(false)}>
                          <span className="item-icon">👤</span>
                          Личный кабинет
                        </Link>
                        <Link
                          to="/services"
                          className="dropdown-item"
                          onClick={() => setIsUserMenuOpen(false)}>
                          <span className="item-icon">📅</span>
                          Запись на услуги
                        </Link>
                      </>
                    )}

                    <div className="dropdown-divider"></div>

                    <button onClick={handleLogout} className="dropdown-item logout">
                      <span className="item-icon">🚪</span>
                      Выйти из системы
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary btn-small">
                Войти
              </Link>
              <Link to="/register" className="btn btn-primary btn-small">
                Регистрация
              </Link>
            </div>
          )}
        </nav>

        {/* Мобильное меню */}
        <div className="mobile-menu" ref={menuRef}>
          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className={`menu-icon ${isMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {isMenuOpen && (
            <div className="mobile-nav">
              {user ? (
                <>
                  <div className="mobile-user-info">
                    <div className="user-avatar">{getInitials()}</div>
                    <div className="user-details">
                      <div className="user-name">
                        {user.name} {user.surname}
                      </div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>

                  {user.role === 'admin' ? (
                    <>
                      <Link
                        to="/admin"
                        className="mobile-nav-link"
                        onClick={() => setIsMenuOpen(false)}>
                        <span className="nav-icon">👑</span>
                        Админ-панель
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/services"
                        className="mobile-nav-link"
                        onClick={() => setIsMenuOpen(false)}>
                        <span className="nav-icon">📅</span>
                        Услуги и запись
                      </Link>

                      <Link
                        to="/profile"
                        className="mobile-nav-link"
                        onClick={() => setIsMenuOpen(false)}>
                        <span className="nav-icon">👤</span>
                        Мой кабинет
                      </Link>
                    </>
                  )}

                  {user.telegramConnected && (
                    <div className="mobile-telegram-status">
                      <span className="telegram-icon">📱</span>
                      Telegram подключен
                    </div>
                  )}

                  <button onClick={handleLogout} className="mobile-logout-btn">
                    <span className="logout-icon">🚪</span>
                    Выйти из системы
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="mobile-nav-link"
                    onClick={() => setIsMenuOpen(false)}>
                    Войти в систему
                  </Link>
                  <Link
                    to="/register"
                    className="mobile-nav-link"
                    onClick={() => setIsMenuOpen(false)}>
                    Создать аккаунт
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
