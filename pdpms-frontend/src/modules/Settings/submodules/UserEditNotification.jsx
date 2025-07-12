import React from 'react';
import './UserEditNotification.css';

export default function UserEditNotification({ open, onClose, onEdit }) {
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
    <div className="UserEditNotificationOverlay" onClick={handleOverlayClick}>
      <div className="UserEditNotification" onClick={e => e.stopPropagation()}>
        <button className="UserEditNotification-Close" onClick={onClose} title="Close">×</button>
        <div className="UserEditNotification-Title">
          Edit User Info?
        </div>
        <button className="UserEditNotification-EditBtn" onClick={handleEditClick}>
          EDIT
        </button>
      </div>
    </div>
  );
}
