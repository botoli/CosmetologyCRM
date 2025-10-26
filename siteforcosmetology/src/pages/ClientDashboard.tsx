import { Link } from 'react-router-dom'
import { useAppSelector } from '../hooks/redux'
import { FaPlus, FaHistory, FaCog } from 'react-icons/fa'

const ClientDashboard = () => {
  const { user } = useAppSelector((state) => state.auth)
  const mockBookings = [
    { id: '1', service: 'Чистка лица', date: '2024-01-15', time: '14:00', status: 'confirmed' },
    { id: '2', service: 'Массаж лица', date: '2024-01-10', time: '16:00', status: 'completed' },
  ]

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Добро пожаловать, {user?.name}!</h2>
        <p>Здесь вы можете управлять своими записями</p>
      </div>

      <div className="grid grid-3">
        <div className="card" style={{ textAlign: 'center' }}>
          <FaPlus size={48} color="#7b9acc" />
          <h3 style={{ margin: '1rem 0' }}>Новая запись</h3>
          <Link to="/booking" className="btn btn-primary">Записаться</Link>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <FaHistory size={48} color="#7b9acc" />
          <h3 style={{ margin: '1rem 0' }}>История</h3>
          <Link to="/client/history" className="btn btn-secondary">Посмотреть</Link>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <FaCog size={48} color="#7b9acc" />
          <h3 style={{ margin: '1rem 0' }}>Настройки</h3>
          <Link to="/client/settings" className="btn btn-secondary">Настроить</Link>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Ближайшие записи</h3>
        {mockBookings.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Услуга</th>
                <th>Дата</th>
                <th>Время</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {mockBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.service}</td>
                  <td>{booking.date}</td>
                  <td>{booking.time}</td>
                  <td>
                    <span className={`btn btn-sm ${booking.status === 'confirmed' ? 'btn-success' : 'btn-secondary'}`}>
                      {booking.status === 'confirmed' ? 'Подтверждено' : 'Завершено'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>У вас пока нет записей</p>
        )}
      </div>
    </>
  )
}

export default ClientDashboard

