import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import ServiceCard from './ServiceCard';
import Loader from '../common/Loader';

const ServiceSelection = ({ data = {}, updateData, nextStep }) => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, selectedCategory]);

  const loadServices = async () => {
    try {
      setError('');
      const servicesData = await apiService.getServices();
      setServices(Array.isArray(servicesData) ? servicesData : []);
    } catch (error) {
      console.error('Error loading services:', error);
      setError('Не удалось загрузить услуги.');
      setServices([]); // Устанавливаем пустой массив вместо повторного вызова
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    if (searchTerm && Array.isArray(filtered)) {
      filtered = filtered.filter(
        (service) =>
          service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service?.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedCategory !== 'all' && Array.isArray(filtered)) {
      filtered = filtered.filter((service) => service?.category === selectedCategory);
    }

    setFilteredServices(filtered || []);
  };

  const categories = [...new Set(services.map((service) => service?.category).filter(Boolean))];

  const handleServiceSelect = (service) => {
    if (updateData && nextStep) {
      updateData({ service });
      nextStep();
    } else {
      console.warn('updateData or nextStep is not provided');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <Loader text="Загружаем услуги..." />
      </div>
    );
  }

  return (
    <div className="container fade-in">
      <div className="service-selection-header">
        <h1 className="service-selection-title">💫 Выберите услугу</h1>
        <p className="service-selection-subtitle">Подберите идеальную процедуру для себя</p>
      </div>

      {error && (
        <div className="card mb-lg">
          <div className="error--message">{error}</div>
        </div>
      )}

      <div className="card mb-lg">
        <div className="service-filters">
          <div className="search-filter">
            <input
              type="text"
              placeholder="🔍 Поиск услуг..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form__input search-input"
            />
          </div>

          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form__select">
              <option value="all">📂 Все категории</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="services-grid">
        {filteredServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            selected={data.service?.id === service.id}
            onSelect={handleServiceSelect}
          />
        ))}
      </div>

      {filteredServices.length === 0 && services.length > 0 && (
        <div className="card text-center">
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3 className="no-results-title">Услуги не найдены</h3>
            <p className="no-results-text">
              Попробуйте изменить поисковый запрос или выбрать другую категорию
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceSelection;
