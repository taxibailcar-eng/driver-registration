import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import DriverForm from './components/DriverForm';
import VehicleForm from './components/VehicleForm';

function App() {
  const [currentStep, setCurrentStep] = useState('landing');
  const [driverData, setDriverData] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [driverId, setDriverId] = useState(null);
  const [vehicleId, setVehicleId] = useState(null);

  const handleLandingComplete = (data) => {
    setDriverData(data.driverData);
    setVehicleData(data.vehicleData);
    setCurrentStep('driver-form');
  };

  const handleDriverFormComplete = (id) => {
    setDriverId(id);
    setCurrentStep('vehicle-form');
  };

  const handleVehicleFormComplete = (id) => {
    setVehicleId(id);
    setCurrentStep('complete');
  };

  const handleReset = () => {
    setCurrentStep('landing');
    setDriverData(null);
    setVehicleData(null);
    setDriverId(null);
    setVehicleId(null);
  };

  return (
    <div className="App">
      {currentStep === 'landing' && (
        <LandingPage onComplete={handleLandingComplete} />
      )}
      
      {currentStep === 'driver-form' && (
        <DriverForm 
          initialData={driverData}
          onComplete={handleDriverFormComplete}
          onBack={() => setCurrentStep('landing')}
        />
      )}
      
      {currentStep === 'vehicle-form' && (
        <VehicleForm 
          initialData={vehicleData}
          driverId={driverId}
          onComplete={handleVehicleFormComplete}
          onBack={() => setCurrentStep('driver-form')}
        />
      )}
      
      {currentStep === 'complete' && (
        <div className="container mt-5">
          <div className="card">
            <div className="card-body text-center">
              <h2 className="text-success mb-4">Регистрация завершена!</h2>
              <p className="mb-4">
                Водитель успешно зарегистрирован. ID водителя: <strong>{driverId}</strong>
              </p>
              <p className="mb-4">
                Транспортное средство успешно зарегистрировано. ID ТС: <strong>{vehicleId}</strong>
              </p>
              <button 
                className="btn btn-primary"
                onClick={handleReset}
              >
                Начать новую регистрацию
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;