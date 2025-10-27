require('dotenv').config();
const Database = require('./database/db');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  const db = new Database();

  // Ждем инициализации базы данных
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    console.log('🔄 Resetting admin password...');

    // Хешируем правильный пароль
    const newPasswordHash = await bcrypt.hash('admin123', 10);

    // Обновляем пароль админа
    await new Promise((resolve, reject) => {
      db.db.run(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [newPasswordHash, 'admin@cosmetology.ru'],
        function (err) {
          if (err) {
            reject(err);
          } else {
            console.log('✅ Admin password reset successfully');
            console.log('📧 Email: admin@cosmetology.ru');
            console.log('🔑 Password: admin123');
            resolve();
          }
        },
      );
    });
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
  } finally {
    db.close();
  }
}

resetAdminPassword();
