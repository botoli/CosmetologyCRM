import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AuthForm = ({ type = 'login', onSubmit, loading = false, error = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
    password: '',
    phoneOrEmail: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (type === 'login') {
      onSubmit({
        phoneOrEmail: formData.phoneOrEmail,
        password: formData.password,
      });
    } else {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div style={authStyles.container}>
      <div className="card" style={authStyles.card}>
        <h2 style={authStyles.title}>
          {type === 'login' ? 'Вход в личный кабинет' : 'Регистрация'}
        </h2>

        {error && <div className="error--message">{error}</div>}

        <form onSubmit={handleSubmit} style={authStyles.form}>
          {type === 'register' && (
            <div className="form__row">
              <div className="form__group">
                <label className="form__label">Имя *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form__input"
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
                  required
                />
              </div>
            </div>
          )}

          {type === 'register' && (
            <>
              <div className="form__group">
                <label className="form__label">Номер телефона *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form__input"
                  required
                />
              </div>

              <div className="form__group">
                <label className="form__label">E-mail *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form__input"
                  required
                />
              </div>
            </>
          )}

          {type === 'login' && (
            <div className="form__group">
              <label className="form__label">Телефон или E-mail</label>
              <input
                type="text"
                name="phoneOrEmail"
                value={formData.phoneOrEmail}
                onChange={handleChange}
                className="form__input"
                required
              />
            </div>
          )}

          <div className="form__group">
            <label className="form__label">Пароль *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form__input"
              required
            />
          </div>

          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Загрузка...' : type === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div style={authStyles.links}>
          {type === 'login' ? (
            <>
              <Link to="/forgot-password" style={authStyles.link}>
                Забыли пароль?
              </Link>
              <Link to="/register" className="btn btn--secondary">
                У меня нет аккаунта
              </Link>
            </>
          ) : (
            <Link to="/login" className="btn btn--secondary">
              Уже есть аккаунт
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const authStyles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '1.5rem',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#333',
    fontSize: '1.5rem',
  },
  form: {
    marginBottom: '1.5rem',
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    textAlign: 'center',
  },
  link: {
    color: '#8a2be2',
    textDecoration: 'none',
    fontSize: '0.875rem',
    ':hover': {
      textDecoration: 'underline',
    },
  },
};

export default AuthForm;
