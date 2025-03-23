// frontend/src/components/ConfirmationDialog.js
import React from 'react';
import '../styles/ConfirmationDialog.css';

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  type = "warning" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-backdrop">
      <div className="dialog-container">
        <div className={`dialog-content dialog-${type}`}>
          <h3 className="dialog-title">{title}</h3>
          <p className="dialog-message">{message}</p>
          <div className="dialog-actions">
            <button 
              className="dialog-button dialog-cancel" 
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button 
              className="dialog-button dialog-confirm" 
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;