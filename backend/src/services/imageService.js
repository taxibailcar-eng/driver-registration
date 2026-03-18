const sharp = require('sharp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Сервис для сжатия и обработки изображений
 */
class ImageService {
  /**
   * Сжатие изображения без потери качества до 1MB
   * @param {Buffer} buffer - Буфер изображения
   * @param {Object} options - Опции сжатия
   * @returns {Promise<Buffer>} - Сжатое изображение
   */
  async compressImage(buffer, options = {}) {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      targetSize = 1024 * 1024, // 1MB
      initialQuality = 85
    } = options;

    let quality = initialQuality;
    let result = buffer;

    // Получаем информацию об изображении
    const metadata = await sharp(buffer).metadata();
    
    // Определяем нужные размеры
    let width = metadata.width;
    let height = metadata.height;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // Сжимаем изображение
    while (quality >= 50) {
      result = await sharp(buffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: quality,
          mozjpeg: true,
          progressive: true
        })
        .toBuffer();

      // Если размер подходит или качество уже минимальное
      if (result.length <= targetSize || quality <= 50) {
        break;
      }

      quality -= 5;
    }

    return result;
  }

  /**
   * Создание превью изображения
   * @param {Buffer} buffer - Буфер изображения
   * @param {number} size - Размер превью
   * @returns {Promise<Buffer>} - Превью
   */
  async createThumbnail(buffer, size = 200) {
    return sharp(buffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 70 })
      .toBuffer();
  }

  /**
   * Сохранение изображения
   * @param {Buffer} buffer - Буфер изображения
   * @param {string} directory - Директория для сохранения
   * @param {string} prefix - Префикс имени файла
   * @returns {Promise<Object>} - Информация о сохранённом файле
   */
  async saveImage(buffer, directory, prefix = 'photo') {
    const filename = `${prefix}_${uuidv4()}.jpg`;
    const filepath = path.join(directory, filename);

    await sharp(buffer).toFile(filepath);

    return {
      filename,
      filepath,
      size: buffer.length
    };
  }

  /**
   * Получение метаданных изображения
   * @param {Buffer} buffer - Буфер изображения
   * @returns {Promise<Object>} - Метаданные
   */
  async getMetadata(buffer) {
    return sharp(buffer).metadata();
  }

  /**
   * Конвертация в JPEG
   * @param {Buffer} buffer - Буфер изображения
   * @returns {Promise<Buffer>} - JPEG изображение
   */
  async convertToJpeg(buffer) {
    return sharp(buffer)
      .jpeg({ quality: 85 })
      .toBuffer();
  }
}

module.exports = new ImageService();