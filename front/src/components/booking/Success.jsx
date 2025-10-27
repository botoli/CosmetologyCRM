import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const Success = ({ data, onNewBooking }) => {
  const { user } = useContext(AuthContext);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const addToCalendar = () => {
    const event = {
      title: `Косметология: ${data.service.name}`,
      description: data.service.description,
      location: 'Косметологический кабинет',
      startTime: `${data.date}T${data.time}:00`,
      endTime: `${data.date}T${addMinutes(data.time, data.service.duration)}:00`,
    };

    // Для демонстрации - в реальном приложении здесь будет интеграция с календарем
    console.log('Add to calendar:', event);
    alert('Функция добавления в календарь будет реализована позже!');
  };

  const addMinutes = (time, minutes) => {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes);
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className="container">
      <div className="card card--elevated text-center success-card">
        <div className="success-icon">🎉</div>

        <h1 className="success-title">Запись подтверждена!</h1>
        <p className="success-subtitle">Ждем вас в нашем кабинете</p>

        <div className="booking-details">
          <h3 className="details-title">Детали записи</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Услуга:</span>
              <span className="detail-value">{data.service.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Дата:</span>
              <span className="detail-value">{formatDate(data.date)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Время:</span>
              <span className="detail-value">{data.time}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Стоимость:</span>
              <span className="detail-price">{data.service.price} ₽</span>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <button onClick={addToCalendar} className="btn btn--secondary calendar-button">
            📅 Добавить в календарь
          </button>

          {!user.telegramConnected && (
            <div className="telegram-promo">
              <div className="telegram-icon">🔔</div>
              <div>
                <h4 className="telegram-title">Не пропустите визит!</h4>
                <p className="telegram-text">Привяжите Telegram для получения напоминаний</p>
                <Link to="/profile" className="btn btn--primary btn--small">
                  Привязать Telegram
                </Link>
              </div>
            </div>
          )}

          <div className="primary-actions">
            <button onClick={onNewBooking} className="btn btn--primary new-booking-button">
              ✨ Записаться снова
            </button>
            <Link to="/" className="btn btn--ghost btn--small">
              🏠 На главную
            </Link>
          </div>
        </div>

        <div className="success-tips">
          <h4 className="tips-title">Полезные советы:</h4>
          <div className="tips-list">
            <div className="tip-item">
              <span className="tip-icon">📝</span>
              Приходите за 10-15 минут до записи
            </div>
            <div className="tip-item">
              <span className="tip-icon">💧</span>
              Пейте достаточно воды перед процедурой
            </div>
            <div className="tip-item">
              <span className="tip-icon">📞</span>
              Сообщите об изменениях за 24 часа
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
