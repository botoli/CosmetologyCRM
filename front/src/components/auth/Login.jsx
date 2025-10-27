import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phoneOrEmail: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.phoneOrEmail, formData.password);
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
          <div className="auth-logo">💆</div>
          <h1 className="auth-title">Добро пожаловать</h1>
          <p className="auth-subtitle">Войдите в свой аккаунт</p>
        </div>

        {error && <div className="error--message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form__group">
            <label className="form__label">Телефон или E-mail</label>
            <input
              type="text"
              name="phoneOrEmail"
              value={formData.phoneOrEmail}
              onChange={handleChange}
              className="form__input"
              placeholder="Введите телефон или email"
              required
            />
          </div>

          <div className="form__group">
            <label className="form__label">Пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form__input"
              placeholder="Введите пароль"
              required
            />
          </div>

          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? (
              <>
                <div className="auth-spinner"></div>
                Вход...
              </>
            ) : (
              '🔐 Войти'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Нет аккаунта?{' '}
            <Link to="/register" className="auth-link">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
