import React, { useState } from 'react';
import ServiceSelection from './ServiceSelection';
import DateTimeSelection from './DateTimeSelection';
import Confirmation from './Confirmation';
import Success from './Success';

const BookingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    service: null,
    date: null,
    time: null,
    comment: '',
    telegramNotification: false,
  });

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);
  const resetFlow = () => {
    setCurrentStep(1);
    setBookingData({
      service: null,
      date: null,
      time: null,
      comment: '',
      telegramNotification: false,
    });
  };

  const updateBookingData = (data) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  const steps = [
    { number: 1, title: 'Услуга', icon: '💫' },
    { number: 2, title: 'Дата и время', icon: '📅' },
    { number: 3, title: 'Подтверждение', icon: '✅' },
    { number: 4, title: 'Готово', icon: '🎉' },
  ];

  return (
    <div className="container">
      {/* Progress Indicator */}
      <div className="progress-container">
        <div className="booking-progress">
          {steps.map((step, index) => (
            <div key={step.number} className="progress-step-container">
              <div
                className={`progress-step ${currentStep >= step.number ? 'active' : ''} ${
                  currentStep > step.number ? 'completed' : ''
                }`}>
                {currentStep > step.number ? (
                  <span className="step-icon">✓</span>
                ) : (
                  <span className="step-number">{step.icon}</span>
                )}
              </div>
              <span className={`step-title ${currentStep >= step.number ? 'active' : ''}`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`step-connector ${currentStep > step.number ? 'active' : ''}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="step-content">
        {currentStep === 1 && (
          <ServiceSelection data={bookingData} updateData={updateBookingData} nextStep={nextStep} />
        )}

        {currentStep === 2 && (
          <DateTimeSelection
            data={bookingData}
            updateData={updateBookingData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {currentStep === 3 && (
          <Confirmation
            data={bookingData}
            updateData={updateBookingData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {currentStep === 4 && <Success data={bookingData} onNewBooking={resetFlow} />}
      </div>
    </div>
  );
};

export default BookingFlow;
