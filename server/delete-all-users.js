require('dotenv').config();
const Database = require('./database/db');

async function deleteAllUsers() {
  const db = new Database();

  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    console.log('🗑️ Deleting all users...');

    // Сначала посчитаем сколько пользователей
    const userCount = await new Promise((resolve, reject) => {
      db.db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    console.log(`📊 Found ${userCount} users to delete`);

    if (userCount === 0) {
      console.log('✅ No users to delete');
      return;
    }

    // Удаляем всех пользователей (кроме системных если нужно)
    await new Promise((resolve, reject) => {
      db.db.run('DELETE FROM users', function (err) {
        if (err) {
          reject(err);
        } else {
          console.log(`✅ Successfully deleted ${this.changes} users`);
          resolve();
        }
      });
    });

    // Также очищаем связанные таблицы
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

    await new Promise((resolve, reject) => {
      db.db.run('DELETE FROM notifications', function (err) {
        if (err) reject(err);
        else {
          console.log(`✅ Cleared ${this.changes} notifications`);
          resolve();
        }
      });
    });

    console.log('\n🎉 Database cleaned successfully!');
    console.log('All users, bookings, and related data have been removed.');
  } catch (error) {
    console.error('❌ Error deleting users:', error);
  } finally {
    db.close();
  }
}

deleteAllUsers();
