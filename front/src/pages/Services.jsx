// pages/Services.jsx - ОБНОВЛЕННАЯ СТРАНИЦА УСЛУГ
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import BookingForm from '../components/BookingForm';
import { api } from '../utils/api';
import '../styles/Services.scss';

const Services = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  // Редирект если не авторизован
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // Обработка переноса записи
  useEffect(() => {
    if (location.state?.rescheduleBookingId) {
      // Здесь можно загрузить данные о записи для переноса
      console.log('Перенос записи:', location.state.rescheduleBookingId);
    }
  }, [location]);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, selectedCategory]);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await api.get('/api/services');
      const servicesData = response || [];

      setServices(servicesData);

      // Извлекаем категории
      const uniqueCategories = [...new Set(servicesData.map((service) => service.category))];
      setCategories(['all', ...uniqueCategories]);
    } catch (err) {
      setError('Не удалось загрузить услуги');
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    // Фильтр по поиску
    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.category.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Фильтр по категории
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((service) => service.category === selectedCategory);
    }

    setFilteredServices(filtered);
  };

  const fetchAvailableTimes = async (serviceId, date) => {
    try {
      const response = await api.get(
        `/api/bookings/available-times?date=${date}&serviceId=${serviceId}`,
      );
      setAvailableTimes(response?.availableSlots || []);
    } catch (err) {
      setError('Не удалось загрузить доступное время');
      setAvailableTimes([]);
    }
  };

  const handleBookService = async (service) => {
    if (!user) {
      navigate('/login', {
        state: { from: location, message: 'Для записи необходимо войти в систему' },
      });
      return;
    }

    setSelectedService(service);
    const today = new Date().toISOString().split('T')[0];
    await fetchAvailableTimes(service.id, today);
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      await api.post('/api/bookings', bookingData);

      // Показываем уведомление об успехе
      setError('');
      setSelectedService(null);
      setAvailableTimes([]);

      // Можно добавить toast notification вместо alert
      setTimeout(() => {
        if (window.showSuccessMessage) {
          window.showSuccessMessage('✅ Запись успешно создана!');
        } else {
          alert('✅ Запись успешно создана!');
        }
      }, 100);
    } catch (err) {
      const errorMessage = err.message || 'Ошибка при создании записи';
      setError(errorMessage);
      throw err;
    }
  };

  const getPopularServices = () => {
    return services.filter((service) => service.popular).slice(0, 3);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="services-page">
      {/* Хедер страницы */}
      <div className="services-hero">
        <div className="hero-content">
          <h1> Наши услуги</h1>
          <p>Выберите процедуру и запишитесь на удобное время</p>

          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">{services.length}</div>
              <div className="stat-label">доступных услуг</div>
            </div>
            <div className="stat">
              <div className="stat-number">24/7</div>
              <div className="stat-label">онлайн запись</div>
            </div>
            <div className="stat">
              <div className="stat-number">⭐ 4.9</div>
              <div className="stat-label">рейтинг клиентов</div>
            </div>
          </div>
        </div>

        <div className="hero-actions">
          <button onClick={() => navigate('/profile')} className="btn btn-secondary">
            📊 Мои записи
          </button>
        </div>
      </div>

      {/* Панель фильтров и поиска */}
      <div className="filters-panel">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Поиск услуг..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="clear-search">
              ✕
            </button>
          )}
        </div>

        <div className="category-filters">
          <div className="category-label">Категории:</div>
          <div className="category-buttons">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}>
                {category === 'all' ? 'Все услуги' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Популярные услуги */}
      {getPopularServices().length > 0 && (
        <section className="popular-section">
          <h2>⭐ Популярные услуги</h2>
          <div className="popular-grid">
            {getPopularServices().map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={handleBookService}
                featured={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Основной список услуг */}
      <section className="services-section">
        <div className="section-header">
          <h2>
            {selectedCategory === 'all' ? 'Все услуги' : selectedCategory}
            <span className="services-count"> ({filteredServices.length})</span>
          </h2>

          <div className="view-options">
            <button className="view-option active">📋 Список</button>
            <button className="view-option">🔄 Сортировка</button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Загружаем каталог услуг...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>Услуги не найдены</h3>
            <p>Попробуйте изменить параметры поиска или выбрать другую категорию</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="btn btn-primary">
              🗑️ Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="services-grid">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} onBook={handleBookService} />
            ))}
          </div>
        )}
      </section>

      {/* Баннер с призывом к действию */}
      <section className="cta-banner">
        <div className="cta-content">
          <h3>Готовы преобразиться?</h3>
          <p>Выберите услугу и запишитесь на консультацию с нашим специалистом</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="btn btn-primary btn-large">
            💫 Выбрать услугу
          </button>
        </div>
        <div className="cta-decoration">
          <span className="decoration-icon">✨</span>
          <span className="decoration-icon">💆‍♀️</span>
          <span className="decoration-icon">🌟</span>
        </div>
      </section>

      {/* Модальное окно записи */}
      {selectedService && (
        <BookingForm
          service={selectedService}
          onBookingSubmit={handleBookingSubmit}
          onCancel={() => {
            setSelectedService(null);
            setAvailableTimes([]);
          }}
          availableTimes={availableTimes}
          user={user}
        />
      )}
    </div>
  );
};

export default Services;
