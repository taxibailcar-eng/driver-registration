const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Путь к файлу базы данных
const dbPath = path.join(__dirname, '../../data/driver_registration.db');

// Создаём директорию для БД если не существует
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Подключение к SQLite
const db = new Database(dbPath);

// Включаем WAL режим для лучшей производительности
db.pragma('journal_mode = WAL');

// Инициализация таблиц
function initDatabase() {
  db.exec(`
    -- Водители
    CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      last_name TEXT NOT NULL,
      first_name TEXT NOT NULL,
      middle_name TEXT,
      identification_number TEXT NOT NULL,
      document_belarus INTEGER DEFAULT 1,
      document_foreign INTEGER DEFAULT 0,
      medical_certificate_number TEXT,
      medical_issued_by TEXT,
      medical_issue_date TEXT,
      medical_expiry_date TEXT,
      more_than_5_years INTEGER DEFAULT 0,
      performs_taxi_transport INTEGER DEFAULT 0,
      ip_is_driver INTEGER DEFAULT 0,
      training_document_number TEXT,
      training_issued_by TEXT,
      training_issue_date TEXT,
      payment_order_number INTEGER,
      payment_date TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Транспортные средства
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
      registration_plate TEXT NOT NULL,
      vin_number TEXT NOT NULL,
      category TEXT NOT NULL,
      is_owned INTEGER DEFAULT 0,
      is_civil_contract INTEGER DEFAULT 1,
      contract_party TEXT,
      contract_number TEXT,
      contract_date TEXT,
      contract_expiry_date TEXT,
      payment_order_number INTEGER,
      payment_date TEXT,
      application_date TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Телефоны
    CREATE TABLE IF NOT EXISTS phones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
      phone_number TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Email
    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Квалификации
    CREATE TABLE IF NOT EXISTS qualifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
      series TEXT,
      number TEXT,
      issued_by TEXT,
      issue_date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Классы ТС
    CREATE TABLE IF NOT EXISTS vehicle_classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
      class_name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Виды перевозок
    CREATE TABLE IF NOT EXISTS transport_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
      type_code TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Документы
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
      vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
      document_type TEXT NOT NULL,
      file_path TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      file_size INTEGER,
      ocr_text TEXT,
      uploaded_at TEXT DEFAULT (datetime('now'))
    );

    -- Фотографии ТС
    CREATE TABLE IF NOT EXISTS vehicle_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
      photo_type TEXT NOT NULL,
      file_path TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      file_size INTEGER,
      uploaded_at TEXT DEFAULT (datetime('now'))
    );

    -- Индексы
    CREATE INDEX IF NOT EXISTS idx_drivers_identification ON drivers(identification_number);
    CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(registration_plate);
    CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin_number);
    CREATE INDEX IF NOT EXISTS idx_documents_driver ON documents(driver_id);
    CREATE INDEX IF NOT EXISTS idx_documents_vehicle ON documents(vehicle_id);
    CREATE INDEX IF NOT EXISTS idx_photos_vehicle ON vehicle_photos(vehicle_id);
  `);
  
  console.log('SQLite база данных инициализирована');
}

// Инициализируем при загрузке
initDatabase();

// Экспортируем обёртку для совместимости с PostgreSQL кодом
module.exports = {
  query: (sql, params = []) => {
    try {
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const stmt = db.prepare(sql);
        return { rows: stmt.all(...params) };
      } else if (sql.trim().toUpperCase().startsWith('INSERT')) {
        const stmt = db.prepare(sql);
        const result = stmt.run(...params);
        return { rows: [{ id: result.lastInsertRowid }] };
      } else {
        const stmt = db.prepare(sql);
        stmt.run(...params);
        return { rows: [] };
      }
    } catch (error) {
      console.error('SQLite error:', error);
      throw error;
    }
  },
  
  transaction: (callback) => {
    const transaction = db.transaction(callback);
    return transaction(db);
  },
  
  end: () => {
    db.close();
  }
};