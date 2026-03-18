const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

/**
 * Сервис для работы с PDF документами
 */
class PdfService {
  /**
   * Конвертация изображения в PDF
   * @param {Buffer} imageBuffer - Буфер изображения
   * @param {Object} options - Опции конвертации
   * @returns {Promise<Buffer>} - PDF документ
   */
  async convertImageToPdf(imageBuffer, options = {}) {
    const {
      pageSize = 'A4',
      fitToPage = true,
      quality = 85
    } = options;

    // Создаём PDF документ
    const pdfDoc = await PDFDocument.create();

    // Конвертируем изображение в JPEG если нужно
    const jpegBuffer = await sharp(imageBuffer)
      .jpeg({ quality })
      .toBuffer();

    // Встраиваем изображение в PDF
    const image = await pdfDoc.embedJpg(jpegBuffer);

    // Определяем размер страницы
    const pageWidth = 595.28; // A4 в пунктах
    const pageHeight = 841.89;

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Масштабируем изображение под размер страницы
    const imgWidth = image.width;
    const imgHeight = image.height;

    let scale = 1;
    if (fitToPage) {
      const scaleX = (pageWidth - 40) / imgWidth;
      const scaleY = (pageHeight - 40) / imgHeight;
      scale = Math.min(scaleX, scaleY);
    }

    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    // Центрируем изображение
    const x = (pageWidth - scaledWidth) / 2;
    const y = (pageHeight - scaledHeight) / 2;

    page.drawImage(image, {
      x,
      y,
      width: scaledWidth,
      height: scaledHeight
    });

    // Сохраняем PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Конвертация нескольких изображений в один PDF
   * @param {Array<Buffer>} imageBuffers - Массив буферов изображений
   * @param {Object} options - Опции конвертации
   * @returns {Promise<Buffer>} - PDF документ
   */
  async convertImagesToPdf(imageBuffers, options = {}) {
    const {
      pageSize = 'A4',
      quality = 85
    } = options;

    const pdfDoc = await PDFDocument.create();
    const pageWidth = 595.28;
    const pageHeight = 841.89;

    for (const imageBuffer of imageBuffers) {
      // Конвертируем в JPEG
      const jpegBuffer = await sharp(imageBuffer)
        .jpeg({ quality })
        .toBuffer();

      // Встраиваем изображение
      const image = await pdfDoc.embedJpg(jpegBuffer);

      // Добавляем страницу
      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      // Масштабируем
      const scaleX = (pageWidth - 40) / image.width;
      const scaleY = (pageHeight - 40) / image.height;
      const scale = Math.min(scaleX, scaleY);

      const scaledWidth = image.width * scale;
      const scaledHeight = image.height * scale;

      const x = (pageWidth - scaledWidth) / 2;
      const y = (pageHeight - scaledHeight) / 2;

      page.drawImage(image, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight
      });
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Сохранение PDF файла
   * @param {Buffer} pdfBuffer - Буфер PDF
   * @param {string} directory - Директория для сохранения
   * @param {string} prefix - Префикс имени файла
   * @returns {Promise<Object>} - Информация о сохранённом файле
   */
  async savePdf(pdfBuffer, directory, prefix = 'document') {
    const filename = `${prefix}_${uuidv4()}.pdf`;
    const filepath = path.join(directory, filename);

    await fs.writeFile(filepath, pdfBuffer);

    return {
      filename,
      filepath,
      size: pdfBuffer.length
    };
  }

  /**
   * Извлечение изображений из PDF
   * @param {Buffer} pdfBuffer - Буфер PDF
   * @returns {Promise<Array<Buffer>>} - Массив изображений
   */
  async extractImagesFromPdf(pdfBuffer) {
    // Примечание: pdf-lib не поддерживает извлечение изображений
    // Для этой функции потребуется дополнительная библиотека
    // Возвращаем пустой массив для совместимости
    console.warn('Извлечение изображений из PDF требует дополнительной библиотеки');
    return [];
  }

  /**
   * Получение информации о PDF
   * @param {Buffer} pdfBuffer - Буфер PDF
   * @returns {Promise<Object>} - Информация о PDF
   */
  async getPdfInfo(pdfBuffer) {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      
      return {
        pageCount: pdfDoc.getPageCount(),
        title: pdfDoc.getTitle() || '',
        author: pdfDoc.getAuthor() || '',
        subject: pdfDoc.getSubject() || '',
        creator: pdfDoc.getCreator() || '',
        producer: pdfDoc.getProducer() || '',
        creationDate: pdfDoc.getCreationDate(),
        modificationDate: pdfDoc.getModificationDate()
      };
    } catch (error) {
      console.error('Ошибка при чтении PDF:', error);
      return null;
    }
  }
}

module.exports = new PdfService();