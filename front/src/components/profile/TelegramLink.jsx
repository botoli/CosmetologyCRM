import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

const TelegramLink = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [linkCode, setLinkCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const generateLink = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const result = await apiService.createTelegramLink();
      setLinkCode(result.linkCode);
      setMessage('Код создан! Отправьте его боту в Telegram.');
    } catch (error) {
      setMessage('Ошибка при создании кода: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkLinkStatus = async () => {
    if (!linkCode) return;

    setIsChecking(true);
    try {
      const result = await apiService.checkTelegramLink(linkCode);
      if (result.linked) {
        setMessage('✅ Telegram успешно привязан!');
        setLinkCode('');

        // Обновляем состояние пользователя вместо перезагрузки
        updateUser({
          telegramConnected: true,
          telegramId: result.telegramId,
          telegramUsername: result.telegramUsername,
        });

        // Очищаем сообщение через 3 секунды
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error checking link:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    let interval;
    if (linkCode && !isChecking) {
      interval = setInterval(checkLinkStatus, 3000);
    }
    return () => clearInterval(interval);
  }, [linkCode, isChecking]);

  const unlinkTelegram = async () => {
    try {
      await apiService.unlinkTelegram();
      setMessage('✅ Telegram отвязан');

      // Обновляем состояние пользователя
      updateUser({
        telegramConnected: false,
        telegramId: null,
        telegramUsername: null,
      });

      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage('Ошибка при отвязке: ' + error.message);
    }
  };

  if (user.telegramConnected) {
    return (
      <div className="telegram-connected">
        <div className="status-header">
          <div className="status-icon">✅</div>
          <div>
            <h3 className="status-title">Telegram привязан</h3>
            <p className="status-text">Уведомления будут приходить в Telegram</p>
          </div>
        </div>

        <div className="telegram-info">
          <div className="info-item">
            <span className="info-label">ID:</span>
            <span className="info-value">{user.telegramId}</span>
          </div>
          {user.telegramUsername && (
            <div className="info-item">
              <span className="info-label">Username:</span>
              <span className="info-value">@{user.telegramUsername}</span>
            </div>
          )}
        </div>

        <button onClick={unlinkTelegram} className="btn btn--secondary btn--small unlink-button">
          🔗 Отвязать Telegram
        </button>

        {message && <div className="telegram-message success">{message}</div>}
      </div>
    );
  }

  return (
    <div className="telegram-container">
      <div className="telegram-header">
        <div className="telegram-icon">🔔</div>
        <div>
          <h3 className="telegram-title">Уведомления в Telegram</h3>
          <p className="telegram-description">
            Получайте напоминания о записях и специальные предложения
          </p>
        </div>
      </div>

      {message && (
        <div className={`telegram-message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {linkCode ? (
        <div className="link-code-container">
          <div className="code-header">
            <h4 className="code-title">Отправьте код боту</h4>
            <div className="code-display">{linkCode}</div>
          </div>

          <div className="instructions">
            <div className="instruction-step">
              <span className="step-number">1</span>
              <div>
                <strong>Перейдите в бота</strong>
                <p className="step-description">
                  Нажмите на ссылку:{' '}
                  <a
                    href="https://t.me/your_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="telegram-link">
                    @CosmetologyBot
                  </a>
                </p>
              </div>
            </div>

            <div className="instruction-step">
              <span className="step-number">2</span>
              <div>
                <strong>Отправьте код</strong>
                <p className="step-description">
                  Скопируйте и отправьте код: <strong>{linkCode}</strong>
                </p>
              </div>
            </div>

            <div className="instruction-step">
              <span className="step-number">3</span>
              <div>
                <strong>Ожидайте подтверждения</strong>
                <p className="step-description">Статус обновится автоматически</p>
              </div>
            </div>
          </div>

          {isChecking && (
            <div className="checking-status">
              <div className="loading__spinner"></div>
              Проверяем статус...
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={generateLink}
          disabled={isLoading}
          className="btn btn--primary link-button">
          {isLoading ? (
            <>
              <div className="loading__spinner"></div>
              Создаем код...
            </>
          ) : (
            '🔗 Привязать Telegram'
          )}
        </button>
      )}
    </div>
  );
};

export default TelegramLink;
