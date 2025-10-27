import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="auth-container">
      <div className="card card--elevated auth-card">
        <div className="auth-header">
          <div className="auth-logo">🌟</div>
          <h1 className="auth-title">Создать аккаунт</h1>
          <p className="auth-subtitle">Присоединяйтесь к нам</p>
        </div>

        {error && <div className="error--message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form__row">
            <div className="form__group">
              <label className="form__label">Имя *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form__input"
                placeholder="Ваше имя"
                required
              />
            </div>

            <div className="form__group">
              <label className="form__label">Фамилия *</label>
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                className="form__input"
                placeholder="Ваша фамилия"
                required
              />
            </div>
          </div>

          <div className="form__group">
            <label className="form__label">Телефон *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form__input"
              placeholder="+7 (999) 999-99-99"
              required
            />
          </div>

          <div className="form__group">
            <label className="form__label">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form__input"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form__group">
            <label className="form__label">Пароль *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form__input"
              placeholder="Не менее 6 символов"
              required
              minLength="6"
            />
          </div>

          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? (
              <>
                <div className="auth-spinner"></div>
                Регистрация...
              </>
            ) : (
              '🚀 Создать аккаунт'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="auth-link">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
