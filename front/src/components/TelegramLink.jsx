// components/TelegramLink.jsx - ОБНОВЛЕННЫЙ КОМПОНЕНТ TELEGRAM
import React, { useState, useEffect } from 'react';
import '../styles/TelegramLink.scss';

const TelegramLink = ({ user, onLink, onUnlink, onCheckLink }) => {
  const [linkCode, setLinkCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (user?.telegramConnected) {
      setLinkCode('');
      setError('');
      setSuccess('');
    }
  }, [user?.telegramConnected]);

  const generateLinkCode = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await onLink();
      setLinkCode(result.linkCode);
      setSuccess('Код создан! Отправьте его боту в Telegram.');
      setShowInstructions(true);

      // Начинаем проверку статуса привязки
      startLinkChecking(result.linkCode);
    } catch (err) {
      setError('Ошибка при создании кода. Попробуйте снова.');
      console.error('Error generating link code:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startLinkChecking = async (code) => {
    setIsChecking(true);

    const checkInterval = setInterval(async () => {
      try {
        const status = await onCheckLink(code);

        if (status.linked) {
          clearInterval(checkInterval);
          setIsChecking(false);
          setSuccess('✅ Telegram успешно привязан!');
          setLinkCode('');
          setShowInstructions(false);
        }
      } catch (err) {
        console.error('Error checking link status:', err);
      }
    }, 3000);

    // Останавливаем проверку через 10 минут
    setTimeout(() => {
      clearInterval(checkInterval);
      setIsChecking(false);
      if (linkCode) {
        setError('Время действия кода истекло. Создайте новый код.');
        setLinkCode('');
        setShowInstructions(false);
      }
    }, 10 * 60 * 1000);
  };

  const handleUnlink = async () => {
    if (
      !window.confirm(
        'Вы уверены, что хотите отвязать Telegram? Вы перестанете получать уведомления о записях.',
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await onUnlink();
      setSuccess('Telegram успешно отвязан');
    } catch (err) {
      setError('Ошибка при отвязке Telegram');
      console.error('Error unlinking telegram:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(linkCode)
      .then(() => {
        setSuccess('Код скопирован в буфер обмена!');
        setTimeout(() => {
          if (success.includes('Код создан')) {
            setSuccess('Код создан! Отправьте его боту в Telegram.');
          }
        }, 2000);
      })
      .catch(() => {
        setError('Не удалось скопировать код');
      });
  };

  const openTelegram = () => {
    window.open('https://t.me/StarCosmetologybot', '_blank', 'noopener,noreferrer');
  };

  if (user?.telegramConnected) {
    return (
      <div className="telegram-linked">
        <div className="telegram-status success">
          <div className="status-header">
            <div className="status-icon">✅</div>
            <div className="status-info">
              <h3>Telegram привязан</h3>
              <p>Ваш аккаунт успешно подключен к боту</p>
            </div>
          </div>

          <div className="status-details">
            <div className="detail-item">
              <span className="detail-label">ID чата:</span>
              <span className="detail-value">{user.telegramId}</span>
            </div>
            {user.telegramUsername && (
              <div className="detail-item">
                <span className="detail-label">Username:</span>
                <span className="detail-value">@{user.telegramUsername}</span>
              </div>
            )}
          </div>

          <div className="benefits-list">
            <h4>Что вы получаете:</h4>
            <ul>
              <li>
                <span className="benefit-icon">✅</span>
                <span>Мгновенные уведомления о новых записях</span>
              </li>
              <li>
                <span className="benefit-icon">✅</span>
                <span>Напоминания за 24 часа до визита</span>
              </li>
              <li>
                <span className="benefit-icon">✅</span>
                <span>Уведомления об изменениях в расписании</span>
              </li>
              <li>
                <span className="benefit-icon">✅</span>
                <span>Специальные предложения и акции</span>
              </li>
            </ul>
          </div>

          <div className="status-actions">
            <button onClick={openTelegram} className="btn btn-secondary">
              💬 Открыть Telegram
            </button>
            <button onClick={handleUnlink} disabled={isLoading} className="btn btn-danger">
              {isLoading ? 'Отвязываем...' : '❌ Отвязать Telegram'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="telegram-link">
      <div className="telegram-info-card">
        <div className="card-header">
          <div className="header-icon">📱</div>
          <div className="header-content">
            <h3>Привязка Telegram</h3>
            <p>Подключите Telegram для умных уведомлений</p>
          </div>
        </div>

        <div className="card-features">
          <div className="feature">
            <span className="feature-icon">🔔</span>
            <span className="feature-text">Напоминания о записях</span>
          </div>
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <span className="feature-text">Мгновенные уведомления</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🎯</span>
            <span className="feature-text">Специальные предложения</span>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            {success}
          </div>
        )}

        {!linkCode ? (
          <div className="link-initiation">
            <button
              onClick={generateLinkCode}
              disabled={isLoading}
              className="btn btn-primary btn-large generate-btn">
              {isLoading ? (
                <>
                  <div className="btn-spinner"></div>
                  Генерируем код...
                </>
              ) : (
                <>
                  <span className="btn-icon">🔗</span>
                  Сгенерировать код привязки
                </>
              )}
            </button>

            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="instructions-toggle">
              {showInstructions ? 'Скрыть инструкцию' : 'Как это работает?'}
            </button>
          </div>
        ) : (
          <div className="link-process">
            <div className="code-section">
              <h4>Ваш код привязки:</h4>
              <div className="code-display" onClick={copyToClipboard}>
                <span className="code-value">{linkCode}</span>
                <span className="copy-hint">(кликните для копирования)</span>
              </div>
              <button onClick={copyToClipboard} className="btn btn-secondary btn-small copy-btn">
                📋 Скопировать код
              </button>
            </div>

            <div className="instructions-section">
              <h4>Как привязать:</h4>
              <ol className="instructions-list">
                <li>
                  <span className="step-number">1</span>
                  <span className="step-text">Откройте нашего бота в Telegram</span>
                  <button onClick={openTelegram} className="btn btn-secondary btn-small">
                    @StarCosmetologybot
                  </button>
                </li>
                <li>
                  <span className="step-number">2</span>
                  <span className="step-text">Отправьте ему этот код:</span>
                  <code className="code-example">{linkCode}</code>
                </li>
                <li>
                  <span className="step-number">3</span>
                  <span className="step-text">Бот автоматически привяжется к вашему аккаунту</span>
                </li>
              </ol>
            </div>

            {isChecking && (
              <div className="checking-status">
                <div className="checking-spinner"></div>
                <p>Ожидаем подтверждения от бота...</p>
                <small>Обычно это занимает несколько секунд</small>
              </div>
            )}

            <div className="process-actions">
              <button onClick={generateLinkCode} disabled={isLoading} className="btn btn-secondary">
                🔄 Сгенерировать новый код
              </button>
              <button
                onClick={() => {
                  setLinkCode('');
                  setShowInstructions(false);
                }}
                className="btn btn-danger">
                ❌ Отмена
              </button>
            </div>
          </div>
        )}

        {showInstructions && !linkCode && (
          <div className="pre-instructions">
            <h4>Процесс привязки:</h4>
            <div className="instruction-steps">
              <div className="instruction-step">
                <div className="step-icon">1</div>
                <div className="step-content">
                  <strong>Сгенерируйте код</strong>
                  <p>Нажмите кнопку выше для создания уникального кода</p>
                </div>
              </div>
              <div className="instruction-step">
                <div className="step-icon">2</div>
                <div className="step-content">
                  <strong>Отправьте боту</strong>
                  <p>Найдите нашего бота @StarCosmetologybot и отправьте ему код</p>
                </div>
              </div>
              <div className="instruction-step">
                <div className="step-icon">3</div>
                <div className="step-content">
                  <strong>Готово!</strong>
                  <p>Бот автоматически привяжется к вашему аккаунту</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TelegramLink;
