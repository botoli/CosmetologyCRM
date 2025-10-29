// pages/Admin.jsx - ИСПРАВЛЕННЫЙ С ПРАВИЛЬНЫМИ API ВЫЗОВАМИ
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import TelegramLink from '../components/TelegramLink';
import { api } from '../utils/api';
import '../styles/Admin.scss';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    todayBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
  });

  // Редирект если не админ
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if (user.role !== 'admin') {
      navigate('/services', { replace: true });
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Получаем все данные для админ-панели
      const [bookingsData, clientsData, servicesData] = await Promise.all([
        api.get('/api/bookings/all').catch(() => []),
        api.get('/api/clients').catch(() => []),
        api.get('/api/services').catch(() => []),
      ]);

      setBookings(bookingsData || []);
      setClients(clientsData || []);
      setServices(servicesData || []);

      // Расчет статистики
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = (bookingsData || []).filter((b) => b.booking_date === today);
      const pendingBookings = (bookingsData || []).filter((b) => b.status === 'pending');
      const completedBookings = (bookingsData || []).filter((b) => b.status === 'completed');
      const totalRevenue = completedBookings.reduce(
        (sum, b) => sum + (parseFloat(b.price) || 0),
        0,
      );

      setStats({
        totalClients: (clientsData || []).length,
        todayBookings: todayBookings.length,
        pendingBookings: pendingBookings.length,
        completedBookings: completedBookings.length,
        totalRevenue: totalRevenue,
      });
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await api.put(`/api/bookings/${bookingId}/status`, { status });
      await fetchDashboardData();
    } catch (err) {
      alert('Ошибка при обновлении статуса: ' + err.message);
    }
  };

  const deleteBooking = async (bookingId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту запись?')) return;

    try {
      await api.delete(`/api/bookings/${bookingId}`);
      await fetchDashboardData();
    } catch (err) {
      alert('Ошибка при удалении записи: ' + err.message);
    }
  };

  const addNewService = async () => {
    const name = prompt('Название услуги:');
    const category = prompt('Категория:');
    const description = prompt('Описание:');
    const price = prompt('Цена:');
    const duration = prompt('Длительность (минуты):');

    if (!name || !category || !price || !duration) {
      alert('Все поля обязательны для заполнения');
      return;
    }

    try {
      await api.post('/api/services', {
        name,
        category,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
      });
      await fetchDashboardData();
      alert('Услуга добавлена');
    } catch (err) {
      alert('Ошибка при добавлении услуги: ' + err.message);
    }
  };

  const editService = async (service) => {
    const name = prompt('Название услуги:', service.name);
    const category = prompt('Категория:', service.category);
    const description = prompt('Описание:', service.description);
    const price = prompt('Цена:', service.price);
    const duration = prompt('Длительность (минуты):', service.duration);

    if (!name || !category || !price || !duration) {
      alert('Все поля обязательны для заполнения');
      return;
    }

    try {
      await api.put(`/api/services/${service.id}`, {
        name,
        category,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
      });
      await fetchDashboardData();
      alert('Услуга обновлена');
    } catch (err) {
      alert('Ошибка при обновлении услуги: ' + err.message);
    }
  };

  const deleteService = async (serviceId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту услугу?')) return;

    try {
      await api.delete(`/api/services/${serviceId}`);
      await fetchDashboardData();
      alert('Услуга удалена');
    } catch (err) {
      alert('Ошибка при удалении услуги: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: '⏳ Ожидание', class: 'status-pending' },
      confirmed: { text: '✅ Подтверждена', class: 'status-confirmed' },
      cancelled: { text: '❌ Отменена', class: 'status-cancelled' },
      completed: { text: '🎉 Завершена', class: 'status-completed' },
    };

    const statusInfo = statusMap[status] || { text: status, class: 'status-unknown' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  // Функции для работы с Telegram
  const handleTelegramLink = async () => {
    try {
      const response = await api.post('/api/telegram/link');
      return response;
    } catch (err) {
      throw new Error(err.message || 'Не удалось создать код привязки');
    }
  };

  const handleTelegramUnlink = async () => {
    try {
      await api.post('/api/telegram/unlink');
      // Обновляем данные пользователя
      window.location.reload();
    } catch (err) {
      throw new Error(err.message || 'Не удалось отвязать Telegram');
    }
  };

  const handleCheckLink = async (code) => {
    try {
      const response = await api.get(`/api/telegram/check-link/${code}`);
      return response;
    } catch (err) {
      throw new Error(err.message || 'Не удалось проверить статус привязки');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="admin-page">
        <div className="access-denied">
          <h1>⛔ Доступ запрещен</h1>
          <p>У вас нет прав для просмотра этой страницы</p>
          <button onClick={() => navigate('/services')} className="btn btn-primary">
            Вернуться к услугам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="header-content">
          <h1>👑 Панель администратора</h1>
          <p>Управление системой записи</p>
        </div>
      </div>

      <div className="admin-layout">
        <nav className="admin-sidebar">
          <button
            className={`sidebar-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}>
            📊 Дашборд
          </button>
          <button
            className={`sidebar-item ${activeSection === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveSection('bookings')}>
            📅 Управление записями
          </button>
          <button
            className={`sidebar-item ${activeSection === 'clients' ? 'active' : ''}`}
            onClick={() => setActiveSection('clients')}>
            👥 Клиенты
          </button>
          <button
            className={`sidebar-item ${activeSection === 'services' ? 'active' : ''}`}
            onClick={() => setActiveSection('services')}>
            💆 Управление услугами
          </button>
          <button
            className={`sidebar-item ${activeSection === 'telegram' ? 'active' : ''}`}
            onClick={() => setActiveSection('telegram')}>
            📱 Telegram уведомления
          </button>
          <button
            className={`sidebar-item ${activeSection === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveSection('reports')}>
            📈 Отчеты
          </button>
        </nav>

        <main className="admin-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Загрузка данных...</p>
            </div>
          ) : (
            <>
              {activeSection === 'dashboard' && (
                <div className="dashboard-section">
                  <div className="dashboard-header">
                    <h2>Общая статистика</h2>
                    {user.telegramConnected && (
                      <div className="telegram-status-badge">
                        <span className="telegram-icon">📱</span>
                        Telegram подключен
                      </div>
                    )}
                  </div>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">👥</div>
                      <div className="stat-content">
                        <div className="stat-value">{stats.totalClients}</div>
                        <div className="stat-label">Всего клиентов</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">📅</div>
                      <div className="stat-content">
                        <div className="stat-value">{stats.todayBookings}</div>
                        <div className="stat-label">Записей сегодня</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">⏳</div>
                      <div className="stat-content">
                        <div className="stat-value">{stats.pendingBookings}</div>
                        <div className="stat-label">Ожидают подтверждения</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">✅</div>
                      <div className="stat-content">
                        <div className="stat-value">{stats.completedBookings}</div>
                        <div className="stat-label">Завершено записей</div>
                      </div>
                    </div>
                    <div className="stat-card revenue">
                      <div className="stat-icon">💰</div>
                      <div className="stat-content">
                        <div className="stat-value">{stats.totalRevenue} ₽</div>
                        <div className="stat-label">Общая выручка</div>
                      </div>
                    </div>
                  </div>

                  <div className="recent-bookings">
                    <div className="section-header">
                      <h3>Последние записи</h3>
                      <button onClick={fetchDashboardData} className="btn btn-secondary btn-small">
                        🔄 Обновить
                      </button>
                    </div>
                    <div className="bookings-list">
                      {bookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="booking-item">
                          <div className="booking-info">
                            <div className="client-name">
                              <strong>
                                {booking.user_name} {booking.user_surname}
                              </strong>
                            </div>
                            <div className="service-info">
                              <span>{booking.service_name}</span>
                              <span className="booking-date">
                                {booking.booking_date} в {booking.booking_time}
                              </span>
                            </div>
                          </div>
                          <div className="booking-actions">
                            {getStatusBadge(booking.status)}
                            <select
                              value={booking.status}
                              onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                              className="status-select">
                              <option value="pending">Ожидание</option>
                              <option value="confirmed">Подтверждена</option>
                              <option value="cancelled">Отменена</option>
                              <option value="completed">Завершена</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'bookings' && (
                <div className="bookings-section">
                  <div className="section-header">
                    <h2>Управление записями</h2>
                    <span className="section-count">({bookings.length})</span>
                  </div>

                  <div className="bookings-table">
                    <div className="table-header">
                      <span>Клиент</span>
                      <span>Услуга</span>
                      <span>Дата и время</span>
                      <span>Стоимость</span>
                      <span>Статус</span>
                      <span>Действия</span>
                    </div>
                    {bookings.map((booking) => (
                      <div key={booking.id} className="table-row">
                        <span className="client-cell">
                          <strong>
                            {booking.user_name} {booking.user_surname}
                          </strong>
                          <br />
                          <small>{booking.user_phone}</small>
                        </span>
                        <span>{booking.service_name}</span>
                        <span>
                          {booking.booking_date}
                          <br />
                          <small>{booking.booking_time}</small>
                        </span>
                        <span>{booking.price} ₽</span>
                        <span>
                          <select
                            value={booking.status}
                            onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                            className="status-select">
                            <option value="pending">Ожидание</option>
                            <option value="confirmed">Подтверждена</option>
                            <option value="cancelled">Отменена</option>
                            <option value="completed">Завершена</option>
                          </select>
                        </span>
                        <span>
                          <button
                            onClick={() => deleteBooking(booking.id)}
                            className="btn btn-danger btn-small">
                            🗑️ Удалить
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'clients' && (
                <div className="clients-section">
                  <div className="section-header">
                    <h2>Клиенты</h2>
                    <span className="section-count">({clients.length})</span>
                  </div>
                  <div className="clients-grid">
                    {clients.map((client) => (
                      <div key={client.id} className="client-card">
                        <div className="client-header">
                          <div className="client-avatar">
                            {client.name?.[0]}
                            {client.surname?.[0]}
                          </div>
                          <div className="client-info">
                            <h3>
                              {client.name} {client.surname}
                            </h3>
                            <p className="client-email">{client.email}</p>
                          </div>
                        </div>
                        <div className="client-details">
                          <p>📞 {client.phone}</p>
                          <div className="client-stats">
                            <span>📅 Записей: {client.bookings_count || 0}</span>
                            {client.last_visit && (
                              <span>🕒 Последний визит: {client.last_visit}</span>
                            )}
                          </div>
                        </div>
                        {client.telegram_id && (
                          <div className="telegram-badge">📱 Telegram привязан</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'services' && (
                <div className="services-section">
                  <div className="section-header">
                    <h2>Управление услугами</h2>
                    <button onClick={addNewService} className="btn btn-primary">
                      ➕ Добавить услугу
                    </button>
                  </div>
                  <div className="services-list">
                    {services.map((service) => (
                      <div key={service.id} className="service-item">
                        <div className="service-info">
                          <h3>{service.name}</h3>
                          <p className="service-category">{service.category}</p>
                          <p className="service-description">{service.description}</p>
                        </div>
                        <div className="service-pricing">
                          <span className="price">{service.price} ₽</span>
                          <span className="duration">{service.duration} мин</span>
                        </div>
                        <div className="service-actions">
                          <button
                            onClick={() => editService(service)}
                            className="btn btn-secondary btn-small">
                            ✏️ Редактировать
                          </button>
                          <button
                            onClick={() => deleteService(service.id)}
                            className="btn btn-danger btn-small">
                            🗑️ Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'telegram' && (
                <div className="telegram-section">
                  <div className="section-header">
                    <h2>Telegram уведомления</h2>
                    <p>Привяжите Telegram для получения уведомлений о новых записях</p>
                  </div>

                  <div className="telegram-admin-info">
                    <div className="info-card">
                      <h3>📱 Уведомления для администратора</h3>
                      <p>После привязки Telegram вы будете получать:</p>
                      <ul className="benefits-list">
                        <li>⚡ Мгновенные уведомления о новых записях</li>
                        <li>🔔 Напоминания о предстоящих записях</li>
                        <li>📊 Статистику по завершенным записям</li>
                        <li>👥 Уведомления о новых клиентах</li>
                      </ul>
                    </div>
                  </div>

                  <TelegramLink
                    user={user}
                    onLink={handleTelegramLink}
                    onUnlink={handleTelegramUnlink}
                    onCheckLink={handleCheckLink}
                  />
                </div>
              )}

              {activeSection === 'reports' && (
                <div className="reports-section">
                  <h2>Финансовые отчеты</h2>
                  <div className="reports-actions">
                    <button className="btn btn-primary">📊 Отчет за месяц</button>
                    <button className="btn btn-primary">💰 Отчет по выручке</button>
                    <button className="btn btn-secondary">👥 Отчет по клиентам</button>
                  </div>
                  <div className="revenue-stats">
                    <h3>Статистика выручки</h3>
                    <div className="revenue-card">
                      <div className="revenue-value">{stats.totalRevenue} ₽</div>
                      <div className="revenue-label">Общая выручка</div>
                    </div>
                    <div className="revenue-details">
                      <div className="revenue-item">
                        <span>Завершенные записи:</span>
                        <span>{stats.completedBookings}</span>
                      </div>
                      <div className="revenue-item">
                        <span>Средний чек:</span>
                        <span>
                          {stats.completedBookings > 0
                            ? Math.round(stats.totalRevenue / stats.completedBookings)
                            : 0}{' '}
                          ₽
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
