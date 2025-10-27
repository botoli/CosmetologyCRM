require('dotenv').config();
const Database = require('./database/db');

async function listUsers() {
  const db = new Database();

  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    console.log('📋 Listing all users...');

    const users = await new Promise((resolve, reject) => {
      db.db.all('SELECT id, email, phone, name, surname, role FROM users', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('\n👥 Existing users:');
    users.forEach((user) => {
      console.log(
        `ID: ${user.id} | ${user.name} ${user.surname} | ${user.email} | ${user.phone} | ${user.role}`,
      );
    });

    if (users.length === 0) {
      console.log('❌ No users found in database');
    }
  } catch (error) {
    console.error('❌ Error listing users:', error);
  } finally {
    db.close();
  }
}

listUsers();
