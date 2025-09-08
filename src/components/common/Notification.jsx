import React, { useState, useEffect } from 'react';

const Notification = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose();
      }, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-primary/30 border-primary text-white shadow-lg';
      case 'error':
        return 'bg-primary/30 border-primary text-white shadow-lg';
      case 'warning':
        return 'bg-primary/30 border-primary text-white shadow-lg';
      case 'info':
      default:
        return 'bg-primary/30 border-primary text-white shadow-lg';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}
    >
      <div className={`${getTypeStyles()} rounded-lg border-l-4 p-4 ring-1 ring-black ring-opacity-20 backdrop-blur-sm`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-lg">{getIcon()}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium leading-5">{message}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-3 text-white hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded p-1 hover:bg-white hover:bg-opacity-20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
