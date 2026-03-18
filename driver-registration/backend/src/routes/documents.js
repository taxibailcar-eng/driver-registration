const express = require('express');
const router = express.Router();
const multer = require('multer');
const fileService = require('../services/fileService');
const db = require('../models/sqlite');

// Настройка multer для загрузки файлов
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Неподдерживаемый тип файла'), false);
    }
  }
});

// POST /api/documents/upload - Загрузка документа
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const { documentType, driverId, vehicleId } = req.body;

    if (!documentType) {
      return res.status(400).json({ error: 'Не указан тип документа' });
    }

    const result = await fileService.processDocument(req.file, documentType);

    const dbResult = await db.query(
      `INSERT INTO documents (driver_id, vehicle_id, document_type, file_path, original_filename, file_size, ocr_text)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [driverId || null, vehicleId || null, documentType, result.filepath, result.originalFilename, result.size, result.ocrText]
    );

    res.json({
      success: true,
      documentId: dbResult.rows[0].id,
      filename: result.filename,
      extractedData: result.extractedData,
      ocrText: result.ocrText
    });
  } catch (error) {
    console.error('Ошибка загрузки документа:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/documents/:id - Получение информации о документе
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM documents WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Документ не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка получения документа:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/documents/:id - Удаление документа
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const docResult = await db.query('SELECT * FROM documents WHERE id = $1', [id]);

    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Документ не найден' });
    }

    const document = docResult.rows[0];
    await fileService.deleteFile(document.file_path);
    await db.query('DELETE FROM documents WHERE id = $1', [id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления документа:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;