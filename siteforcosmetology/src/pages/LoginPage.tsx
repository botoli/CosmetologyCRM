import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppDispatch } from '../hooks/redux';
import { loginUser, registerUser } from '../store';
import { loginSchema, registerSchema } from '../validation/authSchemas';
import { FaUser, FaLock, FaPhone, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';

interface LoginForm {
  phoneOrEmail: string;
  password: string;
}

interface RegisterForm {
  name: string;
  surname: string;
  phone: string;
  email: string;
  password: string;
}

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: loginSubmitting },
  } = useForm<LoginForm>({
    resolver: yupResolver(loginSchema),
  });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors, isSubmitting: registerSubmitting },
  } = useForm<RegisterForm>({
    resolver: yupResolver(registerSchema),
  });

  const onLoginSubmit = async (data: LoginForm) => {
    try {
      setServerError('');
      const result = await dispatch(loginUser(data)).unwrap();
      navigate(result.user.role === 'admin' ? '/admin' : '/client');
    } catch (error: any) {
      setServerError(error.response?.data?.error || 'Ошибка при входе');
    }
  };

  const onRegisterSubmit = async (data: RegisterForm) => {
    try {
      setServerError('');
      await dispatch(registerUser(data)).unwrap();
      navigate('/client');
    } catch (error: any) {
      setServerError(error.response?.data?.error || 'Ошибка при регистрации');
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.startsWith('8')) {
      return numbers.replace(/^8(\d{3})(\d{3})(\d{2})(\d{2})/, '+7 ($1) $2-$3-$4');
    }
    return numbers.replace(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5');
  };

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>
        {isLogin ? 'Вход в систему' : 'Регистрация'}
      </h2>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        <button
          className={`btn ${isLogin ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1 }}
          onClick={() => setIsLogin(true)}>
          Вход
        </button>
        <button
          className={`btn ${!isLogin ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1 }}
          onClick={() => setIsLogin(false)}>
          Регистрация
        </button>
      </div>

      {serverError && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          {serverError}
        </div>
      )}

      {isLogin ? (
        <form onSubmit={handleLoginSubmit(onLoginSubmit)}>
          <div className="form-group">
            <label>
              <FaUser /> Телефон или Email *
            </label>
            <input
              type="text"
              {...loginRegister('phoneOrEmail')}
              className={loginErrors.phoneOrEmail ? 'error' : ''}
              placeholder="Введите телефон или email"
            />
            {loginErrors.phoneOrEmail && (
              <div className="error">{loginErrors.phoneOrEmail.message}</div>
            )}
          </div>

          <div className="form-group">
            <label>
              <FaLock /> Пароль *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                {...loginRegister('password')}
                className={loginErrors.password ? 'error' : ''}
                placeholder="Введите пароль"
              />
              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                }}
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {loginErrors.password && <div className="error">{loginErrors.password.message}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loginSubmitting}>
            {loginSubmitting ? 'Вход...' : 'Войти'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit(onRegisterSubmit)}>
          <div className="form-group">
            <label>Имя *</label>
            <input
              type="text"
              {...registerRegister('name')}
              className={registerErrors.name ? 'error' : ''}
              placeholder="Введите имя"
            />
            {registerErrors.name && <div className="error">{registerErrors.name.message}</div>}
          </div>

          <div className="form-group">
            <label>Фамилия *</label>
            <input
              type="text"
              {...registerRegister('surname')}
              className={registerErrors.surname ? 'error' : ''}
              placeholder="Введите фамилию"
            />
            {registerErrors.surname && (
              <div className="error">{registerErrors.surname.message}</div>
            )}
          </div>

          <div className="form-group">
            <label>
              <FaPhone /> Телефон *
            </label>
            <input
              type="tel"
              {...registerRegister('phone')}
              className={registerErrors.phone ? 'error' : ''}
              placeholder="+7 (999) 999-99-99"
              onChange={(e) => {
                e.target.value = formatPhone(e.target.value);
              }}
            />
            {registerErrors.phone && <div className="error">{registerErrors.phone.message}</div>}
          </div>

          <div className="form-group">
            <label>
              <FaEnvelope /> Email *
            </label>
            <input
              type="email"
              {...registerRegister('email')}
              className={registerErrors.email ? 'error' : ''}
              placeholder="Введите email"
            />
            {registerErrors.email && <div className="error">{registerErrors.email.message}</div>}
          </div>

          <div className="form-group">
            <label>
              <FaLock /> Пароль *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                {...registerRegister('password')}
                className={registerErrors.password ? 'error' : ''}
                placeholder="Не менее 6 символов"
              />
              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                }}
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {registerErrors.password && (
              <div className="error">{registerErrors.password.message}</div>
            )}
            <div className="form-hint">
              Пароль должен содержать заглавные и строчные буквы, цифры
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={registerSubmitting}>
            {registerSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
      )}

      <div
        style={{
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
        }}>
        <p style={{ marginBottom: '1rem', color: '#666' }}>Вход для администратора</p>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/login')}>
          Войти как администратор
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
