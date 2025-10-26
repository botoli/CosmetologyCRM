import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { updateTelegram } from '../store';
import { FaTelegram, FaCheck, FaSpinner } from 'react-icons/fa';
import api from '../services/api';
import API_ENDPOINTS from '../services/apiEndpoints';

const ClientSettings = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [linkCode, setLinkCode] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [checkingInterval, setCheckingInterval] = useState<NodeJS.Timeout | null>(null);

  const handleTelegramLink = async () => {
    setIsLinking(true);

    try {
      const response = await api.post(API_ENDPOINTS.linkTelegram);
      const { linkCode: newLinkCode } = response.data;
      setLinkCode(newLinkCode);

      alert(`Пожалуйста, напишите боту и отправьте код: ${newLinkCode}`);

      // Опрос для проверки привязки
      const interval = setInterval(async () => {
        try {
          const checkResponse = await api.get(API_ENDPOINTS.checkLink(newLinkCode));
          if (checkResponse.data.linked) {
            clearInterval(interval);
            dispatch(
              updateTelegram({
                telegramId: checkResponse.data.telegramId,
                telegramUsername: checkResponse.data.telegramUsername,
              }),
            );
            setIsLinking(false);
            setLinkCode('');
            alert('Telegram успешно привязан!');
          }
        } catch (error) {
          // Игнорируем ошибки проверки
        }
      }, 3000);

      setCheckingInterval(interval);

      // Таймаут через 10 минут
      setTimeout(() => {
        if (checkingInterval) {
          clearInterval(checkingInterval);
        }
        setIsLinking(false);
        setLinkCode('');
        alert('Время ожидания истекло. Попробуйте снова.');
      }, 600000);
    } catch (error: any) {
      console.error('Telegram link error:', error);
      setIsLinking(false);
      alert(error.response?.data?.error || 'Произошла ошибка. Попробуйте позже.');
    }
  };

  const handleUnlinkTelegram = async () => {
    if (!confirm('Вы уверены, что хотите отвязать Telegram?')) return;

    try {
      await api.post(API_ENDPOINTS.unlinkTelegram);
      dispatch(updateTelegram({ telegramId: undefined, telegramUsername: undefined }));
      alert('Telegram успешно отвязан');
    } catch (error: any) {
      console.error('Unlink error:', error);
      alert(error.response?.data?.error || 'Произошла ошибка при отвязке');
    }
  };

  // Очистка интервала при размонтировании
  useEffect(() => {
    return () => {
      if (checkingInterval) {
        clearInterval(checkingInterval);
      }
    };
  }, [checkingInterval]);

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Настройки аккаунта</h2>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>Личные данные</h3>
        <div className="form-group">
          <label>Имя</label>
          <input type="text" value={user?.name || ''} disabled style={{ background: '#f5f5f5' }} />
        </div>
        <div className="form-group">
          <label>Фамилия</label>
          <input
            type="text"
            value={user?.surname || ''}
            disabled
            style={{ background: '#f5f5f5' }}
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            style={{ background: '#f5f5f5' }}
          />
        </div>
        <div className="form-group">
          <label>Телефон</label>
          <input type="tel" value={user?.phone || ''} disabled style={{ background: '#f5f5f5' }} />
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>Мессенджеры</h3>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem',
            background: user?.telegramConnected ? '#d1fae5' : '#fee2e2',
            borderRadius: '8px',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FaTelegram size={32} color={user?.telegramConnected ? '#10b981' : '#ef4444'} />
            <div>
              <h4>Telegram</h4>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {user?.telegramConnected ? 'Подключен' : 'Не подключен'}
              </p>
            </div>
          </div>
          {user?.telegramConnected ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#10b981' }}>
                  <FaCheck /> {user.telegramUsername || 'Подключено'}
                </span>
                <button className="btn btn-danger" onClick={handleUnlinkTelegram}>
                  Отвязать
                </button>
              </div>
            </>
          ) : (
            <button className="btn btn-primary" onClick={handleTelegramLink} disabled={isLinking}>
              {isLinking ? <FaSpinner className="loading-spinner" /> : 'Привязать Telegram'}
              {isLinking ? ' Привязка...' : ''}
            </button>
          )}
        </div>

        {!user?.telegramConnected && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: '8px',
            }}>
            <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem', fontWeight: 600 }}>
              📱 Как привязать Telegram:
            </p>
            <ol
              style={{
                fontSize: '0.875rem',
                marginTop: '0.5rem',
                paddingLeft: '1.25rem',
                lineHeight: '1.75',
              }}>
              <li>Нажмите кнопку "Привязать Telegram" выше</li>
              <li>Получите код подтверждения</li>
              <li>
                Откройте Telegram и найдите бота{' '}
                <code style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>
                  @your_bot_name
                </code>
              </li>
              <li>Отправьте код боту</li>
              <li>Готово! Привязка произойдет автоматически</li>
            </ol>
            {linkCode && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '2px dashed #7b9acc',
                }}>
                <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Код для привязки:</p>
                <strong style={{ fontSize: '1.5rem', color: '#7b9acc', letterSpacing: '2px' }}>
                  {linkCode}
                </strong>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientSettings;
