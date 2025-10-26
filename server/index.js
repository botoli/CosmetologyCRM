require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Инициализация базы данных
const db = new Database();

// Middleware
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  }),
);
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware для аутентификации
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Требуется аутентификация' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Неверный токен' });
    }
    req.user = user;
    next();
  });
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Cosmetology server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Регистрация пользователя
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, surname, phone, email, password } = req.body;

    console.log('📝 Registration attempt:', { name, email, phone });

    // Простая валидация
    if (!name || !surname || !phone || !email || !password) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }

    // Проверяем существующего пользователя
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Хэшируем пароль
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await db.createUser({
      name,
      surname,
      phone,
      email,
      passwordHash,
      role: 'client',
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' },
    );

    console.log('✅ User registered successfully:', user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        telegramConnected: false,
      },
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

// Вход пользователя
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phoneOrEmail, password } = req.body;

    console.log('🔐 Login attempt:', { phoneOrEmail });

    // Ищем пользователя по email или телефону
    let user = await db.findUserByEmail(phoneOrEmail);
    if (!user) {
      user = await db.findUserByPhone(phoneOrEmail);
    }

    if (!user) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Проверяем пароль
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' },
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        telegramConnected: !!user.telegram_id,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Ошибка входа' });
  }
});

// Вход администратора
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.findUserByEmail(email);

    if (!user || user.role !== 'admin') {
      return res.status(401).json({ error: 'Неверные учетные данные администратора' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверные учетные данные администратора' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' },
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        telegramConnected: !!user.telegram_id,
      },
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ error: 'Ошибка входа администратора' });
  }
});

// Получение услуг
app.get('/api/services', async (req, res) => {
  try {
    const services = await db.getServices();
    res.json(services);
  } catch (error) {
    console.error('❌ Get services error:', error);
    res.status(500).json({ error: 'Ошибка при получении услуг' });
  }
});

// Создание записи
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { serviceId, date, time, comment, telegramNotification } = req.body;
    const userId = req.user.id;

    const service = await db.getServiceById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }

    const booking = await db.createBooking({
      userId,
      serviceId,
      bookingDate: date,
      bookingTime: time,
      comment,
      telegramNotification,
    });

    console.log('📅 Booking created:', booking.id);
    if (telegramNotification) {
      console.log('📱 Telegram notification would be sent for booking:', booking.id);
    }

    res.json({
      ...booking,
      serviceName: service.name,
      price: service.price,
      duration: service.duration,
    });
  } catch (error) {
    console.error('❌ Booking error:', error);
    res.status(500).json({ error: 'Ошибка при создании записи' });
  }
});

// Получение записей пользователя
app.get('/api/bookings/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await db.getUserBookings(userId);
    res.json(bookings);
  } catch (error) {
    console.error('❌ Get bookings error:', error);
    res.status(500).json({ error: 'Ошибка при получении записей' });
  }
});

// Привязка Telegram
app.post('/api/telegram/link', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const linkCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    await db.createTelegramLink(userId, linkCode);

    console.log('🔗 Telegram link code created:', linkCode);

    res.json({ linkCode });
  } catch (error) {
    console.error('❌ Telegram link error:', error);
    res.status(500).json({ error: 'Ошибка при создании кода привязки' });
  }
});

// Проверка привязки Telegram
app.get('/api/telegram/check-link/:code', authenticateToken, async (req, res) => {
  try {
    const { code } = req.params;

    const link = await db.getTelegramLinkByCode(code);

    if (link && link.is_verified) {
      res.json({
        linked: true,
        telegramId: link.telegram_id,
        telegramUsername: link.telegram_username,
      });
    } else {
      res.json({ linked: false });
    }
  } catch (error) {
    console.error('❌ Check link error:', error);
    res.status(500).json({ error: 'Ошибка при проверке кода' });
  }
});

// Отвязка Telegram
app.post('/api/telegram/unlink', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await db.unlinkTelegram(userId);

    res.json({ message: 'Telegram успешно отвязан' });
  } catch (error) {
    console.error('❌ Unlink telegram error:', error);
    res.status(500).json({ error: 'Ошибка при отвязке Telegram' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database: ${db.dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down...');
  db.close();
  process.exit(0);
});
