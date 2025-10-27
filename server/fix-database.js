require('dotenv').config();
const Database = require('./database/db');
const bcrypt = require('bcryptjs');

async function fixDatabase() {
  const db = new Database();

  await new Promise((resolve) => setTimeout(resolve, 3000));

  try {
    console.log('🔧 FIXING DATABASE...');

    // 1. Временно отключаем автоматическое создание админа
    console.log('📝 Disabling auto-admin creation...');

    // 2. Удаляем ВСЕХ пользователей
    console.log('🗑️ Deleting ALL users...');
    await new Promise((resolve, reject) => {
      db.db.run('DELETE FROM users', function (err) {
        if (err) reject(err);
        else {
          console.log(`✅ Deleted ${this.changes} users`);
          resolve();
        }
      });
    });

    // 3. Очищаем связанные таблицы
    await new Promise((resolve, reject) => {
      db.db.run('DELETE FROM telegram_links', function (err) {
        if (err) reject(err);
        else {
          console.log(`✅ Cleared ${this.changes} telegram links`);
          resolve();
        }
      });
    });

    await new Promise((resolve, reject) => {
      db.db.run('DELETE FROM bookings', function (err) {
        if (err) reject(err);
        else {
          console.log(`✅ Cleared ${this.changes} bookings`);
          resolve();
        }
      });
    });

    // 4. Создаем ЧИСТОГО админа
    console.log('👑 Creating clean admin...');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);

    await new Promise((resolve, reject) => {
      db.db.run(
        `INSERT INTO users (email, phone, password_hash, name, surname, role) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          'admin@cosmetology.ru',
          '+79998887700',
          adminPasswordHash,
          'Администратор',
          'Системы',
          'admin',
        ],
        function (err) {
          if (err) reject(err);
          else {
            console.log('✅ Admin created with ID:', this.lastID);
            resolve();
          }
        },
      );
    });

    // 5. Создаем тестового пользователя
    console.log('👤 Creating test user...');
    const userPasswordHash = await bcrypt.hash('test123', 10);

    await new Promise((resolve, reject) => {
      db.db.run(
        `INSERT INTO users (email, phone, password_hash, name, surname, role) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['test@user.ru', '+79995554400', userPasswordHash, 'Тестовый', 'Пользователь', 'client'],
        function (err) {
          if (err) reject(err);
          else {
            console.log('✅ Test user created with ID:', this.lastID);
            resolve();
          }
        },
      );
    });

    // 6. Проверяем результат
    const users = await new Promise((resolve, reject) => {
      db.db.all('SELECT id, email, phone, role FROM users ORDER BY id', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('\n📊 FINAL USERS IN DATABASE:');
    users.forEach((user) => {
      console.log(`ID: ${user.id} | ${user.email} | ${user.phone} | ${user.role}`);
    });

    console.log('\n🎉 DATABASE FIXED SUCCESSFULLY!');
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('ADMIN: admin@cosmetology.ru / admin123');
    console.log('USER:  test@user.ru / test123');
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    db.close();
  }
}

fixDatabase();
