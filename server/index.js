require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('./database/db');
const TelegramBot = require('./telegram/bot');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware для логирования всех запросов
app.use((req, res, next) => {
  console.log('🌐 Incoming request:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    'user-agent': req.headers['user-agent'],
  });
  next();
});

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
      ];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log('CORS blocked for origin:', origin);
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Обработка OPTIONS запросов
app.options('*', cors());

app.use(express.json());

// Инициализация базы данных
const db = new Database();

// Инициализация Telegram бота (если токен указан)
let bot = null;
if (process.env.TELEGRAM_BOT_TOKEN) {
  try {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, db);
    bot.start();
    console.log('✅ Telegram bot initialized');
  } catch (error) {
    console.error('❌ Telegram bot initialization failed:', error.message);
  }
} else {
  console.log('ℹ️ Telegram bot token not provided, bot disabled');
}

// Health check - ДОЛЖЕН БЫТЬ ПЕРВЫМ
app.get('/api/health', (req, res) => {
  console.log('✅ Health check called');
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'Connected',
    telegramBot: bot ? 'Active' : 'Disabled',
  });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phoneOrEmail, password } = req.body;

    console.log('📥 Login request:', { phoneOrEmail });

    // Ищем пользователя по email или телефону
    const user = await db.findUserByPhoneOrEmail(phoneOrEmail);
    if (!user) {
      console.log('❌ User not found:', phoneOrEmail);
      return res.status(401).json({
        error: 'Пользователь не найден',
      });
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', user.email);
      return res.status(401).json({
        error: 'Неверный пароль',
      });
    }

    // Генерируем JWT токен
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' },
    );

    console.log('✅ User logged in successfully:', user.id);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        telegramConnected: !!user.telegram_id,
        telegramId: user.telegram_id,
        telegramUsername: user.telegram_username,
      },
      token,
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      error: 'Ошибка при входе: ' + error.message,
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, surname, phone, email, password } = req.body;

    console.log('📥 Registration request:', { name, surname, phone, email });

    // Проверяем, существует ли пользователь
    const existingUser = (await db.findUserByEmail(email)) || (await db.findUserByPhone(phone));
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({
        error: 'Пользователь с таким email или телефоном уже существует',
      });
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = await db.createUser({
      name,
      surname,
      phone,
      email,
      passwordHash,
      role: 'client',
    });

    // Генерируем JWT токен
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' },
    );

    console.log('✅ User registered successfully:', user.id);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        telegramConnected: false,
      },
      token,
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      error: 'Ошибка при регистрации: ' + error.message,
    });
  }
});

app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('📥 Admin login request:', { email });

    const user = await db.findUserByEmail(email);
    if (!user || user.role !== 'admin') {
      console.log('❌ Admin access denied for:', email);
      return res.status(401).json({
        error: 'Доступ запрещен',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      console.log('❌ Invalid admin password for:', email);
      return res.status(401).json({
        error: 'Неверный пароль',
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' },
    );

    console.log('✅ Admin logged in successfully:', user.id);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        telegramConnected: !!user.telegram_id,
      },
      token,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      error: 'Ошибка при входе администратора',
    });
  }
});

// Services routes
app.get('/api/services', async (req, res) => {
  try {
    console.log('📥 Fetching services from database');
    const services = await db.getServices();
    console.log('✅ Services fetched:', services.length);
    res.json(services);
  } catch (error) {
    console.error('❌ Error fetching services:', error);
    res.status(500).json({
      error: 'Failed to fetch services',
      message: error.message,
    });
  }
});

// Bookings routes
app.post('/api/bookings', async (req, res) => {
  try {
    console.log('📥 Creating booking:', req.body);
    const { serviceId, date, time, comment, telegramNotification } = req.body;

    // Временный ID пользователя для демо
    const userId = 1;

    const booking = await db.createBooking({
      userId,
      serviceId,
      bookingDate: date,
      bookingTime: time,
      comment,
      telegramNotification,
    });

    // Получаем информацию об услуге для уведомления
    const service = await db.getServiceById(serviceId);

    // Отправляем уведомление в Telegram если включено
    if (telegramNotification && bot) {
      try {
        await bot.sendBookingConfirmation(userId, {
          serviceName: service.name,
          date,
          time,
          price: service.price,
          duration: service.duration,
        });
      } catch (tgError) {
        console.error('Telegram notification failed:', tgError);
      }
    }

    console.log('✅ Booking created:', booking.id);
    res.json(booking);
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    res.status(500).json({
      error: 'Failed to create booking',
      message: error.message,
    });
  }
});

app.get('/api/bookings/my', async (req, res) => {
  try {
    // Временный ID пользователя для демо
    const userId = 1;

    const bookings = await db.getUserBookings(userId);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      error: 'Ошибка при загрузке записей',
    });
  }
});

// Telegram routes
app.post('/api/telegram/link', async (req, res) => {
  try {
    // Временный ID пользователя для демо
    const userId = 1;

    const linkCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    await db.createTelegramLink(userId, linkCode);

    console.log('✅ Telegram link created:', linkCode);

    res.json({ linkCode });
  } catch (error) {
    console.error('Error creating telegram link:', error);
    res.status(500).json({
      error: 'Ошибка при создании ссылки',
    });
  }
});

app.get('/api/telegram/check-link/:code', async (req, res) => {
  try {
    const { code } = req.params;

    console.log('📥 Checking telegram link:', code);

    const link = await db.getTelegramLinkByCode(code);

    if (link && link.is_verified) {
      console.log('✅ Telegram link verified:', code);
      res.json({
        linked: true,
        telegramId: link.telegram_id,
        telegramUsername: link.telegram_username,
      });
    } else {
      console.log('❌ Telegram link not verified:', code);
      res.json({ linked: false });
    }
  } catch (error) {
    console.error('Error checking telegram link:', error);
    res.status(500).json({
      error: 'Ошибка при проверке ссылки',
    });
  }
});

app.post('/api/telegram/unlink', async (req, res) => {
  try {
    // Временный ID пользователя для демо
    const userId = 1;

    await db.unlinkTelegram(userId);

    console.log('✅ Telegram unlinked for user:', userId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error unlinking telegram:', error);
    res.status(500).json({
      error: 'Ошибка при отвязке Telegram',
    });
  }
});

// Обработка несуществующих маршрутов API
app.use('/api/*', (req, res) => {
  console.log('❌ API endpoint not found:', req.originalUrl);
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Обработка корневого пути
app.get('/', (req, res) => {
  res.json({
    message: 'Cosmetology API Server',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/login, /api/auth/register',
      services: '/api/services',
      bookings: '/api/bookings',
      telegram: '/api/telegram/link, /api/telegram/check-link/:code',
    },
  });
});

// Обработка всех остальных маршрутов
app.use('*', (req, res) => {
  console.log('❌ Route not found:', req.originalUrl);
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 JWT secret: ${process.env.JWT_SECRET ? 'Set' : 'Using fallback'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  if (bot) {
    bot.stop();
  }
  db.close();
  process.exit(0);
});
