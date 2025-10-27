import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Загружаем реальные данные
      const bookings = await apiService.getUserBookings();
      setRecentBookings(bookings || []);

      // Рассчитываем статистику на основе реальных данных
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = bookings?.filter((booking) => booking.booking_date === today) || [];

      setStats({
        totalBookings: bookings?.length || 0,
        todayBookings: todayBookings.length,
        pendingBookings: bookings?.filter((b) => b.status === 'pending').length || 0,
        revenue: bookings?.reduce((sum, booking) => sum + (booking.price || 0), 0) || 0,
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: '📊 Обзор', icon: '📊' },
    { id: 'bookings', name: '📅 Записи', icon: '📅' },
    { id: 'services', name: '💆 Услуги', icon: '💆' },
    { id: 'clients', name: '👥 Клиенты', icon: '👥' },
    { id: 'schedule', name: '🗓️ Расписание', icon: '🗓️' },
    { id: 'reports', name: '📈 Отчеты', icon: '📈' },
  ];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { text: '✅ Подтверждено', class: 'confirmed' },
      pending: { text: '⏳ Ожидание', class: 'pending' },
      cancelled: { text: '❌ Отменено', class: 'cancelled' },
      completed: { text: '✅ Завершено', class: 'completed' },
    };

    return statusConfig[status] || { text: status, class: 'unknown' };
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="loading__spinner"></div>
          <p>Загружаем панель администратора...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Заголовок админки */}
      <div className="admin-header">
        <div className="admin-welcome">
          <h1 className="admin-title">👑 Панель администратора</h1>
          <p className="admin-subtitle">Управление косметологическим кабинетом</p>
        </div>
        <div className="admin-actions">
          <button className="btn btn--primary btn--small" onClick={loadDashboardData}>
            🔄 Обновить
          </button>
        </div>
      </div>

      {error && (
        <div className="error--message mb-lg">
          {error}
          <button onClick={loadDashboardData} className="btn btn--secondary btn--small ml-sm">
            Повторить
          </button>
        </div>
      )}

      {/* Статистика */}
      {stats && (
        <div className="admin-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalBookings}</div>
              <div className="stat-label">Всего записей</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <div className="stat-value">{stats.todayBookings}</div>
              <div className="stat-label">Сегодня</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <div className="stat-value">{stats.revenue.toLocaleString()} ₽</div>
              <div className="stat-label">Общая выручка</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <div className="stat-value">{stats.pendingBookings}</div>
              <div className="stat-label">Ожидают подтверждения</div>
            </div>
          </div>
        </div>
      )}

      {/* Навигация */}
      <div className="admin-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`admin-nav-button ${activeTab === tab.id ? 'active' : ''}`}>
            <span className="nav-icon">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* Контент вкладок */}
      <div className="admin-content">
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="content-grid">
              <div className="content-card">
                <h3 className="card-title">🚀 Быстрые действия</h3>
                <div className="quick-actions">
                  <button className="quick-action-btn" disabled>
                    <span className="action-icon">➕</span>
                    Добавить услугу
                  </button>
                  <button className="quick-action-btn" disabled>
                    <span className="action-icon">👥</span>
                    Управление клиентами
                  </button>
                  <button className="quick-action-btn" disabled>
                    <span className="action-icon">📅</span>
                    Настроить расписание
                  </button>
                  <button className="quick-action-btn" disabled>
                    <span className="action-icon">📊</span>
                    Создать отчет
                  </button>
                </div>
                <p className="text-muted mt-sm">Функции находятся в разработке</p>
              </div>

              <div className="content-card">
                <h3 className="card-title">📅 Последние записи</h3>
                {recentBookings.length > 0 ? (
                  <div className="bookings-list">
                    {recentBookings.slice(0, 5).map((booking) => {
                      const status = getStatusBadge(booking.status);
                      return (
                        <div key={booking.id} className="booking-item">
                          <div className="booking-info">
                            <div className="booking-service">{booking.service_name}</div>
                            <div className="booking-meta">
                              <span className="booking-date">
                                {formatDate(booking.booking_date)}
                              </span>
                              <span className="booking-time">{booking.booking_time}</span>
                            </div>
                          </div>
                          <div className="booking-status">
                            <span className={`status-badge ${status.class}`}>{status.text}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <p className="empty-text">Записей пока нет</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="tab-content">
            <h2 className="tab-title">📅 Управление записями</h2>
            {recentBookings.length > 0 ? (
              <div className="bookings-table">
                <div className="table-header">
                  <div className="table-row">
                    <div className="table-cell">Услуга</div>
                    <div className="table-cell">Дата</div>
                    <div className="table-cell">Время</div>
                    <div className="table-cell">Статус</div>
                    <div className="table-cell">Стоимость</div>
                  </div>
                </div>
                <div className="table-body">
                  {recentBookings.map((booking) => {
                    const status = getStatusBadge(booking.status);
                    return (
                      <div key={booking.id} className="table-row">
                        <div className="table-cell">{booking.service_name}</div>
                        <div className="table-cell">{formatDate(booking.booking_date)}</div>
                        <div className="table-cell">{booking.booking_time}</div>
                        <div className="table-cell">
                          <span className={`status-badge ${status.class}`}>{status.text}</span>
                        </div>
                        <div className="table-cell">{booking.price} ₽</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3 className="empty-title">Записей нет</h3>
                <p className="empty-text">Здесь будут отображаться все записи клиентов</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'services' && (
          <div className="tab-content">
            <h2 className="tab-title">💆 Управление услугами</h2>
            <div className="empty-state">
              <div className="empty-icon">⚙️</div>
              <h3 className="empty-title">Раздел в разработке</h3>
              <p className="empty-text">Здесь будет управление услугами, ценами и категориями</p>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="tab-content">
            <h2 className="tab-title">👥 База клиентов</h2>
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3 className="empty-title">Раздел в разработке</h3>
              <p className="empty-text">Здесь будет список всех клиентов и их история посещений</p>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="tab-content">
            <h2 className="tab-title">🗓️ Расписание</h2>
            <div className="empty-state">
              <div className="empty-icon">🗓️</div>
              <h3 className="empty-title">Раздел в разработке</h3>
              <p className="empty-text">Здесь будет календарь и управление рабочим расписанием</p>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="tab-content">
            <h2 className="tab-title">📈 Отчеты и аналитика</h2>
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3 className="empty-title">Раздел в разработке</h3>
              <p className="empty-text">Здесь будут финансовые отчеты и аналитика по бизнесу</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
