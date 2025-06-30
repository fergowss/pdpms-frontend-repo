import React from 'react';
import './EmployeeEditNotification.css';

export default function EmployeeEditNotification({ open, onClose, onEdit }) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit();
  };

  if (!open) return null;
  
  return (
    <div className="EmployeeEditNotificationOverlay" onClick={handleOverlayClick}>
      <div className="EmployeeEditNotification" onClick={(e) => e.stopPropagation()}>
        <button className="EmployeeEditNotification-Close" onClick={onClose} title="Close">×</button>
        <div className="EmployeeEditNotification-Title">
          Edit Employee Info?
        </div>
        <button className="EmployeeEditNotification-EditBtn" onClick={handleEditClick}>
          EDIT
        </button>
      </div>
    </div>
  );
}
