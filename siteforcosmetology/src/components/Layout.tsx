import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logout, toggleTheme } from '../store';
import { FaSun, FaMoon } from 'react-icons/fa';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { isDark } = useAppSelector((state) => state.theme);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="app">
      <header className="header">
        <h1>Кабинет косметологии</h1>
        {isAuthenticated && (
          <>
            <div className="theme-toggle" onClick={handleThemeToggle}>
              {isDark ? <FaSun size={20} /> : <FaMoon size={20} />}
            </div>
            <nav>
              {isAdmin ? (
                <>
                  <Link to="/admin">Панель</Link>
                  <Link to="/admin/services">Услуги</Link>
                  <Link to="/admin/clients">Клиенты</Link>
                  <Link to="/admin/notifications">Уведомления</Link>
                </>
              ) : (
                <>
                  <Link to="/client">Главная</Link>
                  <Link to="/booking">Записаться</Link>
                  <Link to="/client/settings">Настройки</Link>
                </>
              )}
            </nav>
            <div className="user-info">
              <span>
                {user?.name} {user?.surname}
              </span>
              <button onClick={handleLogout}>Выйти</button>
            </div>
          </>
        )}
      </header>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
