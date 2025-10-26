// Telegram Bot API интеграция
export const telegramService = {
  // Отправка уведомления в Telegram
  sendNotification: async (telegramId: string, message: string) => {
    const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
    if (!BOT_TOKEN) {
      console.warn('Telegram bot token not configured')
      return false
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramId,
          text: message,
          parse_mode: 'HTML',
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Telegram notification error:', error)
      return false
    }
  },

  // Отправка напоминания о записи
  sendReminder: async (telegramId: string, bookingData: {
    service: string
    date: string
    time: string
  }) => {
    const message = `🔔 Напоминание о записи\n\n📅 <b>${bookingData.date}</b>\n⏰ <b>${bookingData.time}</b>\n💆 <b>${bookingData.service}</b>\n\nДо встречи!`
    return await telegramService.sendNotification(telegramId, message)
  },

  // Отправка подтверждения записи
  sendConfirmation: async (telegramId: string, bookingData: {
    service: string
    date: string
    time: string
    price: number
  }) => {
    const message = `✅ Запись подтверждена!\n\n💆 Услуга: <b>${bookingData.service}</b>\n📅 Дата: <b>${bookingData.date}</b>\n⏰ Время: <b>${bookingData.time}</b>\n💰 Стоимость: <b>${bookingData.price} ₽</b>\n\nЖдем вас!`
    return await telegramService.sendNotification(telegramId, message)
  },
}

