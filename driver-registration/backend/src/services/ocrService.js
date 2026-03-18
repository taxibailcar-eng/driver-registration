const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');

/**
 * Сервис для OCR распознавания текста
 */
class OcrService {
  constructor() {
    this.worker = null;
    this.initialized = false;
  }

  /**
   * Инициализация воркера Tesseract
   */
  async initialize() {
    if (this.initialized) return;

    try {
      this.worker = await Tesseract.createWorker('rus+eng');
      this.initialized = true;
      console.log('OCR сервис инициализирован');
    } catch (error) {
      console.error('Ошибка инициализации OCR:', error);
      throw error;
    }
  }

  /**
   * Распознавание текста из изображения
   * @param {Buffer|string} image - Буфер изображения или путь к файлу
   * @returns {Promise<string>} - Распознанный текст
   */
  async recognizeText(image) {
    await this.initialize();

    try {
      // Если передан буфер, конвертируем в формат для Tesseract
      let imageSource = image;
      
      if (Buffer.isBuffer(image)) {
        // Улучшаем изображение для лучшего распознавания
        const processedBuffer = await this.preprocessImage(image);
        imageSource = processedBuffer;
      }

      const result = await this.worker.recognize(imageSource);
      return result.data.text;
    } catch (error) {
      console.error('Ошибка распознавания текста:', error);
      throw error;
    }
  }

  /**
   * Предобработка изображения для улучшения распознавания
   * @param {Buffer} buffer - Буфер изображения
   * @returns {Promise<Buffer>} - Обработанное изображение
   */
  async preprocessImage(buffer) {
    return sharp(buffer)
      .grayscale() // Конвертируем в ч/б
      .normalize() // Нормализуем контраст
      .sharpen() // Увеличиваем резкость
      .toBuffer();
  }

  /**
   * Распознавание с детальными данными
   * @param {Buffer|string} image - Изображение
   * @returns {Promise<Object>} - Детальные результаты
   */
  async recognizeWithDetails(image) {
    await this.initialize();

    try {
      let imageSource = image;
      
      if (Buffer.isBuffer(image)) {
        const processedBuffer = await this.preprocessImage(image);
        imageSource = processedBuffer;
      }

      const result = await this.worker.recognize(imageSource);
      
      return {
        text: result.data.text,
        confidence: result.data.confidence,
        words: result.data.words,
        lines: result.data.lines,
        paragraphs: result.data.paragraphs
      };
    } catch (error) {
      console.error('Ошибка распознавания:', error);
      throw error;
    }
  }

  /**
   * Извлечение данных водителя из текста
   * @param {string} text - Распознанный текст
   * @returns {Object} - Извлечённые данные
   */
  extractDriverData(text) {
    const data = {};

    // Фамилия
    const lastNameMatch = text.match(/(?:фамилия|ФАМИЛИЯ)[:\s]*([А-Яа-яЁё]+)/i);
    if (lastNameMatch) data.lastName = lastNameMatch[1];

    // Имя
    const firstNameMatch = text.match(/(?:имя|ИМЯ)[:\s]*([А-Яа-яЁё]+)/i);
    if (firstNameMatch) data.firstName = firstNameMatch[1];

    // Отчество
    const middleNameMatch = text.match(/(?:отчество|ОТЧЕСТВО)[:\s]*([А-Яа-яЁё]+)/i);
    if (middleNameMatch) data.middleName = middleNameMatch[1];

    // Идентификационный номер (7 цифр + буква + 3 цифры + 2 буквы + цифра)
    const idMatch = text.match(/\b(\d{7}[A-ZА-Я]\d{3}[A-ZА-Я]{2}\d)\b/i);
    if (idMatch) data.identificationNumber = idMatch[1];

    // Номер медицинской справки
    const medicalMatch = text.match(/(?:медицинской справки|справки)[:\s]*(\d+)/i);
    if (medicalMatch) data.medicalCertificateNumber = medicalMatch[1];

    // Даты
    const dateMatches = text.match(/\d{2}\.\d{2}\.\d{4}/g);
    if (dateMatches && dateMatches.length >= 2) {
      data.medicalIssueDate = this.parseDate(dateMatches[0]);
      data.medicalExpiryDate = this.parseDate(dateMatches[1]);
    }

    return data;
  }

  /**
   * Извлечение данных транспортного средства из текста
   * @param {string} text - Распознанный текст
   * @returns {Object} - Извлечённые данные
   */
  extractVehicleData(text) {
    const data = {};

    // Регистрационный знак (белорусский формат)
    const plateMatch = text.match(/\b(\d{4}[A-ZА-Я]{2}-\d|[A-ZА-Я]{2}\d{4}[A-ZА-Я]{2})\b/i);
    if (plateMatch) data.registrationPlate = plateMatch[1];

    // VIN номер (17 символов)
    const vinMatch = text.match(/\b([A-Z0-9]{17})\b/i);
    if (vinMatch) data.vinNumber = vinMatch[1];

    // Категория ТС
    const categoryMatch = text.match(/(?:категория|Категория)[:\s]*([МM][1-3])/i);
    if (categoryMatch) data.category = categoryMatch[1].toUpperCase();

    return data;
  }

  /**
   * Парсинг даты из строки
   * @param {string} dateStr - Строка с датой (DD.MM.YYYY)
   * @returns {string|null} - Дата в формате YYYY-MM-DD
   */
  parseDate(dateStr) {
    const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`;
    }
    return null;
  }

  /**
   * Завершение работы воркера
   */
  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.initialized = false;
      console.log('OCR сервис остановлен');
    }
  }
}

module.exports = new OcrService();