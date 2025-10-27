require('dotenv').config();
const Database = require('./database/db');

async function forceDeleteUsers() {
  const db = new Database();

  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    console.log('💥 FORCE DELETING ALL USERS...');

    // Отключаем foreign keys для удаления
    await new Promise((resolve, reject) => {
      db.db.run('PRAGMA foreign_keys = OFF', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Удаляем данные из связанных таблиц ПЕРВЫМИ
    const tables = ['telegram_links', 'bookings', 'notifications', 'users'];

    for (const table of tables) {
      await new Promise((resolve, reject) => {
        db.db.run(`DELETE FROM ${table}`, function (err) {
          if (err) {
            reject(err);
          } else {
            console.log(`✅ Deleted ${this.changes} records from ${table}`);
            resolve();
          }
        });
      });
    }

    // Включаем foreign keys обратно
    await new Promise((resolve, reject) => {
      db.db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Проверяем что таблицы пустые
    const checkTables = ['users', 'telegram_links', 'bookings', 'notifications'];

    for (const table of checkTables) {
      const count = await new Promise((resolve, reject) => {
        db.db.get(`SELECT COUNT(*) as count FROM ${table}`, [], (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        });
      });
      console.log(`📊 ${table}: ${count} records remaining`);
    }

    console.log('\n🎉 ALL USERS AND RELATED DATA COMPLETELY DELETED!');
  } catch (error) {
    console.error('❌ Error during force delete:', error);
  } finally {
    db.close();
  }
}

forceDeleteUsers();
