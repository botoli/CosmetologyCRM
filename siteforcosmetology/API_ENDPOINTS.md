# 📋 API Endpoints для подключения к Backend

## 🔑 Аутентификация

### POST `/api/auth/login`
Авторизация пользователя
```json
{
  "phoneOrEmail": "79001234567",
  "password": "password123"
}
```
**Response:**
```json
{
  "user": { "id", "name", "email", "role", ... },
  "token": "jwt_token"
}
```

### POST `/api/auth/register`
Регистрация нового пользователя
```json
{
  "name": "Иван",
  "surname": "Иванов",
  "phone": "79001234567",
  "email": "ivan@mail.ru",
  "password": "password123"
}
```

### GET `/api/auth/me`
Получение текущего пользователя (нужен токен)

### POST `/api/auth/logout`
Выход из системы

---

## 📅 Записи (Bookings)

### POST `/api/bookings`
Создание новой записи
```json
{
  "serviceId": "1",
  "serviceName": "Ультразвуковая чистка лица",
  "date": "27.10.2025",
  "time": "14:00",
  "price": 1800,
  "duration": 60,
  "comment": "Пожелания клиента",
  "telegramNotification": true
}
```

### GET `/api/bookings/my`
Получение записей текущего пользователя

### GET `/api/bookings`
Получение всех записей (админ)

### GET `/api/bookings/:id`
Получение записи по ID

### PUT `/api/bookings/:id`
Обновление записи

### DELETE `/api/bookings/:id`
Отмена записи

---

## 💆 Услуги (Services)

### GET `/api/services`
Получение списка услуг
**Response:**
```json
[
  {
    "id": "1",
    "name": "Ультразвуковая чистка лица",
    "category": "Чистка лица",
    "price": 1800,
    "duration": 60,
    "isActive": true
  }
]
```

### POST `/api/services`
Создание услуги (админ)

### PUT `/api/services/:id`
Обновление услуги (админ)

### DELETE `/api/services/:id`
Удаление услуги (админ)

### PATCH `/api/services/:id/toggle`
Переключение статуса услуги (админ)

---

## 👥 Клиенты

### GET `/api/clients`
Получение списка клиентов (админ)

### GET `/api/clients/:id`
Получение клиента по ID

### PUT `/api/clients/:id`
Обновление клиента

### GET `/api/clients/:id/history`
Получение истории посещений клиента

---

## 📆 Расписание

### GET `/api/schedule/available?date=2025-10-27&serviceId=1`
Получение свободных временных слотов

**Response:**
```json
{
  "date": "27.10.2025",
  "availableSlots": ["09:00", "10:00", "11:00", "14:00", "15:00"]
}
```

### POST `/api/schedule/slots`
Создание временных слотов (админ)
```json
{
  "date": "2025-10-27",
  "startTime": "09:00",
  "endTime": "18:00",
  "interval": 60
}
```

### POST `/api/schedule/block`
Блокировка времени (админ)
```json
{
  "date": "2025-10-27",
  "startTime": "13:00",
  "endTime": "14:00",
  "reason": "Обед"
}
```

---

## 📱 Telegram

### POST `/api/telegram/link`
Привязка Telegram
```json
{
  "userId": "123",
  "telegramId": "telegram_user_id",
  "username": "@username"
}
```

### POST `/api/telegram/unlink`
Отвязка Telegram

### POST `/api/telegram/notify`
Отправка уведомления (автоматически при создании записи)
```json
{
  "telegramId": "123456789",
  "message": "Напоминание о записи..."
}
```

---

## 🔔 Уведомления

### GET `/api/notifications/templates`
Получение шаблонов уведомлений

### PUT `/api/notifications/templates/:id`
Обновление шаблона

### POST `/api/notifications/test`
Тестовая отправка уведомления

---

## 📊 Примеры запросов

### Создание записи с Telegram уведомлением
```javascript
const response = await fetch('/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    serviceId: '1',
    serviceName: 'Ультразвуковая чистка лица',
    date: '27.10.2025',
    time: '14:00',
    price: 1800,
    duration: 60,
    telegramNotification: true
  })
})
```

### Получение свободных слотов
```javascript
const response = await fetch('/api/schedule/available?date=2025-10-27&serviceId=1', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const { availableSlots } = await response.json()
```

---

## 🔐 Аутентификация

Все запросы (кроме `/api/auth/*`) требуют заголовок:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## ⚙️ Переменные окружения

Добавьте в `.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

Все endpoints находятся в файле `src/services/apiEndpoints.ts`

