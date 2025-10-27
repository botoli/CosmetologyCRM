import React, { useState } from 'react';
import Calendar from '../common/Calendar';

const DateTimeSelection = ({ data, updateData, nextStep, prevStep }) => {
  const [selectedDate, setSelectedDate] = useState(data.date);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateTimeSlots = (date) => {
    setLoading(true);

    // Имитация загрузки слотов
    setTimeout(() => {
      const slots = [];
      const startHour = 9;
      const endHour = 18;

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute
            .toString()
            .padStart(2, '0')}`;
          // 80% слотов доступны для демонстрации
          const available = Math.random() > 0.2;
          slots.push({
            time: timeString,
            available,
          });
        }
      }
      setTimeSlots(slots);
      setLoading(false);
    }, 500);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    generateTimeSlots(date);
  };

  const handleTimeSelect = (time) => {
    updateData({
      date: selectedDate,
      time: time,
    });
    nextStep();
  };

  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container fade-in">
      <div className="datetime-header">
        <h1 className="datetime-title">📅 Выберите дату и время</h1>
        <p className="datetime-subtitle">Запланируйте ваш визит</p>
      </div>

      <div className="grid grid--2 gap-lg">
        <div className="card">
          <h3 className="section-title">🗓️ Дата</h3>
          <Calendar selectedDate={selectedDate} onDateSelect={handleDateSelect} />
        </div>

        <div className="card">
          <h3 className="section-title">⏰ Время</h3>
          {selectedDate ? (
            <>
              <div className="selected-date">
                Выбрана дата: <strong>{formatDisplayDate(selectedDate)}</strong>
              </div>

              {loading ? (
                <div className="timeslots-loading">
                  <div className="loading__spinner"></div>
                  <p>Загружаем доступное время...</p>
                </div>
              ) : (
                <div className="timeslots-grid">
                  {timeSlots.map((slot, index) => (
                    <button
                      key={index}
                      className={`timeslot ${!slot.available ? 'unavailable' : ''} ${
                        data.time === slot.time ? 'selected' : ''
                      }`}
                      onClick={() => slot.available && handleTimeSelect(slot.time)}
                      disabled={!slot.available}>
                      {slot.time}
                      {!slot.available && ' ❌'}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="no-date">
              <div className="no-date-icon">📅</div>
              <p className="no-date-text">Выберите дату для просмотра доступного времени</p>
            </div>
          )}
        </div>
      </div>

      <div className="navigation-buttons">
        <button onClick={prevStep} className="btn btn--secondary btn--small">
          ← Назад к услугам
        </button>
      </div>
    </div>
  );
};

export default DateTimeSelection;
