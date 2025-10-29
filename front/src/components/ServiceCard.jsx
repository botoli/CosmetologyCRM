// components/ServiceCard.jsx - ОБНОВЛЕННЫЙ КОМПОНЕНТ УСЛУГИ
import React from 'react';

const ServiceCard = ({ service, onBook, featured = false }) => {
  const handleBookClick = () => {
    if (onBook) {
      onBook(service);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Уход за лицом': '🧴',
      Массаж: '💆‍♀️',
      'Аппаратная косметология': '🔬',
      'Эстетическая косметология': '💫',
      'SPA-процедуры': '🛁',
      default: '💎',
    };

    return icons[category] || icons.default;
  };

  return (
    <div className={`service-card ${featured ? 'featured' : ''}`}>
      {featured && (
        <div className="featured-badge">
          <span className="badge-icon">⭐</span>
          Популярно
        </div>
      )}

      <div className="service-header">
        <div className="service-category">
          <span className="category-icon">{getCategoryIcon(service.category)}</span>
          {service.category}
        </div>
        <h3 className="service-name">{service.name}</h3>
      </div>

      <div className="service-description">{service.description}</div>

      <div className="service-details">
        <div className="service-detail">
          <span className="detail-icon">💰</span>
          <div className="detail-content">
            <span className="detail-label">Стоимость:</span>
            <span className="detail-value">{service.price} ₽</span>
          </div>
        </div>

        <div className="service-detail">
          <span className="detail-icon">⏱</span>
          <div className="detail-content">
            <span className="detail-label">Длительность:</span>
            <span className="detail-value">{service.duration} мин</span>
          </div>
        </div>

        {service.rating && (
          <div className="service-detail">
            <span className="detail-icon">⭐</span>
            <div className="detail-content">
              <span className="detail-label">Рейтинг:</span>
              <span className="detail-value">{service.rating}/5</span>
            </div>
          </div>
        )}
      </div>

      <div className="service-footer">
        <button
          onClick={handleBookClick}
          className={`book-button ${featured ? 'btn-primary' : 'btn-secondary'}`}>
          <span className="button-icon">📅</span>
          Записаться
        </button>

        {service.notes && (
          <div className="service-notes">
            <span className="notes-icon">💡</span>
            {service.notes}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;
