import React from 'react';

const Calendar = ({ selectedDate, onDateSelect, availableDates = [] }) => {
  const today = new Date();
  const dates = [];

  // Generate dates for next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }

  const formatDate = (date) => date.toISOString().split('T')[0];

  const formatDisplay = (date) => {
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('ru-RU', { month: 'short' }),
      weekday: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
    };
  };

  const isAvailable = (date) => {
    const day = date.getDay();
    const dateStr = formatDate(date);

    if (availableDates.length > 0) {
      return availableDates.includes(dateStr);
    }

    return day !== 0 && day !== 6;
  };

  const getDateClassName = (date, dateStr) => {
    const baseClass = 'calendar-day';
    if (!isAvailable(date)) {
      return `${baseClass} unavailable`;
    }
    if (selectedDate === dateStr) {
      return `${baseClass} selected`;
    }
    return `${baseClass} available`;
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h3 className="calendar-title">Выберите дату</h3>
        <p className="calendar-subtitle">Доступные даты выделены цветом</p>
      </div>

      <div className="calendar-grid">
        {dates.map((date, index) => {
          const dateStr = formatDate(date);
          const available = isAvailable(date);
          const { day, month, weekday } = formatDisplay(date);

          return (
            <div
              key={index}
              className={getDateClassName(date, dateStr)}
              onClick={() => available && onDateSelect(dateStr)}>
              <span className="date-number">{day}</span>
              <span className="date-month">{month}</span>
              <span className="date-weekday">{weekday}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
