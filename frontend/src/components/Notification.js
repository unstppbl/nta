// frontend/src/components/Notification.js
import React, { useState, useEffect } from 'react';
import '../styles/Notification.css';

const Notification = ({ message, type, duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onClose && onClose();
      }, 300); // Allow time for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`notification ${type} ${visible ? 'visible' : 'hidden'}`}>
      <span className="notification-message">{message}</span>
    </div>
  );
};

export default Notification;