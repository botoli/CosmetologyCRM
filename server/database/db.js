// database/db.js - ИСПРАВЛЕННЫЙ ПУТЬ К БАЗЕ ДАННЫХ
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    // ИСПРАВЛЕНО: используем существующую базу данных cosmetology.db
    this.dbPath = path.join(__dirname, 'cosmetology.db');
    this.init();
  }

  init() {
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err.message);
      } else {
        console.log('✅ Connected to SQLite database:', this.dbPath);
        this.createTables();
      }
    });
  }

  createTables() {
    // УБИРАЕМ создание тестовых данных, чтобы не было ошибок
    const queries = [
      // Users table - только если не существует
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        surname TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'client',
        telegram_id TEXT,
        telegram_username TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Services table - только если не существует
      `CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        duration INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Bookings table - только если не существует
      `CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        service_id INTEGER NOT NULL,
        booking_date TEXT NOT NULL,
        booking_time TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        comment TEXT,
        telegram_notification BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (service_id) REFERENCES services (id)
      )`,

      // Telegram links table - только если не существует
      `CREATE TABLE IF NOT EXISTS telegram_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        link_code TEXT UNIQUE NOT NULL,
        telegram_id TEXT,
        telegram_username TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        verified_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
    ];

    queries.forEach((query, index) => {
      this.db.run(query, (err) => {
        if (err) {
          console.error(`❌ Error creating table ${index + 1}:`, err.message);
        } else {
          console.log(`✅ Table ${index + 1} checked/created`);
        }
      });
    });
  }

  // User methods
  findUserByEmail(email) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  findUserByPhone(phone) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE phone = ?', [phone], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  findUserByPhoneOrEmail(phoneOrEmail) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE phone = ? OR email = ?',
        [phoneOrEmail, phoneOrEmail],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        },
      );
    });
  }

  findUserById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  createUser(userData) {
    return new Promise((resolve, reject) => {
      const { name, surname, phone, email, passwordHash, role } = userData;
      this.db.run(
        'INSERT INTO users (name, surname, phone, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
        [name, surname, phone, email, passwordHash, role],
        function (err) {
          if (err) reject(err);
          else
            resolve({
              id: this.lastID,
              name,
              surname,
              phone,
              email,
              role,
            });
        },
      );
    });
  }

  // Service methods
  getServices() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM services ORDER BY name', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getServiceById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM services WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  createService(serviceData) {
    return new Promise((resolve, reject) => {
      const { name, category, description, price, duration } = serviceData;
      this.db.run(
        'INSERT INTO services (name, category, description, price, duration) VALUES (?, ?, ?, ?, ?)',
        [name, category, description, price, duration],
        function (err) {
          if (err) reject(err);
          else
            resolve({
              id: this.lastID,
              name,
              category,
              description,
              price,
              duration,
            });
        },
      );
    });
  }

  updateService(id, serviceData) {
    return new Promise((resolve, reject) => {
      const { name, category, description, price, duration } = serviceData;
      this.db.run(
        'UPDATE services SET name = ?, category = ?, description = ?, price = ?, duration = ? WHERE id = ?',
        [name, category, description, price, duration, id],
        function (err) {
          if (err) reject(err);
          else
            resolve({
              id,
              name,
              category,
              description,
              price,
              duration,
            });
        },
      );
    });
  }

  deleteService(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM services WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  // Booking methods
  createBooking(bookingData) {
    return new Promise((resolve, reject) => {
      const { userId, serviceId, bookingDate, bookingTime, comment, telegramNotification } =
        bookingData;

      this.db.run(
        'INSERT INTO bookings (user_id, service_id, booking_date, booking_time, comment, telegram_notification) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, serviceId, bookingDate, bookingTime, comment, telegramNotification],
        function (err) {
          if (err) {
            reject(err);
            return;
          }

          // Возвращаем базовую информацию о записи
          resolve({
            id: this.lastID,
            user_id: userId,
            service_id: serviceId,
            booking_date: bookingDate,
            booking_time: bookingTime,
            status: 'pending',
            comment: comment,
            telegram_notification: telegramNotification,
          });
        },
      );
    });
  }

  getBookingById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT b.*, 
                u.name as user_name, 
                u.surname as user_surname, 
                u.email as user_email, 
                u.phone as user_phone,
                u.telegram_id as user_telegram_id,
                s.name as service_name, 
                s.price as service_price,
                s.duration as service_duration
         FROM bookings b
         JOIN users u ON b.user_id = u.id
         JOIN services s ON b.service_id = s.id
         WHERE b.id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        },
      );
    });
  }

  getUserBookings(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT b.*, s.name as service_name, s.price as service_price
         FROM bookings b
         JOIN services s ON b.service_id = s.id
         WHERE b.user_id = ?
         ORDER BY b.booking_date DESC, b.booking_time DESC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        },
      );
    });
  }

  getAllBookings() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT b.*, 
                u.name as user_name, 
                u.surname as user_surname, 
                u.email as user_email, 
                u.phone as user_phone,
                s.name as service_name, 
                s.price as service_price,
                s.duration as service_duration
         FROM bookings b
         JOIN users u ON b.user_id = u.id
         JOIN services s ON b.service_id = s.id
         ORDER BY b.booking_date DESC, b.booking_time DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        },
      );
    });
  }

  getBookingsByDate(date) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT b.*, s.duration as service_duration
         FROM bookings b
         JOIN services s ON b.service_id = s.id
         WHERE b.booking_date = ? AND b.status != 'cancelled'
         ORDER BY b.booking_time`,
        [date],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        },
      );
    });
  }

  updateBookingStatus(id, status) {
    return new Promise((resolve, reject) => {
      this.db.run('UPDATE bookings SET status = ? WHERE id = ?', [status, id], function (err) {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  deleteBooking(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM bookings WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  // Client methods
  getClients() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT u.*, 
                COUNT(b.id) as total_bookings,
                MAX(b.created_at) as last_booking
         FROM users u
         LEFT JOIN bookings b ON u.id = b.user_id
         WHERE u.role = 'client'
         GROUP BY u.id
         ORDER BY u.name, u.surname`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        },
      );
    });
  }

  getClientDetails(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT u.*, 
                COUNT(b.id) as total_bookings,
                SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
                SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
                MAX(b.created_at) as last_booking
         FROM users u
         LEFT JOIN bookings b ON u.id = b.user_id
         WHERE u.id = ?
         GROUP BY u.id`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        },
      );
    });
  }

  // Admin methods
  getAdmins() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM users 
         WHERE role = 'admin' AND telegram_id IS NOT NULL`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        },
      );
    });
  }

  // Telegram methods
  createTelegramLink(userId, linkCode) {
    return new Promise((resolve, reject) => {
      // Удаляем старые ссылки для этого пользователя
      this.db.run('DELETE FROM telegram_links WHERE user_id = ?', [userId], (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Создаем новую ссылку
        this.db.run(
          'INSERT INTO telegram_links (user_id, link_code) VALUES (?, ?)',
          [userId, linkCode],
          function (err) {
            if (err) reject(err);
            else resolve({ linkCode });
          },
        );
      });
    });
  }

  getTelegramLinkByCode(code) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT tl.*, u.name, u.surname 
         FROM telegram_links tl
         JOIN users u ON tl.user_id = u.id
         WHERE tl.link_code = ?`,
        [code],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        },
      );
    });
  }

  verifyTelegramLink(code, telegramId, telegramUsername) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Обновляем запись в telegram_links
        this.db.run(
          'UPDATE telegram_links SET is_verified = 1, telegram_id = ?, telegram_username = ?, verified_at = CURRENT_TIMESTAMP WHERE link_code = ?',
          [telegramId, telegramUsername, code],
          function (err) {
            if (err) {
              reject(err);
              return;
            }

            if (this.changes === 0) {
              reject(new Error('Link not found'));
              return;
            }

            // Получаем user_id из обновленной записи
            this.db.get(
              'SELECT user_id FROM telegram_links WHERE link_code = ?',
              [code],
              (err, row) => {
                if (err) {
                  reject(err);
                  return;
                }

                // Обновляем пользователя
                this.db.run(
                  'UPDATE users SET telegram_id = ?, telegram_username = ? WHERE id = ?',
                  [telegramId, telegramUsername, row.user_id],
                  function (err) {
                    if (err) reject(err);
                    else
                      resolve({
                        userId: row.user_id,
                        telegramId,
                        telegramUsername,
                      });
                  },
                );
              },
            );
          },
        );
      });
    });
  }

  unlinkTelegram(userId) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Удаляем запись в telegram_links
        this.db.run('DELETE FROM telegram_links WHERE user_id = ?', [userId], (err) => {
          if (err) {
            reject(err);
            return;
          }

          // Обновляем пользователя
          this.db.run(
            'UPDATE users SET telegram_id = NULL, telegram_username = NULL WHERE id = ?',
            [userId],
            function (err) {
              if (err) reject(err);
              else resolve({ success: true });
            },
          );
        });
      });
    });
  }

  // Close database connection
  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err.message);
        } else {
          console.log('✅ Database connection closed');
        }
      });
    }
  }
}

module.exports = Database;
