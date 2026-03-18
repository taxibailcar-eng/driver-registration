const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../models/database');
const fileService = require('../services/fileService');

// Настройка multer для загрузки фото
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Файл должен быть изображением'), false);
    }
  }
});

// POST /api/vehicles - Создание транспортного средства
router.post('/', async (req, res) => {
  try {
    const {
      driverId, registrationPlate, vinNumber, category,
      isOwned, isCivilContract,
      contractParty, contractNumber, contractDate, contractExpiryDate,
      paymentOrderNumber, paymentDate, applicationDate,
      vehicleClasses, transportTypes
    } = req.body;

    const result = await db.transaction(async (client) => {
      // Создаём ТС
      const vehicleResult = await client.query(
        `INSERT INTO vehicles (
          driver_id, registration_plate, vin_number, category,
          is_owned, is_civil_contract,
          contract_party, contract_number, contract_date, contract_expiry_date,
          payment_order_number, payment_date, application_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id`,
        [
          driverId, registrationPlate, vinNumber, category,
          isOwned === true, isCivilContract !== false,
          contractParty, contractNumber, contractDate, contractExpiryDate,
          paymentOrderNumber, paymentDate, applicationDate
        ]
      );

      const vehicleId = vehicleResult.rows[0].id;

      // Добавляем классы ТС
      if (vehicleClasses && vehicleClasses.length > 0) {
        for (const className of vehicleClasses) {
          await client.query(
            'INSERT INTO vehicle_classes (vehicle_id, class_name) VALUES ($1, $2)',
            [vehicleId, className]
          );
        }
      }

      // Добавляем виды перевозок
      if (transportTypes && transportTypes.length > 0) {
        for (const typeCode of transportTypes) {
          await client.query(
            'INSERT INTO transport_types (vehicle_id, type_code) VALUES ($1, $2)',
            [vehicleId, typeCode]
          );
        }
      }

      return vehicleId;
    });

    res.json({ success: true, vehicleId: result });
  } catch (error) {
    console.error('Ошибка создания ТС:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/vehicles/:id - Получение ТС
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const vehicleResult = await db.query('SELECT * FROM vehicles WHERE id = $1', [id]);
    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Транспортное средство не найдено' });
    }

    const vehicle = vehicleResult.rows[0];

    // Получаем классы
    const classesResult = await db.query('SELECT class_name FROM vehicle_classes WHERE vehicle_id = $1', [id]);
    vehicle.vehicleClasses = classesResult.rows.map(r => r.class_name);

    // Получаем виды перевозок
    const typesResult = await db.query('SELECT type_code FROM transport_types WHERE vehicle_id = $1', [id]);
    vehicle.transportTypes = typesResult.rows.map(r => r.type_code);

    // Получаем фотографии
    const photosResult = await db.query('SELECT * FROM vehicle_photos WHERE vehicle_id = $1', [id]);
    vehicle.photos = photosResult.rows;

    res.json(vehicle);
  } catch (error) {
    console.error('Ошибка получения ТС:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/vehicles/:id/photos - Загрузка фотографий ТС
router.post('/:id/photos', upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { photoType } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    if (!photoType) {
      return res.status(400).json({ error: 'Не указан тип фотографии' });
    }

    // Проверяем существование ТС
    const vehicleResult = await db.query('SELECT id FROM vehicles WHERE id = $1', [id]);
    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Транспортное средство не найдено' });
    }

    // Обрабатываем фото
    const result = await fileService.processVehiclePhoto(req.file, photoType);

    // Сохраняем в БД
    const dbResult = await db.query(
      `INSERT INTO vehicle_photos (vehicle_id, photo_type, file_path, original_filename, file_size)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [id, photoType, result.filepath, result.originalFilename, result.size]
    );

    res.json({
      success: true,
      photoId: dbResult.rows[0].id,
      filename: result.filename
    });
  } catch (error) {
    console.error('Ошибка загрузки фото:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/vehicles/:id - Обновление ТС
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      registrationPlate, vinNumber, category,
      isOwned, isCivilContract,
      contractParty, contractNumber, contractDate, contractExpiryDate,
      paymentOrderNumber, paymentDate, applicationDate
    } = req.body;

    await db.query(
      `UPDATE vehicles SET
        registration_plate = $1, vin_number = $2, category = $3,
        is_owned = $4, is_civil_contract = $5,
        contract_party = $6, contract_number = $7, contract_date = $8, contract_expiry_date = $9,
        payment_order_number = $10, payment_date = $11, application_date = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13`,
      [
        registrationPlate, vinNumber, category,
        isOwned === true, isCivilContract !== false,
        contractParty, contractNumber, contractDate, contractExpiryDate,
        paymentOrderNumber, paymentDate, applicationDate,
        id
      ]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления ТС:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;