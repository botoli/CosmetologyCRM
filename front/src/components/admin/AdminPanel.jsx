import React from 'react';

const AdminPanel = () => {
  return (
    <div className="container">
      <h1>Панель администратора</h1>
      <div className="admin-grid">
        <div className="admin-card">
          <h3>Управление расписанием</h3>
          <p>Настройка временных слотов и просмотр записей</p>
        </div>
        <div className="admin-card">
          <h3>Управление услугами</h3>
          <p>Добавление и редактирование услуг</p>
        </div>
        <div className="admin-card">
          <h3>Клиентская база</h3>
          <p>Просмотр клиентов и истории записей</p>
        </div>
        <div className="admin-card">
          <h3>Уведомления</h3>
          <p>Настройка шаблонов сообщений</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
