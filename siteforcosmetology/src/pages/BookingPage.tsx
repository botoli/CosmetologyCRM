import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setStep, setBookingData, clearBooking, createBooking, getServices } from '../store';
import { FaCheck, FaClock, FaComment, FaTelegram, FaTimes, FaSpinner } from 'react-icons/fa';

const BookingPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { step, currentBooking } = useAppSelector((state) => state.booking);
  const { services, loading: servicesLoading } = useAppSelector((state) => state.services);
  const { user } = useAppSelector((state) => state.auth);
  const { loading: bookingLoading } = useAppSelector((state) => state.booking);

  const [selectedService, setSelectedService] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [comment, setComment] = useState('');
  const [telegramNotification, setTelegramNotification] = useState(false);
  const [filter, setFilter] = useState('all');

  // Загрузка услуг при монтировании компонента
  useEffect(() => {
    dispatch(getServices());
  }, [dispatch]);

  // Свободные дни
  const AVAILABLE_DAYS = [
    { date: '27.10.2025', day: 'Пн', available: true },
    { date: '28.10.2025', day: 'Вт', available: true },
    { date: '29.10.2025', day: 'Ср', available: true },
    { date: '30.10.2025', day: 'Чт', available: true },
    { date: '31.10.2025', day: 'Пт', available: true },
    { date: '01.11.2025', day: 'Сб', available: true },
    { date: '02.11.2025', day: 'Вс', available: true },
  ];

  const TIME_SLOTS = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
  ];

  // Группировка услуг по категориям
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, typeof services>);

  const categories = Object.keys(servicesByCategory);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      dispatch(
        setBookingData({
          serviceId: service.id.toString(),
          serviceName: service.name,
          price: service.price,
          duration: service.duration,
        }),
      );
    }
  };

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    dispatch(setBookingData({ date: day }));
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    dispatch(setBookingData({ time }));
  };

  const handleNext = () => {
    if (step === 1 && selectedService) dispatch(setStep(2));
    else if (step === 2 && selectedDay && selectedTime) dispatch(setStep(3));
  };

  const handleBack = () => {
    if (step === 2) dispatch(setStep(1));
    else if (step === 3) dispatch(setStep(2));
  };

  const handleConfirm = async () => {
    try {
      dispatch(setBookingData({ comment, telegramNotification }));

      const bookingData = {
        serviceId: currentBooking.serviceId!,
        date: currentBooking.date!,
        time: currentBooking.time!,
        comment,
        telegramNotification,
      };

      await dispatch(createBooking(bookingData)).unwrap();

      alert('Запись успешно оформлена!');
      dispatch(clearBooking());
      navigate('/client');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка при создании записи');
    }
  };

  if (servicesLoading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <FaSpinner size={32} className="loading-spinner" />
        <p style={{ marginTop: '1rem' }}>Загрузка услуг...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '2rem' }}>Оформление записи</h2>

      <div className="steps">
        <div className="step">
          <div className={`step-number ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
            {step > 1 ? '✓' : '1'}
          </div>
          <div className="step-title">Услуга</div>
        </div>
        <div className="step">
          <div className={`step-number ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
            {step > 2 ? '✓' : '2'}
          </div>
          <div className="step-title">Дата и время</div>
        </div>
        <div className="step">
          <div className={`step-number ${step === 3 ? 'active' : ''}`}>3</div>
          <div className="step-title">Подтверждение</div>
        </div>
      </div>

      {step === 1 && (
        <div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '1.125rem' }}>Фильтр по категории</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Все услуги</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="service-cards">
            {services
              .filter((s) => filter === 'all' || s.category === filter)
              .map((service) => (
                <div
                  key={service.id}
                  className={`service-card ${
                    selectedService === service.id.toString() ? 'active' : ''
                  }`}
                  onClick={() => handleServiceSelect(service.id.toString())}>
                  <h4>{service.name}</h4>
                  <p className="duration">{service.category}</p>
                  <div className="price">{service.price} ₽</div>
                  <p className="duration">{service.duration} минут</p>
                  {service.description && (
                    <p className="service-description">{service.description}</p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="form-group">
            <label>
              <FaClock /> Выберите день *
            </label>
            <div className="day-slots">
              {AVAILABLE_DAYS.map((day) => (
                <div
                  key={day.date}
                  className={`day-slot ${selectedDay === day.date ? 'active' : ''}`}
                  onClick={() => handleDaySelect(day.date)}>
                  <div className="date">{day.date}</div>
                  <div className="day-name">{day.day}</div>
                </div>
              ))}
            </div>
          </div>

          {selectedDay && (
            <div className="form-group" style={{ marginTop: '2rem' }}>
              <label>
                <FaClock /> Выберите время *
              </label>
              <div className="time-slots">
                {TIME_SLOTS.map((slot) => (
                  <div
                    key={slot}
                    className={`time-slot ${selectedTime === slot ? 'active' : ''}`}
                    onClick={() => handleTimeSelect(slot)}>
                    {slot}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>Подтверждение записи</h3>
          <div
            style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              padding: '2rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              border: '1px solid #dbeafe',
            }}>
            <p style={{ marginBottom: '1rem' }}>
              <strong>Процедура:</strong> {currentBooking.serviceName}
            </p>
            <p style={{ marginBottom: '1rem' }}>
              <strong>Дата:</strong> {currentBooking.date}
            </p>
            <p style={{ marginBottom: '1rem' }}>
              <strong>Время:</strong> {currentBooking.time}
            </p>
            <p
              style={{
                marginTop: '1.5rem',
                marginBottom: '0.5rem',
                color: '#7b9acc',
                fontWeight: 700,
                fontSize: '1.5rem',
              }}>
              Стоимость: {currentBooking.price} ₽
            </p>
            <p style={{ opacity: 0.8 }}>Длительность: {currentBooking.duration} минут</p>
          </div>

          <div className="form-group">
            <label>
              <FaComment /> Комментарий для косметолога (необязательно)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ваши пожелания или особенности..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                fontSize: '1.125rem',
              }}>
              <input
                type="checkbox"
                checked={telegramNotification}
                onChange={(e) => setTelegramNotification(e.target.checked)}
                style={{ width: '24px', height: '24px', cursor: 'pointer' }}
              />
              <FaTelegram /> Напомнить мне в Telegram
            </label>
            {!user?.telegramConnected && (
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginTop: '0.75rem',
                  padding: '1rem',
                  background: '#fff3cd',
                  borderRadius: '8px',
                }}>
                Для получения напоминаний привяжите Telegram в настройках
              </p>
            )}
          </div>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '2rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
        <button
          className="btn btn-secondary"
          onClick={handleBack}
          disabled={step === 1}
          style={{ minWidth: '150px' }}>
          <FaTimes /> Назад
        </button>
        {step === 3 ? (
          <button
            className="btn btn-success"
            onClick={handleConfirm}
            disabled={bookingLoading}
            style={{ flex: 2, fontSize: '1.0625rem', minWidth: '200px' }}>
            {bookingLoading ? <FaSpinner className="loading-spinner" /> : <FaCheck />}
            {bookingLoading ? 'Создание...' : 'Подтвердить запись'}
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={
              (step === 1 && !selectedService) || (step === 2 && (!selectedDay || !selectedTime))
            }
            style={{ flex: 2, minWidth: '200px' }}>
            Далее
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
