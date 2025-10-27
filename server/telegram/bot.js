const { Telegraf } = require('telegraf');

class TelegramBot {
  constructor(token, db) {
    this.bot = new Telegraf(token);
    this.db = db;
    this.setupHandlers();
  }

  setupHandlers() {
    // Команда старт
    this.bot.start((ctx) => {
      ctx.reply(
        '👋 Добро пожаловать в бот косметологического кабинета!\n\n' +
          'Для привязки аккаунта отправьте мне код, который вы получили в личном кабинете.\n\n' +
          'После привязки вы будете получать уведомления о ваших записях.',
      );
    });

    // Обработка кодов привязки
    this.bot.on('text', async (ctx) => {
      const message = ctx.message.text.trim();
      const chatId = ctx.message.chat.id;
      const username = ctx.message.from.username || ctx.message.from.first_name;

      console.log(`Received message: ${message} from chat: ${chatId}`);

      // Проверяем, является ли сообщение кодом привязки (6 символов)
      if (message.length === 6 && /^[A-Z0-9]{6}$/.test(message)) {
        try {
          const result = await this.db.verifyTelegramLink(message, chatId.toString(), username);

          ctx.reply(
            '✅ Аккаунт успешно привязан!\n\n' +
              'Теперь вы будете получать уведомления о:\n' +
              '• Подтверждении записей\n' +
              '• Напоминаниях о визитах\n' +
              '• Изменениях в расписании',
          );

          console.log(`Telegram account linked: ${chatId} -> user ${result.userId}`);
        } catch (error) {
          console.error('Error linking Telegram account:', error);
          ctx.reply(
            '❌ Не удалось привязать аккаунт. Возможно:\n' +
              '• Код устарел (действует 10 минут)\n' +
              '• Код уже использован\n' +
              '• Неверный код\n\n' +
              'Пожалуйста, получите новый код в личном кабинете и попробуйте снова.',
          );
        }
      } else if (!message.startsWith('/')) {
        ctx.reply(
          'Отправьте мне 6-значный код привязки, который вы получили в личном кабинете.\n\n' +
            'Если у вас нет кода, зайдите в личный кабинет и нажмите "Привязать Telegram".',
        );
      }
    });

    // Команда помощи
    this.bot.help((ctx) => {
      ctx.reply(
        'ℹ️ Доступные команды:\n\n' +
          '/start - Начать работу с ботом\n' +
          '/help - Показать эту справку\n\n' +
          'Для привязки аккаунта отправьте код из личного кабинета.',
      );
    });

    // Обработка ошибок
    this.bot.catch((err, ctx) => {
      console.error('Telegram bot error:', err);
      ctx.reply('❌ Произошла ошибка. Пожалуйста, попробуйте позже.');
    });
  }

  // Отправка уведомления о новой записи
  async sendBookingConfirmation(userId, bookingData) {
    try {
      const user = await this.db.findUserById(userId);
      if (!user || !user.telegram_id) {
        return false;
      }

      const message =
        `✅ Запись подтверждена!\n\n` +
        `💆 Услуга: ${bookingData.serviceName}\n` +
        `📅 Дата: ${bookingData.date}\n` +
        `⏰ Время: ${bookingData.time}\n` +
        `💰 Стоимость: ${bookingData.price} ₽\n` +
        `⏱ Длительность: ${bookingData.duration} мин\n\n` +
        `Ждем вас в нашем кабинете!`;

      await this.bot.telegram.sendMessage(user.telegram_id, message);
      return true;
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
      return false;
    }
  }

  // Отправка напоминания
  async sendReminder(userId, bookingData) {
    try {
      const user = await this.db.findUserById(userId);
      if (!user || !user.telegram_id) {
        return false;
      }

      const message =
        `🔔 Напоминание о записи\n\n` +
        `Через 24 часа у вас запись:\n\n` +
        `💆 ${bookingData.serviceName}\n` +
        `📅 ${bookingData.date}\n` +
        `⏰ ${bookingData.time}\n\n` +
        `Не забудьте подготовиться к визиту!`;

      await this.bot.telegram.sendMessage(user.telegram_id, message);
      return true;
    } catch (error) {
      console.error('Error sending reminder:', error);
      return false;
    }
  }

  start() {
    this.bot
      .launch()
      .then(() => {
        console.log('✅ Telegram bot started successfully');
      })
      .catch((error) => {
        console.error('❌ Error starting Telegram bot:', error);
      });

    // Включить graceful stop
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }

  stop() {
    this.bot.stop();
  }
}

module.exports = TelegramBot;
