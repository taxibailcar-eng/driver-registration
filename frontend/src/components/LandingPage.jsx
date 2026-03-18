import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadDocument } from '../services/api';

const LandingPage = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    passport: null,
    medical: null,
    qualification: null,
    training: null,
    vehicleRegistration: null,
    contract: null,
    paymentDriver: null,
    paymentVehicle: null,
  });
  const [extractedData, setExtractedData] = useState({
    driver: {},
    vehicle: {},
  });

  const documentTypes = [
    { key: 'passport', label: 'Паспорт / Удостоверение личности', type: 'passport' },
    { key: 'medical', label: 'Медицинская справка', type: 'medical' },
    { key: 'qualification', label: 'Свидетельство о повышении квалификации', type: 'qualification' },
    { key: 'training', label: 'Документ об обучении', type: 'training' },
    { key: 'vehicleRegistration', label: 'Свидетельство о регистрации ТС (техпаспорт)', type: 'vehicle_registration' },
    { key: 'contract', label: 'Договор аренды/лизинга', type: 'contract' },
    { key: 'paymentDriver', label: 'Платёжное поручение (водитель)', type: 'payment' },
    { key: 'paymentVehicle', label: 'Платёжное поручение (ТС)', type: 'payment' },
  ];

  const onDrop = useCallback(async (acceptedFiles, documentType) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setLoading(true);

    try {
      const result = await uploadDocument(file, documentType);
      
      setUploadedFiles(prev => ({
        ...prev,
        [documentType]: {
          file,
          filename: result.filename,
          documentId: result.documentId,
        }
      }));

      // Объединяем извлечённые данные
      if (result.extractedData) {
        if (['passport', 'medical', 'qualification', 'training'].includes(documentType)) {
          setExtractedData(prev => ({
            ...prev,
            driver: { ...prev.driver, ...result.extractedData }
          }));
        } else if (['vehicleRegistration', 'contract'].includes(documentType)) {
          setExtractedData(prev => ({
            ...prev,
            vehicle: { ...prev.vehicle, ...result.extractedData }
          }));
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      alert('Ошибка при загрузке файла: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const DropzoneComponent = ({ docType }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files) => onDrop(files, docType.key),
      accept: {
        'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
        'application/pdf': ['.pdf'],
      },
      maxFiles: 1,
    });

    const uploaded = uploadedFiles[docType.key];

    return (
      <div className="mb-3">
        <label className="form-label fw-bold">{docType.label}</label>
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'active' : ''} ${uploaded ? 'border-success' : ''}`}
        >
          <input {...getInputProps()} />
          {uploaded ? (
            <div className="uploaded-file">
              <span className="text-success">✓</span>
              <span className="file-name">{uploaded.filename}</span>
            </div>
          ) : (
            <p className="mb-0">
              {isDragActive
                ? 'Отпустите файл здесь...'
                : 'Перетащите файл сюда или нажмите для выбора'}
            </p>
          )}
        </div>
      </div>
    );
  };

  const handleContinue = () => {
    const hasDriverDocs = uploadedFiles.passport || uploadedFiles.medical;
    const hasVehicleDocs = uploadedFiles.vehicleRegistration;

    if (!hasDriverDocs && !hasVehicleDocs) {
      alert('Пожалуйста, загрузите хотя бы один документ');
      return;
    }

    onComplete({
      driverData: extractedData.driver,
      vehicleData: extractedData.vehicle,
      uploadedFiles,
    });
  };

  const handleSkip = () => {
    onComplete({
      driverData: {},
      vehicleData: {},
      uploadedFiles: {},
    });
  };

  return (
    <div className="container mt-4">
      {loading && (
        <div className="spinner-overlay">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="mb-0">Загрузка документов</h2>
        </div>
        <div className="card-body">
          <p className="text-muted mb-4">
            Загрузите документы для автоматического заполнения формы. 
            Система распознает текст и заполнит соответствующие поля.
          </p>

          <div className="row">
            <div className="col-md-6">
              <h5 className="section-title">Документы водителя</h5>
              {documentTypes.slice(0, 4).map(docType => (
                <DropzoneComponent key={docType.key} docType={docType} />
              ))}
            </div>
            <div className="col-md-6">
              <h5 className="section-title">Документы транспортного средства</h5>
              {documentTypes.slice(4).map(docType => (
                <DropzoneComponent key={docType.key} docType={docType} />
              ))}
            </div>
          </div>

          {Object.values(extractedData.driver).some(v => v) && (
            <div className="alert alert-info mt-4">
              <h6>Распознанные данные водителя:</h6>
              <ul className="mb-0">
                {extractedData.driver.lastName && <li>Фамилия: {extractedData.driver.lastName}</li>}
                {extractedData.driver.firstName && <li>Имя: {extractedData.driver.firstName}</li>}
                {extractedData.driver.identificationNumber && <li>Идентификационный номер: {extractedData.driver.identificationNumber}</li>}
              </ul>
            </div>
          )}

          {Object.values(extractedData.vehicle).some(v => v) && (
            <div className="alert alert-info mt-3">
              <h6>Распознанные данные ТС:</h6>
              <ul className="mb-0">
                {extractedData.vehicle.registrationPlate && <li>Гос. номер: {extractedData.vehicle.registrationPlate}</li>}
                {extractedData.vehicle.vinNumber && <li>VIN: {extractedData.vehicle.vinNumber}</li>}
                {extractedData.vehicle.category && <li>Категория: {extractedData.vehicle.category}</li>}
              </ul>
            </div>
          )}

          <div className="d-flex justify-content-between mt-4">
            <button 
              className="btn btn-outline-secondary"
              onClick={handleSkip}
            >
              Пропустить и заполнить вручную
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleContinue}
              disabled={loading}
            >
              Продолжить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;