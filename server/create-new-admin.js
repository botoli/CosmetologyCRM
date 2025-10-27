require('dotenv').config();
const Database = require('./database/db');
const bcrypt = require('bcryptjs');

async function createNewAdmin() {
  const db = new Database();

  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    console.log('👑 Creating NEW admin user...');

    const passwordHash = await bcrypt.hash('admin123', 10);

    // Используем УНИКАЛЬНЫЙ телефон
    const user = await db.createUser({
      email: 'admin@cosmetology.ru',
      phone: '+79998887766', // ИЗМЕНИЛ ТЕЛЕФОН
      passwordHash: passwordHash,
      name: 'Администратор',
      surname: 'Системы',
      role: 'admin',
    });

    console.log('✅ NEW admin created successfully!');
    console.log('📧 Email: admin@cosmetology.ru');
    console.log('🔑 Password: admin123');
    console.log('📱 Phone: +79998887766');
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    db.close();
  }
}

createNewAdmin();
