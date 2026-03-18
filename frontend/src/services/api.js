import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Документы
export const uploadDocument = async (file, documentType, driverId = null, vehicleId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);
  if (driverId) formData.append('driverId', driverId);
  if (vehicleId) formData.append('vehicleId', vehicleId);

  const response = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getDocument = async (id) => {
  const response = await api.get(`/documents/${id}`);
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};

// Водители
export const createDriver = async (driverData) => {
  const response = await api.post('/drivers', driverData);
  return response.data;
};

export const getDriver = async (id) => {
  const response = await api.get(`/drivers/${id}`);
  return response.data;
};

export const updateDriver = async (id, driverData) => {
  const response = await api.put(`/drivers/${id}`, driverData);
  return response.data;
};

// Транспортные средства
export const createVehicle = async (vehicleData) => {
  const response = await api.post('/vehicles', vehicleData);
  return response.data;
};

export const getVehicle = async (id) => {
  const response = await api.get(`/vehicles/${id}`);
  return response.data;
};

export const updateVehicle = async (id, vehicleData) => {
  const response = await api.put(`/vehicles/${id}`, vehicleData);
  return response.data;
};

export const uploadVehiclePhoto = async (vehicleId, photoFile, photoType) => {
  const formData = new FormData();
  formData.append('photo', photoFile);
  formData.append('photoType', photoType);

  const response = await api.post(`/vehicles/${vehicleId}/photos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default api;