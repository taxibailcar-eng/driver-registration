import React, { useState, useEffect } from 'react';
import { createVehicle, uploadVehiclePhoto } from '../services/api';

const VehicleForm = ({ initialData, driverId, onComplete, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    registrationPlate: '',
    vinNumber: '',
    category: '',
    isOwned: false,
    isCivilContract: true,
    contractParty: '',
    contractNumber: '',
    contractDate: '',
    contractExpiryDate: '',
    paymentOrderNumber: '',
    paymentDate: '',
    applicationDate: new Date().toISOString().slice(0, 16),
    vehicleClasses: [],
    transportTypes: [],
  });
  const [photos, setPhotos] = useState({
    front: null,
    back: null,
    left: null,
    right: null,
    interior1: null,
    interior2: null,
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

  const handlePhotoChange = async (photoType, file) => {
    if (!file) return;

    // Показываем превью
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotos(prev => ({
        ...prev,
        [photoType]: {
          file,
          preview: e.target.result,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Создаём ТС
      const vehicleData = {
        ...formData,
        driverId,
      };
      const result = await createVehicle(vehicleData);
      const vehicleId = result.vehicleId;

      // Загружаем фотографии
      const photoTypes = ['front', 'back', 'left', 'right', 'interior1', 'interior2'];
      for (const photoType of photoTypes) {
        if (photos[photoType]?.file) {
          await uploadVehiclePhoto(vehicleId, photos[photoType].file, photoType);
        }
      }

      onComplete(vehicleId);
    } catch (error) {
      console.error('Ошибка создания ТС:', error);
      alert('Ошибка при сохранении данных: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const photoLabels = {
    front: 'Фотография транспортного средства - ракурс спереди',
    back: 'Фотография транспортного средства - ракурс сзади',
    left: 'Фотография транспортного средства - ракурс слева (с регистрационным знаком)',
    right: 'Фотография транспортного средства - ракурс справа (с регистрационным знаком)',
    interior1: 'Фотография внутреннего оформления салона - ракурс 1',
    interior2: 'Фотография внутреннего оформления салона - ракурс 2 (с видеорегистратором)',
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
          <h2 className="mb-0">Раздел II: Сведения в отношении транспортного средства</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Основные данные */}
            <div className="mb-4">
              <h5 className="section-title">Основные данные транспортного средства</h5>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label required-field">Регистрационный знак</label>
                  <input
                    type="text"
                    className="form-control"
                    name="registrationPlate"
                    value={formData.registrationPlate}
                    onChange={handleChange}
                    required
                    maxLength={50}
                    placeholder="9584AI8"
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label required-field">Идентификационный номер кузова (шасси)</label>
                  <input
                    type="text"
                    className="form-control"
                    name="vinNumber"
                    value={formData.vinNumber}
                    onChange={handleChange}
                    required
                    maxLength={50}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label required-field">Категория транспортного средства</label>
                  <select
                    className="form-control"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Выберите категорию</option>
                    <option value="М1">М1</option>
                    <option value="М2">М2</option>
                    <option value="М3">М3</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Принадлежность ТС */}
            <div className="mb-4">
              <h5 className="section-title">Сведения о принадлежности транспортного средства</h5>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isOwned"
                      name="isOwned"
                      checked={formData.isOwned}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="isOwned">
                      Собственный
                    </label>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isCivilContract"
                      name="isCivilContract"
                      checked={formData.isCivilContract}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="isCivilContract">
                      Право пользования на основании гражданско-правового договора
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Договор */}
            {formData.isCivilContract && (
              <div className="mb-4">
                <h5 className="section-title">Право пользования на основании гражданско-правового договора</h5>
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <label className="form-label required-field">
                      Полное наименование стороны гражданско-правового договора предоставляющего право пользования транспортным средством (либо ФИО)
                    </label>
                    <textarea
                      className="form-control"
                      name="contractParty"
                      value={formData.contractParty}
                      onChange={handleChange}
                      rows={2}
                      maxLength={200}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label required-field">Номер договора</label>
                    <input
                      type="text"
                      className="form-control"
                      name="contractNumber"
                      value={formData.contractNumber}
                      onChange={handleChange}
                      maxLength={50}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label required-field">Дата заключения договора</label>
                    <input
                      type="date"
                      className="form-control"
                      name="contractDate"
                      value={formData.contractDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label required-field">Срок действия договора</label>
                    <input
                      type="date"
                      className="form-control"
                      name="contractExpiryDate"
                      value={formData.contractExpiryDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Виды перевозок */}
            <div className="mb-4">
              <h5 className="section-title">Виды выполняемых автомобильных перевозок пассажиров в нерегулярном сообщении</h5>
              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="transportTaxi"
                    checked={formData.transportTypes.includes('АТ')}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...formData.transportTypes, 'АТ']
                        : formData.transportTypes.filter(t => t !== 'АТ');
                      setFormData(prev => ({ ...prev, transportTypes: newTypes }));
                    }}
                  />
                  <label className="form-check-label" htmlFor="transportTaxi">
                    АТ (автомобильные перевозки такси)
                  </label>
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

            {/* Фотографии */}
            <div className="mb-4">
              <h5 className="section-title">Приложение - список фотографий</h5>
              <div className="row">
                {Object.entries(photoLabels).map(([key, label]) => (
                  <div key={key} className="col-md-6 mb-3">
                    <label className="form-label required-field">{label}</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) => handlePhotoChange(key, e.target.files[0])}
                    />
                    {photos[key]?.preview && (
                      <img
                        src={photos[key].preview}
                        alt={label}
                        className="photo-preview"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Дата создания заявления */}
            <div className="mb-4">
              <h5 className="section-title">Дата создания заявления</h5>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label required-field">Дата и время</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    name="applicationDate"
                    value={formData.applicationDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Кнопки */}
            <div className="d-flex justify-content-between">
              <button type="button" className="btn btn-secondary" onClick={onBack}>
                Назад
              </button>
              <button type="submit" className="btn btn-success" disabled={loading}>
                Завершить регистрацию
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehicleForm;