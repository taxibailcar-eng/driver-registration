const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const imageService = require('./imageService');
const pdfService = require('./pdfService');
const ocrService = require('./ocrService');

/**
 * Сервис для обработки файлов
 */
class FileService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.documentsDir = path.join(this.uploadDir, 'documents');
    this.vehiclesDir = path.join(this.uploadDir, 'vehicles');
  }

  /**
   * Обработка документа (скана)
   * @param {Object} file - Загруженный файл
   * @param {string} documentType - Тип документа
   * @returns {Promise<Object>} - Информация о сохранённом файле и распознанные данные
   */
  async processDocument(file, documentType) {
    const { buffer, originalname, mimetype } = file;
    
    let pdfBuffer;
    let ocrText = '';
    let extractedData = {};

    try {
      // Определяем тип файла
      const isImage = mimetype.startsWith('image/');
      const isPDF = mimetype === 'application/pdf';

      if (isImage) {
        // Сжимаем изображение
        const compressedImage = await imageService.compressImage(buffer, {
          maxWidth: 2000,
          maxHeight: 2000,
          targetSize: 2 * 1024 * 1024 // 2MB для документов
        });

        // Конвертируем в PDF
        pdfBuffer = await pdfService.convertImageToPdf(compressedImage);

        // Распознаём текст
        ocrText = await ocrService.recognizeText(compressedImage);
      } else if (isPDF) {
        // PDF оставляем как есть
        pdfBuffer = buffer;

        // Для PDF нужно конвертировать страницы в изображения для OCR
        // Пока оставляем пустым, можно добавить позже
        ocrText = '';
      }

      // Извлекаем данные в зависимости от типа документа
      if (ocrText) {
        if (documentType === 'passport' || documentType === 'medical' || documentType === 'training') {
          extractedData = ocrService.extractDriverData(ocrText);
        } else if (documentType === 'vehicle_registration') {
          extractedData = ocrService.extractVehicleData(ocrText);
        }
      }

      // Сохраняем PDF
      const savedFile = await pdfService.savePdf(
        pdfBuffer,
        this.documentsDir,
        documentType
      );

      return {
        ...savedFile,
        documentType,
        originalFilename: originalname,
        ocrText,
        extractedData
      };
    } catch (error) {
      console.error('Ошибка обработки документа:', error);
      throw error;
    }
  }

  /**
   * Обработка фотографии транспортного средства
   * @param {Object} file - Загруженный файл
   * @param {string} photoType - Тип фотографии
   * @returns {Promise<Object>} - Информация о сохранённом файле
   */
  async processVehiclePhoto(file, photoType) {
    const { buffer, originalname, mimetype } = file;

    try {
      // Проверяем что это изображение
      if (!mimetype.startsWith('image/')) {
        throw new Error('Файл должен быть изображением');
      }

      // Конвертируем в JPEG если нужно
      let imageBuffer = buffer;
      if (mimetype !== 'image/jpeg') {
        imageBuffer = await imageService.convertToJpeg(buffer);
      }

      // Сжимаем до 1MB без потери качества
      const compressedImage = await imageService.compressImage(imageBuffer, {
        maxWidth: 1920,
        maxHeight: 1080,
        targetSize: 1024 * 1024, // 1MB
        initialQuality: 85
      });

      // Сохраняем изображение
      const savedFile = await imageService.saveImage(
        compressedImage,
        this.vehiclesDir,
        photoType
      );

      return {
        ...savedFile,
        photoType,
        originalFilename: originalname
      };
    } catch (error) {
      console.error('Ошибка обработки фото:', error);
      throw error;
    }
  }

  /**
   * Удаление файла
   * @param {string} filepath - Путь к файлу
   */
  async deleteFile(filepath) {
    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.error('Ошибка удаления файла:', error);
    }
  }

  /**
   * Получение информации о файле
   * @param {string} filepath - Путь к файлу
   * @returns {Promise<Object>} - Информация о файле
   */
  async getFileInfo(filepath) {
    try {
      const stats = await fs.stat(filepath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      console.error('Ошибка получения информации о файле:', error);
      return null;
    }
  }
}

module.exports = new FileService();