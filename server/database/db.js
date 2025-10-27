const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, 'cosmetology.db');
    this.init();
  }

  init() {
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err);
      } else {
        console.log('✅ Connected to SQLite database');
        this.createTables();
        this.seedInitialData();
      }
    });
  }

  createTables() {
    const schema = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        surname VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'client' CHECK(role IN ('client', 'admin')),
        telegram_id VARCHAR(100),
        telegram_username VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        duration INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        service_id INTEGER NOT NULL,
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')),
        comment TEXT,
        telegram_notification BOOLEAN DEFAULT FALSE,
        notification_sent BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (service_id) REFERENCES services (id)
      );

      CREATE TABLE IF NOT EXISTS telegram_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        link_code VARCHAR(10) UNIQUE NOT NULL,
        telegram_id VARCHAR(100),
        telegram_username VARCHAR(100),
        is_verified BOOLEAN DEFAULT FALSE,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        booking_id INTEGER,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_sent BOOLEAN DEFAULT FALSE,
        sent_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (booking_id) REFERENCES bookings (id)
      );
    `;

    this.db.exec(schema, (err) => {
      if (err) {
        console.error('❌ Error creating tables:', err);
      } else {
        console.log('✅ Database tables initialized');
      }
    });
  }

  async seedInitialData() {
    try {
      const adminExists = await new Promise((resolve) => {
        this.db.get("SELECT id FROM users WHERE email = 'admin@cosmetology.ru'", (err, row) => {
          resolve(!!row);
        });
      });

      if (!adminExists) {
        const adminPasswordHash = await bcrypt.hash('admin123', 10);
        await this.createUser({
          email: 'admin@cosmetology.ru',
          phone: '+79990000000',
          passwordHash: adminPasswordHash,
          name: 'Администратор',
          surname: 'Системы',
          role: 'admin',
        });
        console.log('✅ Admin user created');
      }

      // ПРОВЕРЯЕМ СУЩЕСТВУЮЩИЕ УСЛУГИ ПО ИМЕНИ, а не просто наличие любой услуги
      const servicesExist = await new Promise((resolve) => {
        this.db.get(
          "SELECT id FROM services WHERE name = 'Ультразвуковая чистка лица'",
          (err, row) => {
            resolve(!!row);
          },
        );
      });

      if (!servicesExist) {
        const initialServices = [
          {
            name: 'Ультразвуковая чистка лица',
            category: 'Чистка лица',
            description: 'Глубокая очистка пор с помощью ультразвука',
            price: 1800.0,
            duration: 60,
          },
          {
            name: 'Комбинированная чистка лица',
            category: 'Чистка лица',
            description: 'Комплексная чистка с ручной и аппаратной обработкой',
            price: 2500.0,
            duration: 90,
          },
          {
            name: 'Массаж лица комбинированный',
            category: 'Массаж лица',
            description: 'Расслабляющий и тонизирующий массаж',
            price: 1500.0,
            duration: 45,
          },
          {
            name: 'S-уход',
            category: 'Уход лица с массажем',
            description: 'Базовый уход за кожей лица',
            price: 1500.0,
            duration: 45,
          },
        ];

        for (const service of initialServices) {
          await this.createService(service);
        }
        console.log('✅ Initial services created');
      } else {
        console.log('✅ Services already exist, skipping creation');
      }
    } catch (error) {
      console.error('Error seeding initial data:', error);
    }
  }

  // User methods
  async createUser(userData) {
    return new Promise((resolve, reject) => {
      const { email, phone, passwordHash, name, surname, role = 'client' } = userData;

      const sql = `INSERT INTO users (email, phone, password_hash, name, surname, role) 
                   VALUES (?, ?, ?, ?, ?, ?)`;

      this.db.run(sql, [email, phone, passwordHash, name, surname, role], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            email,
            phone,
            name,
            surname,
            role,
            telegramConnected: false,
          });
        }
      });
    });
  }

  async findUserByEmail(email) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE';

      this.db.get(sql, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async findUserByPhone(phone) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE phone = ? AND is_active = TRUE';

      this.db.get(sql, [phone], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async findUserById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE id = ? AND is_active = TRUE';

      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async findUserByPhoneOrEmail(phoneOrEmail) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE (email = ? OR phone = ?) AND is_active = TRUE';

      this.db.get(sql, [phoneOrEmail, phoneOrEmail], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Service methods
  async createService(serviceData) {
    return new Promise((resolve, reject) => {
      const { name, category, description, price, duration } = serviceData;

      const sql = `INSERT INTO services (name, category, description, price, duration) 
                   VALUES (?, ?, ?, ?, ?)`;

      this.db.run(sql, [name, category, description, price, duration], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            ...serviceData,
          });
        }
      });
    });
  }

  async getServices() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM services WHERE is_active = TRUE ORDER BY category, name';

      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getServiceById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM services WHERE id = ? AND is_active = TRUE';

      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Booking methods
  async createBooking(bookingData) {
    return new Promise((resolve, reject) => {
      const {
        userId,
        serviceId,
        bookingDate,
        bookingTime,
        comment,
        telegramNotification = false,
      } = bookingData;

      const sql = `INSERT INTO bookings (user_id, service_id, booking_date, booking_time, comment, telegram_notification) 
                   VALUES (?, ?, ?, ?, ?, ?)`;

      this.db.run(
        sql,
        [userId, serviceId, bookingDate, bookingTime, comment, telegramNotification],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              ...bookingData,
              status: 'confirmed',
            });
          }
        },
      );
    });
  }

  async getUserBookings(userId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT b.*, s.name as service_name, s.price, s.duration
                   FROM bookings b
                   JOIN services s ON b.service_id = s.id
                   WHERE b.user_id = ?
                   ORDER BY b.booking_date DESC, b.booking_time DESC`;

      this.db.all(sql, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Telegram methods
  async createTelegramLink(userId, linkCode) {
    return new Promise((resolve, reject) => {
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const sql = `INSERT INTO telegram_links (user_id, link_code, expires_at) 
                   VALUES (?, ?, ?)`;

      this.db.run(sql, [userId, linkCode, expiresAt.toISOString()], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, userId, linkCode, expiresAt });
        }
      });
    });
  }

  async getTelegramLinkByCode(code) {
    return new Promise((resolve, reject) => {
      const sql =
        'SELECT * FROM telegram_links WHERE link_code = ? AND expires_at > datetime("now")';

      this.db.get(sql, [code], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async verifyTelegramLink(code, telegramId, telegramUsername) {
    return new Promise((resolve, reject) => {
      const self = this; // Сохраняем контекст

      // Сначала находим ссылку
      self.db.get(
        'SELECT * FROM telegram_links WHERE link_code = ? AND is_verified = FALSE AND expires_at > datetime("now")',
        [code],
        (err, link) => {
          if (err) {
            reject(err);
            return;
          }

          if (!link) {
            reject(new Error('Invalid or expired link code'));
            return;
          }

          // Обновляем запись в telegram_links
          self.db.run(
            `UPDATE telegram_links 
             SET telegram_id = ?, telegram_username = ?, is_verified = TRUE 
             WHERE link_code = ?`,
            [telegramId, telegramUsername, code],
            function (updateErr) {
              if (updateErr) {
                reject(updateErr);
                return;
              }

              // Обновляем пользователя
              self.db.run(
                `UPDATE users 
                 SET telegram_id = ?, telegram_username = ? 
                 WHERE id = ?`,
                [telegramId, telegramUsername, link.user_id],
                function (userUpdateErr) {
                  if (userUpdateErr) {
                    reject(userUpdateErr);
                  } else {
                    resolve({
                      userId: link.user_id,
                      telegramId,
                      telegramUsername,
                    });
                  }
                },
              );
            },
          );
        },
      );
    });
  }

  async unlinkTelegram(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE users SET telegram_id = NULL, telegram_username = NULL WHERE id = ?';

      this.db.run(sql, [userId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ userId });
        }
      });
    });
  }

  async getUserByTelegramId(telegramId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE telegram_id = ? AND is_active = TRUE';

      this.db.get(sql, [telegramId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = Database;
