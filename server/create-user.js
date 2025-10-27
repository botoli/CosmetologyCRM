require('dotenv').config();
const Database = require('./database/db');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  const db = new Database();

  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    console.log('👤 Creating test user...');

    const passwordHash = await bcrypt.hash('standrey2007', 10);

    await db.createUser({
      email: 'standrey2007@mail.com',
      phone: '+79911472476',
      passwordHash: passwordHash,
      name: 'Тестовый',
      surname: 'Пользователь',
      role: 'client',
    });

    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@user.ru');
    console.log('🔑 Password: test123');
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    db.close();
  }
}

createTestUser();
