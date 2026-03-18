import React, { useState, useEffect } from 'react';
import { createDriver } from '../services/api';

const DriverForm = ({ initialData, onComplete, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    identificationNumber: '',
    documentBelarus: true,
    documentForeign: false,
    medicalCertificateNumber: '',
    medicalIssuedBy: '',
    medicalIssueDate: '',
    medicalExpiryDate: '',
    moreThan5Years: false,
    performsTaxiTransport: false,
    ipIsDriver: false,
    trainingDocumentNumber: '',
    trainingIssuedBy: '',
    trainingIssueDate: '',
    paymentOrderNumber: '',
    paymentDate: '',
    phones: [''],
    emails: [''],
    qualifications: [{ series: '', number: '', issuedBy: '', issueDate: '' }],
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePhoneChange = (index, value) => {
    const newPhones = [...formData.phones];
    newPhones[index] = value;
    setFormData(prev => ({ ...prev, phones: newPhones }));
  };

  const addPhone = () => {
    setFormData(prev => ({ ...prev, phones: [...prev.phones, ''] }));
  };

  const removePhone = (index) => {
    const newPhones = formData.phones.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, phones: newPhones }));
  };

  const handleEmailChange = (index, value) => {
    const newEmails = [...formData.emails];
    newEmails[index] = value;
    setFormData(prev => ({ ...prev, emails: newEmails }));
  };

  const addEmail = () => {
    setFormData(prev => ({ ...prev, emails: [...prev.emails, ''] }));
  };

  const removeEmail = (index) => {
    const newEmails = formData.emails.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, emails: newEmails }));
  };

  const handleQualificationChange = (index, field, value) => {
    const newQuals = [...formData.qualifications];
    newQuals[index] = { ...newQuals[index], [field]: value };
    setFormData(prev => ({ ...prev, qualifications: newQuals }));
  };

  const addQualification = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, { series: '', number: '', issuedBy: '', issueDate: '' }],
    }));
  };

  const removeQualification = (index) => {
    const newQuals = formData.qualifications.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, qualifications: newQuals }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createDriver(formData);
      onComplete(result.driverId);
    } catch (error) {
      console.error('Ошибка создания водителя:', error);
      alert('Ошибка при сохранении данных: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      {loading && (
        <div className="spinner-overlay">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Сохранение...</span>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="mb-0">Раздел II: Сведения в отношении водителя</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Личная информация */}
            <div className="mb-4">
              <h5 className="section-title">Личная информация о водителе</h5>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label required-field">Фамилия</label>
                  <input
                    type="text"
                    className="form-control"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label required-field">Собственное имя</label>
                  <input
                    type="text"
                    className="form-control"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Отчество</label>
                  <input
                    type="text"
                    className="form-control"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    maxLength={100}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label required-field">Идентификационный номер</label>
                  <input
                    type="text"
                    className="form-control"
                    name="identificationNumber"
                    value={formData.identificationNumber}
                    onChange={handleChange}
                    required
                    maxLength={15}
                  />
                </div>
              </div>
            </div>

            {/* Документ, удостоверяющий личность */}
            <div className="mb-4">
              <h5 className="section-title">Сведения в отношении документа, удостоверяющего личность водителя</h5>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="documentBelarus"
                      name="documentBelarus"
                      checked={formData.documentBelarus}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="documentBelarus">
                      Выдан в Республике Беларусь (паспорт, вид на жительство, удостоверение беженца)
                    </label>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="documentForeign"
                      name="documentForeign"
                      checked={formData.documentForeign}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="documentForeign">
                      Выдан государственным органом иного государства
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Контактные данные */}
            <div className="mb-4">
              <h5 className="section-title">Контактные данные</h5>
              
              {/* Телефоны */}
              <div className="mb-3">
                <label className="form-label">Номера телефонов</label>
                {formData.phones.map((phone, index) => (
                  <div key={index} className="input-group mb-2">
                    <input
                      type="tel"
                      className="form-control"
                      value={phone}
                      onChange={(e) => handlePhoneChange(index, e.target.value)}
                      placeholder="+375XXXXXXXXX"
                    />
                    {formData.phones.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => removePhone(index)}
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={addPhone}>
                  + Добавить телефон
                </button>
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label">E-mail</label>
                {formData.emails.map((email, index) => (
                  <div key={index} className="input-group mb-2">
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      placeholder="example@mail.com"
                    />
                    {formData.emails.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => removeEmail(index)}
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={addEmail}>
                  + Добавить email
                </button>
              </div>
            </div>

            {/* Медицинская справка */}
            <div className="mb-4">
              <h5 className="section-title">Сведения о медицинской справке</h5>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label required-field">Номер медицинской справки</label>
                  <input
                    type="text"
                    className="form-control"
                    name="medicalCertificateNumber"
                    value={formData.medicalCertificateNumber}
                    onChange={handleChange}
                    maxLength={10}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label required-field">Кем выдана</label>
                  <textarea
                    className="form-control"
                    name="medicalIssuedBy"
                    value={formData.medicalIssuedBy}
                    onChange={handleChange}
                    rows={2}
                    maxLength={200}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label required-field">Дата выдачи</label>
                  <input
                    type="date"
                    className="form-control"
                    name="medicalIssueDate"
                    value={formData.medicalIssueDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label required-field">Срок действия</label>
                  <input
                    type="date"
                    className="form-control"
                    name="medicalExpiryDate"
                    value={formData.medicalExpiryDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Дополнительные вопросы */}
            <div className="mb-4">
              <h5 className="section-title">Дополнительные сведения</h5>
              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="moreThan5Years"
                    name="moreThan5Years"
                    checked={formData.moreThan5Years}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="moreThan5Years">
                    С даты получения категории на право управления транспортным средством, используемым для перевозки пассажиров в нерегулярном сообщении, в том числе автомобилями такси, прошло более 5 лет?
                  </label>
                </div>
              </div>
              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="performsTaxiTransport"
                    name="performsTaxiTransport"
                    checked={formData.performsTaxiTransport}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="performsTaxiTransport">
                    Водитель выполняет автомобильные перевозки пассажиров автомобилями-такси?
                  </label>
                </div>
              </div>
              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="ipIsDriver"
                    name="ipIsDriver"
                    checked={formData.ipIsDriver}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="ipIsDriver">
                    Автомобильный перевозчик – индивидуальный предприниматель является водителем?
                  </label>
                </div>
              </div>
            </div>

            {/* Повышение квалификации */}
            <div className="mb-4">
              <h5 className="section-title">Сведения о повышении квалификации водителей</h5>
              {formData.qualifications.map((qual, index) => (
                <div key={index} className="card mb-3">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3 mb-3">
                        <label className="form-label">Серия свидетельства</label>
                        <input
                          type="text"
                          className="form-control"
                          value={qual.series}
                          onChange={(e) => handleQualificationChange(index, 'series', e.target.value)}
                          maxLength={10}
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <label className="form-label">Номер свидетельства</label>
                        <input
                          type="text"
                          className="form-control"
                          value={qual.number}
                          onChange={(e) => handleQualificationChange(index, 'number', e.target.value)}
                          maxLength={20}
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <label className="form-label">Кем выдано</label>
                        <input
                          type="text"
                          className="form-control"
                          value={qual.issuedBy}
                          onChange={(e) => handleQualificationChange(index, 'issuedBy', e.target.value)}
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <label className="form-label">Дата выдачи</label>
                        <input
                          type="date"
                          className="form-control"
                          value={qual.issueDate}
                          onChange={(e) => handleQualificationChange(index, 'issueDate', e.target.value)}
                        />
                      </div>
                    </div>
                    {formData.qualifications.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeQualification(index)}
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-outline-primary btn-sm" onClick={addQualification}>
                + Добавить свидетельство
              </button>
            </div>

            {/* Обучение */}
            <div className="mb-4">
              <h5 className="section-title">Сведения об обучении</h5>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label required-field">Номер документа об обучении</label>
                  <input
                    type="text"
                    className="form-control"
                    name="trainingDocumentNumber"
                    value={formData.trainingDocumentNumber}
                    onChange={handleChange}
                    maxLength={10}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label required-field">Кем выдана</label>
                  <input
                    type="text"
                    className="form-control"
                    name="trainingIssuedBy"
                    value={formData.trainingIssuedBy}
                    onChange={handleChange}
                    maxLength={200}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label required-field">Дата выдачи</label>
                  <input
                    type="date"
                    className="form-control"
                    name="trainingIssueDate"
                    value={formData.trainingIssueDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Оплата */}
            <div className="mb-4">
              <h5 className="section-title">Сведения об оплате</h5>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label required-field">Номер платежного поручения (№ операции в ЕРИП)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="paymentOrderNumber"
                    value={formData.paymentOrderNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label required-field">Дата платежа</label>
                  <input
                    type="date"
                    className="form-control"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Кнопки */}
            <div className="d-flex justify-content-between">
              <button type="button" className="btn btn-secondary" onClick={onBack}>
                Назад
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                Продолжить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DriverForm;