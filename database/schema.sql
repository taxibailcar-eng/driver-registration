-- Схема базы данных для системы регистрации водителей и транспортных средств

-- Водители
CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    last_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    identification_number VARCHAR(15) NOT NULL,
    document_belarus BOOLEAN DEFAULT true,
    document_foreign BOOLEAN DEFAULT false,
    medical_certificate_number VARCHAR(10),
    medical_issued_by TEXT,
    medical_issue_date DATE,
    medical_expiry_date DATE,
    more_than_5_years BOOLEAN DEFAULT false,
    performs_taxi_transport BOOLEAN DEFAULT false,
    ip_is_driver BOOLEAN DEFAULT false,
    training_document_number VARCHAR(10),
    training_issued_by TEXT,
    training_issue_date DATE,
    payment_order_number BIGINT,
    payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Транспортные средства
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
    registration_plate VARCHAR(50) NOT NULL,
    vin_number VARCHAR(50) NOT NULL,
    category VARCHAR(10) NOT NULL,
    is_owned BOOLEAN DEFAULT false,
    is_civil_contract BOOLEAN DEFAULT true,
    contract_party TEXT,
    contract_number VARCHAR(50),
    contract_date DATE,
    contract_expiry_date DATE,
    payment_order_number BIGINT,
    payment_date DATE,
    application_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Телефоны водителя
CREATE TABLE IF NOT EXISTS phones (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email водителя
CREATE TABLE IF NOT EXISTS emails (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Повышение квалификации
CREATE TABLE IF NOT EXISTS qualifications (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
    series VARCHAR(10),
    number VARCHAR(20),
    issued_by TEXT,
    issue_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Классы транспортного средства
CREATE TABLE IF NOT EXISTS vehicle_classes (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    class_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Виды перевозок
CREATE TABLE IF NOT EXISTS transport_types (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    type_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Документы (сканы в PDF)
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER,
    ocr_text TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Фотографии транспортного средства
CREATE TABLE IF NOT EXISTS vehicle_photos (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    photo_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_drivers_identification ON drivers(identification_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(registration_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin_number);
CREATE INDEX IF NOT EXISTS idx_documents_driver ON documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_documents_vehicle ON documents(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_photos_vehicle ON vehicle_photos(vehicle_id);