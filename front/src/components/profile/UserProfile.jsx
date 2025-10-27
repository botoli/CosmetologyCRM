import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import TelegramLink from './TelegramLink';
import { apiService } from '../../services/api';

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'bookings') {
      loadBookings();
    }
  }, [activeTab]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const userBookings = await apiService.getUserBookings();
      setBookings(userBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: '👤 Профиль', icon: '👤' },
    { id: 'bookings', name: '📅 Мои записи', icon: '📅' },
    { id: 'settings', name: '⚙️ Настройки', icon: '⚙️' },
  ];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="container">
      <div className="profile-header">
        <h1 className="profile-title">Личный кабинет</h1>
        <p className="profile-subtitle">Управляйте вашими данными и записями</p>
      </div>

      <div className="grid grid--2 gap-lg">
        {/* Боковая панель с навигацией */}
        <div className="card">
          <div className="profile-sidebar">
            <div className="user-info">
              <div className="user-avatar">
                {user.name?.[0]}
                {user.surname?.[0]}
              </div>
              <div>
                <h3 className="user-name">
                  {user.name} {user.surname}
                </h3>
                <p className="user-email">{user.email}</p>
                <div className={`user-badge ${user.role === 'admin' ? 'admin' : 'client'}`}>
                  {user.role === 'admin' ? '👑 Администратор' : '💫 Клиент'}
                </div>
              </div>
            </div>

            <nav className="profile-nav">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}>
                  <span className="nav-icon">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Основной контент */}
        <div className="card">
          {activeTab === 'profile' && (
            <div className="tab-content">
              <h2 className="tab-title">Информация о профиле</h2>

              <div className="info-grid">
                <div className="info-item">
                  <label className="info-label">Имя</label>
                  <div className="info-value">{user.name}</div>
                </div>
                <div className="info-item">
                  <label className="info-label">Фамилия</label>
                  <div className="info-value">{user.surname}</div>
                </div>
                <div className="info-item">
                  <label className="info-label">Email</label>
                  <div className="info-value">{user.email}</div>
                </div>
                <div className="info-item">
                  <label className="info-label">Телефон</label>
                  <div className="info-value">{user.phone}</div>
                </div>
              </div>

              <div className="telegram-section">
                <TelegramLink />
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="tab-content">
              <h2 className="tab-title">История записей</h2>

              {loading ? (
                <div className="loading-bookings">
                  <div className="loading__spinner"></div>
                  <p>Загружаем ваши записи...</p>
                </div>
              ) : bookings.length > 0 ? (
                <div className="bookings-list">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="booking-card">
                      <div className="booking-header">
                        <h4 className="booking-service">{booking.service_name}</h4>
                        <span className={`booking-status ${booking.status}`}>
                          {booking.status === 'confirmed'
                            ? '✅ Подтверждено'
                            : booking.status === 'pending'
                            ? '⏳ Ожидание'
                            : booking.status === 'cancelled'
                            ? '❌ Отменено'
                            : '✅ Завершено'}
                        </span>
                      </div>
                      <div className="booking-details">
                        <div className="booking-date">
                          <span className="detail-label">📅 Дата:</span>
                          <span>{formatDate(booking.booking_date)}</span>
                        </div>
                        <div className="booking-time">
                          <span className="detail-label">⏰ Время:</span>
                          <span>{booking.booking_time}</span>
                        </div>
                        <div className="booking-price">
                          <span className="detail-label">💰 Стоимость:</span>
                          <span>{booking.price} ₽</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <h3 className="empty-title">Записей пока нет</h3>
                  <p className="empty-text">
                    У вас еще не было записей. Запланируйте свой первый визит!
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="tab-content">
              <h2 className="tab-title">Настройки</h2>

              <div className="settings-list">
                <div className="setting-item">
                  <div>
                    <h4 className="setting-title">Уведомления по Email</h4>
                    <p className="setting-description">Получать напоминания о записях на email</p>
                  </div>
                  <div className="toggle-container">
                    <input
                      type="checkbox"
                      id="email-notifications"
                      defaultChecked
                      className="toggle-input"
                    />
                    <label htmlFor="email-notifications" className="toggle-label"></label>
                  </div>
                </div>

                <div className="setting-item">
                  <div>
                    <h4 className="setting-title">SMS уведомления</h4>
                    <p className="setting-description">Получать напоминания по SMS</p>
                  </div>
                  <div className="toggle-container">
                    <input type="checkbox" id="sms-notifications" className="toggle-input" />
                    <label htmlFor="sms-notifications" className="toggle-label"></label>
                  </div>
                </div>

                <div className="setting-item">
                  <div>
                    <h4 className="setting-title">Язык интерфейса</h4>
                    <p className="setting-description">Русский</p>
                  </div>
                  <select className="language-select">
                    <option>Русский</option>
                    <option>English</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
