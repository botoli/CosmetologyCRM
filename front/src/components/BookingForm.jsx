// components/BookingForm.jsx - ОБНОВЛЕННЫЙ КОМПОНЕНТ ЗАПИСИ
import React, { useState, useEffect } from 'react';
import '../styles/BookingForm.scss';

const BookingForm = ({ service, onBookingSubmit, onCancel, availableTimes = [], user }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [comment, setComment] = useState('');
  const [telegramNotification, setTelegramNotification] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    // Устанавливаем ближайшую доступную дату
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    generateAvailableDates();
  }, []);

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Пропускаем выходные (суббота и воскресенье)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }

    setAvailableDates(dates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      alert('Пожалуйста, выберите дату и время');
      return;
    }

    setIsSubmitting(true);

    try {
      await onBookingSubmit({
        serviceId: service.id,
        date: selectedDate,
        time: selectedTime,
        comment,
        telegramNotification,
      });

      // Переходим к шагу успеха
      setStep(3);
    } catch (error) {
      console.error('Ошибка при создании записи:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const getTimeSlots = () => {
    // Группируем время по периодам дня
    const periods = {
      morning: { name: '🌅 Утро', slots: [] },
      day: { name: '☀️ День', slots: [] },
      evening: { name: '🌇 Вечер', slots: [] },
    };

    availableTimes.forEach((time) => {
      const hour = parseInt(time.split(':')[0]);
      if (hour < 12) {
        periods.morning.slots.push(time);
      } else if (hour < 17) {
        periods.day.slots.push(time);
      } else {
        periods.evening.slots.push(time);
      }
    });

    return periods;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    setStep(2);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(3);
  };

  const renderStep1 = () => (
    <div className="booking-step">
      <div className="step-header">
        <div className="step-number active">1</div>
        <div className="step-info">
          <h3>Выберите дату</h3>
          <p>Выберите удобный день для записи</p>
        </div>
      </div>

      <div className="date-selection">
        <div className="date-picker">
          <label className="date-picker-label">
            <span className="label-icon">📅</span>
            Или выберите конкретную дату:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateSelect(e.target.value)}
            min={getMinDate()}
            className="date-input"
          />
        </div>

        <div className="quick-dates">
          <label className="quick-dates-label">Ближайшие доступные даты:</label>
          <div className="quick-dates-grid">
            {availableDates.slice(0, 5).map((date) => (
              <button
                key={date}
                type="button"
                className={`quick-date-btn ${selectedDate === date ? 'selected' : ''}`}
                onClick={() => handleDateSelect(date)}>
                <div className="date-day">{new Date(date).getDate()}</div>
                <div className="date-month">
                  {new Date(date).toLocaleDateString('ru-RU', { month: 'short' })}
                </div>
                <div className="date-weekday">
                  {new Date(date).toLocaleDateString('ru-RU', { weekday: 'short' })}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Отмена
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setStep(2)}
          disabled={!selectedDate}>
          Далее → Выбор времени
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const timePeriods = getTimeSlots();

    return (
      <div className="booking-step">
        <div className="step-header">
          <div className="step-number completed">1</div>
          <div className="step-connector"></div>
          <div className="step-number active">2</div>
          <div className="step-info">
            <h3>Выберите время</h3>
            <p>Доступное время на {formatDate(selectedDate)}</p>
          </div>
        </div>

        <div className="time-selection">
          {Object.entries(timePeriods).map(
            ([periodKey, period]) =>
              period.slots.length > 0 && (
                <div key={periodKey} className="time-period">
                  <h4 className="period-title">{period.name}</h4>
                  <div className="time-slots-grid">
                    {period.slots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                        onClick={() => handleTimeSelect(time)}>
                        {formatTime(time)}
                      </button>
                    ))}
                  </div>
                </div>
              ),
          )}

          {availableTimes.length === 0 && (
            <div className="no-slots-message">
              <div className="no-slots-icon">😔</div>
              <h4>Нет доступного времени</h4>
              <p>На выбранную дату нет свободных окон для записи</p>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                ← Выбрать другую дату
              </button>
            </div>
          )}
        </div>

        <div className="step-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
            ← Назад к датам
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setStep(3)}
            disabled={!selectedTime}>
            Далее → Детали записи
          </button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="booking-step">
      <div className="step-header">
        <div className="step-number completed">1</div>
        <div className="step-connector"></div>
        <div className="step-number completed">2</div>
        <div className="step-connector"></div>
        <div className="step-number active">3</div>
        <div className="step-info">
          <h3>Подтверждение записи</h3>
          <p>Проверьте детали и подтвердите запись</p>
        </div>
      </div>

      <div className="booking-summary">
        <div className="summary-card">
          <h4>Детали услуги</h4>
          <div className="summary-item">
            <span className="summary-label">Услуга:</span>
            <span className="summary-value">{service.name}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Стоимость:</span>
            <span className="summary-value">{service.price} ₽</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Длительность:</span>
            <span className="summary-value">{service.duration} минут</span>
          </div>
        </div>

        <div className="summary-card">
          <h4>Дата и время</h4>
          <div className="summary-item">
            <span className="summary-label">Дата:</span>
            <span className="summary-value">{formatDate(selectedDate)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Время:</span>
            <span className="summary-value">{selectedTime}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-details">
          <div className="form-group">
            <label htmlFor="booking-comment">
              <span className="label-icon">💬</span>
              Комментарий (необязательно)
            </label>
            <textarea
              id="booking-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Например: особенности кожи, пожелания к процедуре, аллергии..."
              rows="3"
            />
            <div className="input-hint">Максимум 500 символов</div>
          </div>

          {user?.telegramConnected && (
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={telegramNotification}
                  onChange={(e) => setTelegramNotification(e.target.checked)}
                />
                <span className="checkmark"></span>
                <div className="checkbox-content">
                  <span className="checkbox-title">📱 Получить уведомление в Telegram</span>
                  <span className="checkbox-description">
                    Мы напомним о визите за 24 часа и пришлем подтверждение
                  </span>
                </div>
              </label>
            </div>
          )}

          {!user?.telegramConnected && (
            <div className="telegram-promo">
              <div className="promo-icon">💡</div>
              <div className="promo-content">
                <strong>Привяжите Telegram</strong> для получения напоминаний о записях и
                специальных предложений
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="step-actions">
        <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
          ← Назад ко времени
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isSubmitting || availableTimes.length === 0 || !selectedTime}>
          {isSubmitting ? (
            <>
              <div className="btn-spinner"></div>
              Создаем запись...
            </>
          ) : (
            <>
              <span className="btn-icon">✅</span>
              Подтвердить запись
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="booking-step success-step">
      <div className="success-icon">🎉</div>
      <h2>Запись успешно создана!</h2>
      <p>Мы ждем вас в нашем салоне</p>

      <div className="success-details">
        <div className="success-item">
          <span className="item-label">Услуга:</span>
          <span className="item-value">{service.name}</span>
        </div>
        <div className="success-item">
          <span className="item-label">Дата и время:</span>
          <span className="item-value">
            {formatDate(selectedDate)} в {selectedTime}
          </span>
        </div>
        <div className="success-item">
          <span className="item-label">Стоимость:</span>
          <span className="item-value">{service.price} ₽</span>
        </div>
      </div>

      {user?.telegramConnected && telegramNotification && (
        <div className="success-notice">
          <span className="notice-icon">📱</span>
          Напоминание будет отправлено в Telegram за 24 часа до визита
        </div>
      )}

      <div className="success-actions">
        <button type="button" className="btn btn-primary" onClick={onCancel}>
          Отлично!
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
          🖨️ Распечатать
        </button>
      </div>
    </div>
  );

  return (
    <div className="booking-form-overlay">
      <div className="booking-form">
        <div className="booking-header">
          <div className="header-content">
            <h2>{step === 4 ? '✅ Запись подтверждена' : 'Запись на услугу'}</h2>
            <p>{service.name}</p>
          </div>
          <button className="close-button" onClick={onCancel} disabled={isSubmitting}>
            ×
          </button>
        </div>

        <div className="booking-progress">
          <div className="progress-steps">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
              <span className="step-dot"></span>
              <span className="step-label">Дата</span>
            </div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
              <span className="step-dot"></span>
              <span className="step-label">Время</span>
            </div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
              <span className="step-dot"></span>
              <span className="step-label">Подтверждение</span>
            </div>
          </div>
        </div>

        <div className="booking-content">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
