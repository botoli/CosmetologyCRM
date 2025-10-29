// database/fix_typos.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

function fixTypos() {
  const dbPath = path.join(__dirname, 'cosmetology.db');
  const db = new sqlite3.Database(dbPath);

  const fixQueries = [
    `UPDATE services 
     SET name = REPLACE(
                REPLACE(
                    REPLACE(name, 'ВИКИНИ', 'бикини'),
                'Викини', 'бикини'),
            'викини', 'бикини')
     WHERE LOWER(name) LIKE '%викини%'`,

    // Добавьте другие исправления при необходимости
    `UPDATE services 
     SET name = REPLACE(name, 'чистка лица', 'Чистка лица')
     WHERE name LIKE '%чистка лица%'`,
  ];

  fixQueries.forEach((query, index) => {
    db.run(query, function (err) {
      if (err) {
        console.error(`❌ Error executing fix query ${index + 1}:`, err);
      } else {
        console.log(`✅ Fix query ${index + 1} executed. Changes:`, this.changes);
      }
    });
  });

  db.close();
}

// Проверить текущие данные перед исправлением
function checkCurrentData() {
  const dbPath = path.join(__dirname, 'cosmetology.db');
  const db = new sqlite3.Database(dbPath);

  db.all("SELECT id, name FROM services WHERE LOWER(name) LIKE '%викини%'", (err, rows) => {
    if (err) {
      console.error('Error checking data:', err);
    } else {
      console.log('📊 Current services with "викини":', rows);
    }
    db.close();
  });
}

module.exports = { fixTypos, checkCurrentData };
