# 📱 Настройка Telegram привязки

## Как работает привязка

1. **Пользователь нажимает "Привязать Telegram"**
   - Генерируется уникальный код
   - Код отправляется на backend: `POST /api/telegram/link`

2. **Backend сохраняет код и готовит сообщение для бота**
   ```json
   {
     "userId": "123",
     "linkCode": "ABC123",
     "createdAt": "2025-10-27T10:00:00Z"
   }
   ```

3. **Пользователь отправляет код боту**
   - Открывает Telegram
   - Пишет боту: `@your_bot_name ABC123`

4. **Бот отправляет код на backend**
   ```json
   {
     "telegramId": "123456789",
     "linkCode": "ABC123",
     "username": "@username"
   }
   ```

5. **Frontend проверяет привязку каждые 3 секунды**
   - Отправляет запрос: `GET /api/telegram/check-link/ABC123`
   - Когда получает `linked: true` - завершает процесс

## Backend endpoints для реализации

### POST `/api/telegram/link`
Создание кода привязки
```javascript
// Request
{
  "userId": "123",
  "linkCode": "ABC123"
}

// Response
{
  "success": true
}
```

### GET `/api/telegram/check-link/:code`
Проверка статуса привязки
```javascript
// Response когда НЕ привязано
{
  "linked": false
}

// Response когда привязано
{
  "linked": true,
  "telegramId": "123456789",
  "telegramUsername": "@username"
}
```

### POST `/api/telegram/unlink`
Отвязка Telegram
```javascript
// Request
{
  "userId": "123"
}

// Response
{
  "success": true
}
```

## Логика на боте (backend)

```javascript
// Когда пользователь отправляет боту код
bot.on('message', async (msg) => {
  const text = msg.text
  const code = text.match(/^[A-Z0-9]{6}$/)
  
  if (code) {
    // Отправка на backend
    await fetch('/api/telegram/verify-code', {
      method: 'POST',
      body: JSON.stringify({
        telegramId: msg.from.id,
        linkCode: code[0],
        username: msg.from.username
      })
    })
    
    bot.sendMessage(msg.chat.id, 'Привязка успешна! ✅')
  }
})
```

## Пример реализации на Node.js

```javascript
// Backend route
app.post('/api/telegram/verify-code', async (req, res) => {
  const { telegramId, linkCode, username } = req.body
  
  // Найти запись с этим кодом
  const link = await LinkCode.findOne({ code: linkCode })
  
  if (link && !link.used) {
    // Обновить пользователя
    await User.update(link.userId, {
      telegramConnected: true,
      telegramId: telegramId,
      telegramUsername: username
    })
    
    // Пометить код как использованный
    link.used = true
    await link.save()
    
    res.json({ success: true })
  } else {
    res.json({ success: false })
  }
})
```

## Переменные окружения

В `.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
```

## Проверка привязки (Frontend)

Frontend автоматически опрашивает backend каждые 3 секунды:
```javascript
setInterval(async () => {
  const response = await fetch(`/api/telegram/check-link/${code}`)
  const { linked } = await response.json()
  
  if (linked) {
    // Привязано!
    updateUserState()
  }
}, 3000)
```

