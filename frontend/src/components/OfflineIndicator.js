// frontend/src/components/OfflineIndicator.js
import React, { useState, useEffect } from 'react';
import '../styles/OfflineIndicator.css';

const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="offline-indicator">
      <span className="offline-icon">📶</span>
      <span className="offline-text">You are offline. Some features may be unavailable.</span>
    </div>
  );
};

export default OfflineIndicator;