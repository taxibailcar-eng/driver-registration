const fs = require('fs');
const path = require('path');
const db = require('../models/database');

async function initDatabase() {
  try {
    console.log('Начинаем инициализацию базы данных...');

    // Читаем SQL схему
    const schemaPath = path.join(__dirname, '../../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Выполняем SQL
    await db.query(schema);

    console.log('База данных успешно инициализирована!');
    console.log('Созданы таблицы:');
    console.log('  - drivers');
    console.log('  - vehicles');
    console.log('  - phones');
    console.log('  - emails');
    console.log('  - qualifications');
    console.log('  - vehicle_classes');
    console.log('  - transport_types');
    console.log('  - documents');
    console.log('  - vehicle_photos');

    process.exit(0);
  } catch (error) {
    console.error('Ошибка инициализации базы данных:', error);
    process.exit(1);
  }
}

initDatabase();