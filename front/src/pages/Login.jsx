// pages/Login.jsx - ОБНОВЛЕННАЯ СТРАНИЦА ВХОДА
import React, { useState, useEffect } from 'react';
import '../styles/Auth.scss';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    phoneOrEmail: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Редирект если уже авторизован
  useEffect(() => {
    if (user) {
      navigate('/profile', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phoneOrEmail.trim() || !formData.password.trim()) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(formData);
      const from = location.state?.from?.pathname || '/profile';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Произошла ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role = 'client') => {
    setIsLoading(true);
    setError('');

    try {
      const demoCredentials =
        role === 'admin'
          ? { phoneOrEmail: 'admin@beauty.ru', password: 'admin123' }
          : { phoneOrEmail: 'client@mail.ru', password: 'client123' };

      await login(demoCredentials);
      navigate('/profile', { replace: true });
    } catch (err) {
      setError('Демо-вход временно недоступен');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-icon">🔐</div>
          <h1>С возвращением!</h1>
          <p>Войдите в свой аккаунт BeautyCRM</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="phoneOrEmail">
              <span className="label-icon">📧</span>
              Email или телефон
            </label>
            <input
              type="text"
              id="phoneOrEmail"
              name="phoneOrEmail"
              value={formData.phoneOrEmail}
              onChange={handleChange}
              placeholder="example@mail.ru или +79991234567"
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <span className="label-icon">🔑</span>
              Пароль
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Введите ваш пароль"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full auth-submit-btn"
            disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="btn-spinner"></div>
                Вход в систему...
              </>
            ) : (
              <>
                <span className="btn-icon">🚀</span>
                Войти в систему
              </>
            )}
          </button>

          <div className="auth-divider">
            <span>или</span>
          </div>

          <div className="auth-links">
            <p>
              Нет аккаунта?{' '}
              <a href="/register" className="auth-link">
                📝 Зарегистрируйтесь
              </a>
            </p>
          </div>
        </form>

        <div className="auth-features">
          <h3>Преимущества системы:</h3>
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">📅</span>
              <span>Онлайн-запись 24/7</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔔</span>
              <span>Умные напоминания</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <span>Telegram уведомления</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💎</span>
              <span>Профессиональный сервис</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
