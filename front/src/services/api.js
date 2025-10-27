const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      // Проверяем, является ли ответ HTML
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error('Server returned HTML instead of JSON. Check if API endpoint exists.');
      }

      // Проверяем, есть ли контент для парсинга
      const responseText = await response.text();

      if (!responseText) {
        // Пустой ответ
        if (response.ok) {
          return null;
        } else {
          throw new Error(`Empty response with status: ${response.status}`);
        }
      }

      if (!response.ok) {
        throw new Error(responseText || `HTTP error! status: ${response.status}`);
      }

      // Парсим JSON только если есть контент
      const data = JSON.parse(responseText);
      return data;
    } catch (error) {
      console.error('API request failed:', error);

      // Для демонстрации возвращаем мок данные
      if (endpoint === '/services') {
        console.log('Using mock services data');
        return this.getMockServices();
      }

      throw new Error(error.message || 'Network error');
    }
  }

  // Мок данные для услуг
  getMockServices() {
    return [
      {
        id: 1,
        name: 'Ультразвуковая чистка лица',
        category: 'Чистка лица',
        description: 'Глубокая очистка пор с помощью ультразвука',
        price: 1800.0,
        duration: 60,
        is_active: true,
      },
      {
        id: 2,
        name: 'Комбинированная чистка лица',
        category: 'Чистка лица',
        description: 'Комплексная чистка с ручной и аппаратной обработкой',
        price: 2500.0,
        duration: 90,
        is_active: true,
      },
      {
        id: 3,
        name: 'Массаж лица комбинированный',
        category: 'Массаж лица',
        description: 'Расслабляющий и тонизирующий массаж',
        price: 1500.0,
        duration: 45,
        is_active: true,
      },
      {
        id: 4,
        name: 'S-уход',
        category: 'Уход лица с массажем',
        description: 'Базовый уход за кожей лица',
        price: 1500.0,
        duration: 45,
        is_active: true,
      },
      {
        id: 5,
        name: 'Химический пилинг',
        category: 'Пилинг',
        description: 'Профессиональный химический пилинг для обновления кожи',
        price: 2200.0,
        duration: 60,
        is_active: true,
      },
      {
        id: 6,
        name: 'Альгинатная маска',
        category: 'Уход лица',
        description: 'Увлажняющая и подтягивающая маска',
        price: 1200.0,
        duration: 30,
        is_active: true,
      },
    ];
  }

  async getServices() {
    try {
      const services = await this.request('/services');
      return services || this.getMockServices();
    } catch (error) {
      console.error('Failed to fetch services from API, using mock data:', error);
      return this.getMockServices();
    }
  }

  async createBooking(bookingData) {
    try {
      const result = await this.request('/bookings', {
        method: 'POST',
        body: bookingData,
      });
      return (
        result || {
          id: Date.now(),
          ...bookingData,
          status: 'confirmed',
        }
      );
    } catch (error) {
      console.error('Failed to create booking:', error);
      // Возвращаем мок ответ для демонстрации
      return {
        id: Date.now(),
        ...bookingData,
        status: 'confirmed',
      };
    }
  }

  async getUserBookings() {
    try {
      const bookings = await this.request('/bookings/my');
      return bookings || [];
    } catch (error) {
      console.error('Failed to fetch user bookings:', error);
      return [];
    }
  }

  // Telegram
  async createTelegramLink() {
    try {
      const result = await this.request('/telegram/link', {
        method: 'POST',
      });
      return result || { linkCode: Math.random().toString(36).substring(2, 8).toUpperCase() };
    } catch (error) {
      console.error('Failed to create telegram link:', error);
      // Мок ответ
      const linkCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      return { linkCode };
    }
  }

  async checkTelegramLink(code) {
    try {
      const result = await this.request(`/telegram/check-link/${code}`);
      return result || { linked: false };
    } catch (error) {
      console.error('Failed to check telegram link:', error);
      // Мок ответ - всегда не привязан для демо
      return { linked: false };
    }
  }

  async unlinkTelegram() {
    try {
      const result = await this.request('/telegram/unlink', {
        method: 'POST',
      });
      return result || { success: true };
    } catch (error) {
      console.error('Failed to unlink telegram:', error);
      return { success: true };
    }
  }
}

export const apiService = new ApiService();
