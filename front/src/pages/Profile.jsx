// pages/Profile.jsx - ОБНОВЛЕННЫЙ ПРОФИЛЬ
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import TelegramLink from '../components/TelegramLink';
import { api } from '../utils/api';
import '../styles/Profile.scss';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('bookings');
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  });

  // Редирект если не авторизован
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  const fetchUserBookings = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError('');
      const response = await api.get('/api/bookings/my');
      const bookingsData = response || [];

      setBookings(bookingsData);

      // Расчет статистики
      const now = new Date();
      const upcoming = bookingsData.filter(
        (booking) => booking.status === 'confirmed' || booking.status === 'pending',
      );
      const completed = bookingsData.filter((booking) => booking.status === 'completed');
      const cancelled = bookingsData.filter((booking) => booking.status === 'cancelled');

      setStats({
        total: bookingsData.length,
        upcoming: upcoming.length,
        completed: completed.length,
        cancelled: cancelled.length,
      });
    } catch (err) {
      setError(err.message || 'Не удалось загрузить записи');
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, [user]);

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

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Вы уверены, что хотите отменить запись?')) return;

    try {
      await api.delete(`/api/bookings/${bookingId}`);
      await fetchUserBookings();
    } catch (err) {
      alert(err.message || 'Ошибка при отмене записи');
    }
  };

  const rescheduleBooking = async (bookingId) => {
    navigate('/services', {
      state: { rescheduleBookingId: bookingId },
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: '⏳ Ожидание', class: 'status-pending', color: '#f59e0b' },
      confirmed: { text: '✅ Подтверждена', class: 'status-confirmed', color: '#10b981' },
      cancelled: { text: '❌ Отменена', class: 'status-cancelled', color: '#ef4444' },
      completed: { text: '🎉 Завершена', class: 'status-completed', color: '#3b82f6' },
    };

    const statusInfo = statusMap[status] || {
      text: status,
      class: 'status-unknown',
      color: '#6b7280',
    };
    return (
      <span
        className={`status-badge ${statusInfo.class}`}
        style={{ '--status-color': statusInfo.color }}>
        {statusInfo.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">
      {/* Хедер профиля */}
      <div className="profile-header">
        <div className="profile-hero">
          <div className="user-card">
            <div className="user-avatar-section">
              <div className="user-avatar">
                {user.name?.[0]}
                {user.surname?.[0]}
              </div>
              {user.telegramConnected && (
                <div className="telegram-badge" title="Telegram привязан">
                  📱
                </div>
              )}
            </div>

            <div className="user-info">
              <h1 className="user-greeting">Привет, {user.name}! 👋</h1>
              <div className="user-details">
                <div className="detail-item">
                  <span className="detail-label">📧 Email:</span>
                  <span className="detail-value">{user.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📞 Телефон:</span>
                  <span className="detail-value">{user.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">🎭 Роль:</span>
                  <span className="detail-value">
                    {user.role === 'admin' ? '👑 Администратор' : '👤 Клиент'}
                  </span>
                </div>
              </div>
            </div>

            <div className="user-actions">
              <button onClick={() => navigate('/services')} className="btn btn-primary">
                📅 Новая запись
              </button>
              {user.role === 'admin' && (
                <button onClick={() => navigate('/admin')} className="btn btn-secondary">
                  👑 Админ-панель
                </button>
              )}
              <button onClick={logout} className="btn btn-danger">
                🚪 Выйти
              </button>
            </div>
          </div>

          {/* Статистика */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Всего записей</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <div className="stat-value">{stats.upcoming}</div>
                <div className="stat-label">Предстоящие</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-value">{stats.completed}</div>
                <div className="stat-label">Завершено</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💎</div>
              <div className="stat-content">
                <div className="stat-value">{user.telegramConnected ? 'Да' : 'Нет'}</div>
                <div className="stat-label">Telegram</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Контент профиля */}
      <div className="profile-content">
        <div className="tabs-navigation">
          <button
            className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}>
            <span className="tab-icon">📅</span>
            Мои записи
            {stats.upcoming > 0 && <span className="tab-badge">{stats.upcoming}</span>}
          </button>
          <button
            className={`tab ${activeTab === 'telegram' ? 'active' : ''}`}
            onClick={() => setActiveTab('telegram')}>
            <span className="tab-icon">📱</span>
            Telegram
            {!user.telegramConnected && <span className="tab-badge warning">!</span>}
          </button>
          <button
            className={`tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}>
            <span className="tab-icon">👤</span>
            Информация
          </button>
        </div>

        <div className="tab-content">
          {/* Вкладка записей */}
          {activeTab === 'bookings' && (
            <div className="bookings-tab">
              <div className="tab-header">
                <h2>История записей</h2>
                <button onClick={() => navigate('/services')} className="btn btn-primary">
                  📅 Новая запись
                </button>
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
                  <p>Загрузка ваших записей...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <h3>У вас пока нет записей</h3>
                  <p>Запишитесь на первую процедуру и начните свой путь к красоте!</p>
                  <button
                    onClick={() => navigate('/services')}
                    className="btn btn-primary btn-large">
                    🎯 Записаться на прием
                  </button>
                </div>
              ) : (
                <div className="bookings-container">
                  <div className="bookings-list">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="booking-card">
                        <div className="booking-main">
                          <div className="booking-service">
                            <h3>{booking.service_name}</h3>
                            <div className="booking-meta">
                              <span className="meta-item">
                                <span className="meta-icon">📅</span>
                                {formatDate(booking.booking_date)}
                              </span>
                              <span className="meta-item">
                                <span className="meta-icon">🕒</span>
                                {booking.booking_time}
                              </span>
                              <span className="meta-item">
                                <span className="meta-icon">💰</span>
                                {booking.price} ₽
                              </span>
                            </div>
                            {booking.comment && (
                              <div className="booking-comment">
                                <span className="comment-icon">💬</span>
                                {booking.comment}
                              </div>
                            )}
                          </div>

                          <div className="booking-actions">
                            {getStatusBadge(booking.status)}
                            <div className="action-buttons">
                              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                <>
                                  <button
                                    onClick={() => rescheduleBooking(booking.id)}
                                    className="btn btn-secondary btn-small">
                                    🕐 Перенести
                                  </button>
                                  <button
                                    onClick={() => cancelBooking(booking.id)}
                                    className="btn btn-danger btn-small">
                                    ❌ Отменить
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {booking.status === 'pending' && (
                          <div className="booking-notice">
                            <span className="notice-icon">💡</span>
                            Ожидает подтверждения администратором
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Вкладка Telegram */}
          {activeTab === 'telegram' && (
            <div className="telegram-tab">
              <div className="tab-header">
                <h2>Управление Telegram</h2>
                <p>Подключите Telegram для получения уведомлений о записях</p>
              </div>
              <TelegramLink
                user={user}
                onLink={handleTelegramLink}
                onUnlink={handleTelegramUnlink}
                onCheckLink={handleCheckLink}
              />
            </div>
          )}

          {/* Вкладка информации */}
          {activeTab === 'info' && (
            <div className="info-tab">
              <div className="tab-header">
                <h2>Личная информация</h2>
                <p>Ваши данные и настройки аккаунта</p>
              </div>

              <div className="info-cards">
                <div className="info-card">
                  <h3>👤 Основная информация</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Имя и фамилия:</label>
                      <span>
                        {user.name} {user.surname}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Email:</label>
                      <span>{user.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Телефон:</label>
                      <span>{user.phone}</span>
                    </div>
                    <div className="info-item">
                      <label>Роль:</label>
                      <span>{user.role === 'admin' ? 'Администратор' : 'Клиент'}</span>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <h3>🔔 Уведомления</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Telegram уведомления:</label>
                      <span className={user.telegramConnected ? 'status-on' : 'status-off'}>
                        {user.telegramConnected ? 'Подключено' : 'Не подключено'}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Email уведомления:</label>
                      <span className="status-on">Активны</span>
                    </div>
                    <div className="info-item">
                      <label>Напоминания:</label>
                      <span className="status-on">За 24 часа</span>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <h3>📊 Статистика аккаунта</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Дата регистрации:</label>
                      <span>{new Date().toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="info-item">
                      <label>Всего записей:</label>
                      <span>{stats.total}</span>
                    </div>
                    <div className="info-item">
                      <label>Активных записей:</label>
                      <span>{stats.upcoming}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
