import React, { useState } from 'react';
import './AssetProperty.css';

export default function AddPropertyModal({ open, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    endUser: '',
    dateAcquired: '',
    unitCost: '',
    estimatedLife: '',
    remarks: '',
    status: ''
  });
  const [isValid, setIsValid] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Update validity state whenever any input changes
    setIsValid(e.currentTarget.checkValidity());
  };
  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAdd) onAdd();
  };

  return (
    <div className="AssetProperty-AddModalOverlay">
      <div className="AssetProperty-AddModalBox">
        <form className="AssetProperty-ModalForm" onSubmit={handleSubmit} onChange={handleFormChange} noValidate>
          <div className="AssetProperty-ModalGrid">
            <div>
              <label className="AssetProperty-ModalLabel">PAR No.</label>
              <input className="AssetProperty-ModalInput" type="text" name="parNo" required />

              <label className="AssetProperty-ModalLabel">Description</label>
              <textarea className="AssetProperty-ModalInput AssetProperty-ModalTextarea" rows={3} name="description" required />

              <label className="AssetProperty-ModalLabel">Serial No.</label>
              <textarea className="AssetProperty-ModalInput AssetProperty-ModalTextarea" rows={3} name="serialNo" required />

              <label className="AssetProperty-ModalLabel">Date Acquired</label>
              <input className="AssetProperty-ModalInput" type="date" name="dateAcquired" required />
            </div>
            <div>
              <label className="AssetProperty-ModalLabel">Unit Cost</label>
              <input className="AssetProperty-ModalInput" type="number" step="0.01" name="unitCost" required />

              <label className="AssetProperty-ModalLabel">End User</label>
              <input className="AssetProperty-ModalInput" type="text" name="endUser" required />

              <label className="AssetProperty-ModalLabel">Estimated Life Use</label>
              <input className="AssetProperty-ModalInput" type="text" name="estimatedLife" placeholder="0 Years" required />

              <label className="AssetProperty-ModalLabel">Remarks</label>
              <textarea className="AssetProperty-ModalInput AssetProperty-ModalTextarea" rows={3} name="remarks" required />

              <label className="AssetProperty-ModalLabel">Status</label>
              <select className="AssetProperty-ModalInput AssetProperty-ModalSelect" name="status" required>
                <option value="">Select Status</option>
                <option>Serviceable</option>
                <option>Unserviceable</option>
                <option>For Repair</option>
                <option>Condemned</option>
              </select>
            </div>
          </div>
          {(() => {
  const requiredFields = [
    'endUser',
    'dateAcquired',
    'unitCost',
    'estimatedLife',
    'remarks',
    'status'
  ];
  const missingFields = requiredFields.filter(field => 
    !formData[field] || formData[field].toString().trim() === ''
  );
  return missingFields.length === 1 ? (
    <div className="PublicDocument-FormCenterError">All fields are required.</div>
  ) : null;
})()}
<div className="AssetProperty-ModalActions">
            <button 
              type="submit" 
              className="AssetProperty-ModalBtn AssetProperty-ModalBtn--primary"
              disabled={!isValid}
              style={{ opacity: isValid ? 1 : 0.6, cursor: isValid ? 'pointer' : 'not-allowed' }}
            >ADD</button>
            <button type="button" className="AssetProperty-ModalBtn AssetProperty-ModalBtn--secondary" onClick={onClose}>CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
}
