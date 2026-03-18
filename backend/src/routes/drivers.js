const express = require('express');
const router = express.Router();
const db = require('../models/database');

// POST /api/drivers - Создание водителя
router.post('/', async (req, res) => {
  try {
    const {
      lastName, firstName, middleName, identificationNumber,
      documentBelarus, documentForeign,
      medicalCertificateNumber, medicalIssuedBy, medicalIssueDate, medicalExpiryDate,
      moreThan5Years, performsTaxiTransport, ipIsDriver,
      trainingDocumentNumber, trainingIssuedBy, trainingIssueDate,
      paymentOrderNumber, paymentDate,
      phones, emails, qualifications
    } = req.body;

    const result = await db.transaction(async (client) => {
      // Создаём водителя
      const driverResult = await client.query(
        `INSERT INTO drivers (
          last_name, first_name, middle_name, identification_number,
          document_belarus, document_foreign,
          medical_certificate_number, medical_issued_by, medical_issue_date, medical_expiry_date,
          more_than_5_years, performs_taxi_transport, ip_is_driver,
          training_document_number, training_issued_by, training_issue_date,
          payment_order_number, payment_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING id`,
        [
          lastName, firstName, middleName, identificationNumber,
          documentBelarus !== false, documentForeign === true,
          medicalCertificateNumber, medicalIssuedBy, medicalIssueDate, medicalExpiryDate,
          moreThan5Years === true, performsTaxiTransport === true, ipIsDriver === true,
          trainingDocumentNumber, trainingIssuedBy, trainingIssueDate,
          paymentOrderNumber, paymentDate
        ]
      );

      const driverId = driverResult.rows[0].id;

      // Добавляем телефоны
      if (phones && phones.length > 0) {
        for (const phone of phones) {
          await client.query(
            'INSERT INTO phones (driver_id, phone_number) VALUES ($1, $2)',
            [driverId, phone]
          );
        }
      }

      // Добавляем email
      if (emails && emails.length > 0) {
        for (const email of emails) {
          await client.query(
            'INSERT INTO emails (driver_id, email) VALUES ($1, $2)',
            [driverId, email]
          );
        }
      }

      // Добавляем квалификации
      if (qualifications && qualifications.length > 0) {
        for (const qual of qualifications) {
          await client.query(
            'INSERT INTO qualifications (driver_id, series, number, issued_by, issue_date) VALUES ($1, $2, $3, $4, $5)',
            [driverId, qual.series, qual.number, qual.issuedBy, qual.issueDate]
          );
        }
      }

      return driverId;
    });

    res.json({ success: true, driverId: result });
  } catch (error) {
    console.error('Ошибка создания водителя:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/drivers/:id - Получение водителя
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const driverResult = await db.query('SELECT * FROM drivers WHERE id = $1', [id]);
    if (driverResult.rows.length === 0) {
      return res.status(404).json({ error: 'Водитель не найден' });
    }

    const driver = driverResult.rows[0];

    // Получаем телефоны
    const phonesResult = await db.query('SELECT phone_number FROM phones WHERE driver_id = $1', [id]);
    driver.phones = phonesResult.rows.map(r => r.phone_number);

    // Получаем email
    const emailsResult = await db.query('SELECT email FROM emails WHERE driver_id = $1', [id]);
    driver.emails = emailsResult.rows.map(r => r.email);

    // Получаем квалификации
    const qualResult = await db.query('SELECT * FROM qualifications WHERE driver_id = $1', [id]);
    driver.qualifications = qualResult.rows;

    res.json(driver);
  } catch (error) {
    console.error('Ошибка получения водителя:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/drivers/:id - Обновление водителя
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      lastName, firstName, middleName, identificationNumber,
      documentBelarus, documentForeign,
      medicalCertificateNumber, medicalIssuedBy, medicalIssueDate, medicalExpiryDate,
      moreThan5Years, performsTaxiTransport, ipIsDriver,
      trainingDocumentNumber, trainingIssuedBy, trainingIssueDate,
      paymentOrderNumber, paymentDate
    } = req.body;

    await db.query(
      `UPDATE drivers SET
        last_name = $1, first_name = $2, middle_name = $3, identification_number = $4,
        document_belarus = $5, document_foreign = $6,
        medical_certificate_number = $7, medical_issued_by = $8, medical_issue_date = $9, medical_expiry_date = $10,
        more_than_5_years = $11, performs_taxi_transport = $12, ip_is_driver = $13,
        training_document_number = $14, training_issued_by = $15, training_issue_date = $16,
        payment_order_number = $17, payment_date = $18,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $19`,
      [
        lastName, firstName, middleName, identificationNumber,
        documentBelarus !== false, documentForeign === true,
        medicalCertificateNumber, medicalIssuedBy, medicalIssueDate, medicalExpiryDate,
        moreThan5Years === true, performsTaxiTransport === true, ipIsDriver === true,
        trainingDocumentNumber, trainingIssuedBy, trainingIssueDate,
        paymentOrderNumber, paymentDate,
        id
      ]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления водителя:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;