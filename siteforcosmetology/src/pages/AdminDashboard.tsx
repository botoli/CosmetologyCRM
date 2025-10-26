import { FaUsers, FaCalendarAlt, FaWrench, FaBell } from 'react-icons/fa'

const AdminDashboard = () => {
  const stats = [
    { label: 'Записей сегодня', value: 5, icon: FaCalendarAlt },
    { label: 'Всего клиентов', value: 142, icon: FaUsers },
    { label: 'Активных услуг', value: 12, icon: FaWrench },
    { label: 'Уведомлений отправлено', value: 48, icon: FaBell },
  ]

  const recentBookings = [
    { id: '1', client: 'Иванова Мария', service: 'Чистка лица', time: '14:00', status: 'pending' },
    { id: '2', client: 'Петров Иван', service: 'Массаж', time: '15:00', status: 'confirmed' },
  ]

  return (
    <>
      <h2 style={{ marginBottom: '2rem' }}>Панель администратора</h2>

      <div className="grid grid-4">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <stat.icon size={32} color="#7b9acc" />
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Ближайшие записи</h3>
        {recentBookings.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Услуга</th>
                <th>Время</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.client}</td>
                  <td>{booking.service}</td>
                  <td>{booking.time}</td>
                  <td>
                    <span className={`btn btn-sm ${booking.status === 'confirmed' ? 'btn-success' : 'btn-warning'}`}>
                      {booking.status === 'confirmed' ? 'Подтверждено' : 'Ожидает'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary">Подробнее</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Нет записей</p>
        )}
      </div>
    </>
  )
}

export default AdminDashboard

