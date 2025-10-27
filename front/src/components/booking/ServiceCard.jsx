import React from 'react';

const ServiceCard = ({ service, selected = false, onSelect, compact = false }) => {
  const handleClick = () => {
    onSelect(service);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Чистка лица': '✨',
      'Массаж лица': '💆',
      'Уход лица': '🧴',
      Пилинг: '🌟',
      default: '💫',
    };
    return icons[category] || icons.default;
  };

  return (
    <div
      className={`card service-card ${selected ? 'selected' : ''} ${
        compact ? 'compact' : ''
      } fade-in`}
      onClick={handleClick}>
      <div className="service-card-header">
        <span className="service-card-icon">{getCategoryIcon(service.category)}</span>
        <div>
          <h3 className="service-card-name">{service.name}</h3>
          <span className="service-card-category">{service.category}</span>
        </div>
      </div>

      {!compact && service.description && (
        <p className="service-card-description">{service.description}</p>
      )}

      <div className="service-card-footer">
        <div className="service-card-duration">⏱️ {service.duration} мин</div>
        <div className="service-card-price">{service.price} ₽</div>
      </div>

      {selected && <div className="service-card-badge">✅ Выбрано</div>}
    </div>
  );
};

export default ServiceCard;
