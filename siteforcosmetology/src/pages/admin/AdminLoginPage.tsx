import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/redux';
import { loginAdmin } from '../store';
import { adminLoginSchema } from '../validation/authSchemas';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserShield } from 'react-icons/fa';

interface AdminLoginForm {
  email: string;
  password: string;
}

const AdminLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginForm>({
    resolver: yupResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginForm) => {
    try {
      setServerError('');
      await dispatch(loginAdmin(data)).unwrap();
      navigate('/admin');
    } catch (error: any) {
      setServerError(
        error.response?.data?.error || 'Ошибка при входе. Проверьте данные и попробуйте снова.',
      );
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <FaUserShield size={48} color="#7b9acc" style={{ marginBottom: '1rem' }} />
        <h2>Вход для администратора</h2>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Доступ только для авторизованного персонала
        </p>
      </div>

      {serverError && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>
            <FaEnvelope /> Email администратора *
          </label>
          <input
            type="email"
            {...register('email')}
            className={errors.email ? 'error' : ''}
            placeholder="admin@example.com"
          />
          {errors.email && <div className="error">{errors.email.message}</div>}
        </div>

        <div className="form-group">
          <label>
            <FaLock /> Пароль *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className={errors.password ? 'error' : ''}
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
          {errors.password && <div className="error">{errors.password.message}</div>}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1rem' }}
          disabled={isSubmitting}>
          {isSubmitting ? 'Вход...' : 'Войти как администратор'}
        </button>
      </form>

      <div
        style={{
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)',
        }}>
        <button
          className="btn btn-secondary"
          style={{ width: '100%' }}
          onClick={() => navigate('/login')}>
          Обычный вход
        </button>
      </div>
    </div>
  );
};

export default AdminLoginPage;
