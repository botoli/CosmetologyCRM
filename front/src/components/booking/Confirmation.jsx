import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

const Confirmation = ({ data, updateData, nextStep, prevStep }) => {
  const { user } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      await apiService.createBooking({
        serviceId: data.service.id,
        date: data.date,
        time: data.time,
        comment: data.comment,
        telegramNotification: data.telegramNotification,
      });

      nextStep();
    } catch (error) {
      setError('Ошибка при создании записи: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const totalPrice = data.service ? data.service.price : 0;

  return (
    <div className="container fade-in">
      <div className="confirmation-header">
        <h1 className="confirmation-title">✅ Подтверждение записи</h1>
        <p className="confirmation-subtitle">Проверьте детали и подтвердите запись</p>
      </div>

      <div className="grid grid--2 gap-lg">
        <div className="card">
          <h3 className="section-title">📋 Детали записи</h3>

          {error && <div className="error--message">{error}</div>}

          <div className="booking-summary">
            <div className="summary-item">
              <span className="summary-label">Услуга:</span>
              <span className="summary-value">{data.service?.name}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Дата:</span>
              <span className="summary-value">{formatDate(data.date)}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Время:</span>
              <span className="summary-value">{data.time}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Длительность:</span>
              <span className="summary-value">{data.service?.duration} минут</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Стоимость:</span>
              <span className="summary-price">{totalPrice} ₽</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">⚙️ Дополнительно</h3>

          <div className="additional-options">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={data.telegramNotification}
                onChange={(e) =>
                  updateData({
                    telegramNotification: e.target.checked,
                  })
                }
                disabled={!user.telegramConnected}
                className="checkbox__input"
              />
              <span className="checkbox__label">📱 Напомнить в Telegram</span>
            </label>

            {!user.telegramConnected && (
              <div className="telegram-hint">
                <p>💡 Для получения напоминаний привяжите Telegram в личном кабинете</p>
              </div>
            )}

            <div className="form__group">
              <label className="form__label">💬 Комментарий для косметолога</label>
              <textarea
                value={data.comment}
                onChange={(e) => updateData({ comment: e.target.value })}
                placeholder="Особые пожелания, аллергии, медицинские показания..."
                className="form__textarea"
                rows="4"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="navigation-buttons">
        <button onClick={prevStep} className="btn btn--secondary btn--small">
          ← Назад
        </button>
        <button
          onClick={handleSubmit}
          className="btn btn--primary confirm-button"
          disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="loading__spinner"></div>
              Создаем запись...
            </>
          ) : (
            '🎉 Подтвердить запись'
          )}
        </button>
      </div>
    </div>
  );
};

export default Confirmation;
