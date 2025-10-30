// pages/Register.jsx - ОБНОВЛЕННАЯ РЕГИСТРАЦИЯ
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '/src/styles/Auth.scss';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

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

  const validateForm = () => {
    if (!formData.name.trim() || !formData.surname.trim()) {
      setError('Пожалуйста, укажите имя и фамилию');
      return false;
    }

    if (!formData.phone.trim()) {
      setError('Пожалуйста, укажите номер телефона');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Пожалуйста, укажите email');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      await register(formData);
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(err.message || 'Произошла ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    if (numbers.length <= 1) return `+7${numbers}`;
    if (numbers.length <= 4) return `+7 (${numbers.slice(1, 4)}`;
    if (numbers.length <= 7) return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}`;
    if (numbers.length <= 9)
      return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7, 9)}`;
    return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(
      7,
      9,
    )}-${numbers.slice(9, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const formattedPhone = formatPhone(e.target.value);
    setFormData({
      ...formData,
      phone: formattedPhone,
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-icon">🚀</div>
          <h1>Создайте аккаунт</h1>
          <p>Присоединяйтесь к BeautyCRM</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">
                <span className="label-icon">👤</span>
                Имя
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ваше имя"
                required
                disabled={isLoading}
                autoComplete="given-name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="surname">
                <span className="label-icon">👥</span>
                Фамилия
              </label>
              <input
                type="text"
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                placeholder="Ваша фамилия"
                required
                disabled={isLoading}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              <span className="label-icon">📞</span>
              Телефон
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="+7 (999) 123-45-67"
              required
              disabled={isLoading}
              autoComplete="tel"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <span className="label-icon">📧</span>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.ru"
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="form-row">
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
                  placeholder="Минимум 6 символов"
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
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
            <div className="form-group">
              <label htmlFor="confirmPassword">
                <span className="label-icon">✅</span>
                Подтвердите пароль
              </label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Повторите пароль"
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}>
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full auth-submit-btn"
            disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="btn-spinner"></div>
                Регистрация...
              </>
            ) : (
              <>
                <span className="btn-icon">✨</span>
                Создать аккаунт
              </>
            )}
          </button>

          <div className="auth-links">
            <p>
              Уже есть аккаунт?{' '}
              <a href="/login" className="auth-link">
                🔐 Войдите в систему
              </a>
            </p>
          </div>
        </form>

        <div className="auth-features">
          <h3>Что вы получите:</h3>
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">💆‍♀️</span>
              <span>Доступ ко всем услугам</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <span>Умные напоминания</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>История посещений</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⭐</span>
              <span>Специальные предложения</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
