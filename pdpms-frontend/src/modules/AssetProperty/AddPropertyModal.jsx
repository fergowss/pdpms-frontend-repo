import React, { useState, useEffect } from 'react';
import './AssetProperty.css';

function generatePropertyNo() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(16).substr(2, 6);
  return `ASSE-PRPTY-${year}-${random}`;
}

export default function AddPropertyModal({ open, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    propertyNo: '',
    documentNo: '',
    parNo: '',
    description: '',
    serialNo: '',
    dateAcquired: '',
    unitCost: '',
    endUser: '',
    estimatedLife: '',
    remarks: '',
    status: ''
  });
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData(prev => ({
        ...prev,
        propertyNo: generatePropertyNo()
      }));
    }
  }, [open]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setTimeout(() => {
      const requiredFields = [
        'propertyNo',
        'documentNo',
        'parNo',
        'description',
        'serialNo',
        'dateAcquired',
        'unitCost',
        'endUser',
        'estimatedLife',
        'remarks',
        'status'
      ];
      const missing = requiredFields.some(field => !formData[field] || formData[field].toString().trim() === '');
      setIsValid(!missing);
    }, 0);
  };

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid && onAdd) onAdd(formData);
  };

  return (
    <div className="AssetProperty-AddModalOverlay">
      <div className="AssetProperty-AddModalBox">
        <form className="AssetProperty-ModalForm" onSubmit={handleSubmit} onChange={handleFormChange} noValidate>
          <div className="AssetProperty-ModalGrid">
            <div>
              <label className="AssetProperty-ModalLabel">Property No.</label>
              <input className="AssetProperty-ModalInput" type="text" name="propertyNo" value={formData.propertyNo} required readOnly />

              <label className="AssetProperty-ModalLabel">Document No.</label>
              <input className="AssetProperty-ModalInput" type="text" name="documentNo" value={formData.documentNo} required />

              <label className="AssetProperty-ModalLabel">PAR No.</label>
              <input className="AssetProperty-ModalInput" type="text" name="parNo" value={formData.parNo} required />

              <label className="AssetProperty-ModalLabel">Description</label>
              <textarea className="AssetProperty-ModalInput AssetProperty-ModalTextarea" rows={3} name="description" value={formData.description} required />

              <label className="AssetProperty-ModalLabel">Serial No.</label>
              <textarea className="AssetProperty-ModalInput AssetProperty-ModalTextarea" rows={3} name="serialNo" value={formData.serialNo} required />

              <label className="AssetProperty-ModalLabel">Date Acquired</label>
              <input className="AssetProperty-ModalInput" type="date" name="dateAcquired" value={formData.dateAcquired} required />
            </div>
            <div>
              <label className="AssetProperty-ModalLabel">Unit Cost</label>
              <input className="AssetProperty-ModalInput" type="number" step="0.01" name="unitCost" value={formData.unitCost} required />

              <label className="AssetProperty-ModalLabel">End User</label>
              <input className="AssetProperty-ModalInput" type="text" name="endUser" value={formData.endUser} required />

              <label className="AssetProperty-ModalLabel">Estimated Life Use</label>
              <input className="AssetProperty-ModalInput" type="text" name="estimatedLife" value={formData.estimatedLife} placeholder="0 Years" required />

              <label className="AssetProperty-ModalLabel">Remarks</label>
              <textarea className="AssetProperty-ModalInput AssetProperty-ModalTextarea" rows={3} name="remarks" value={formData.remarks} required />

              <label className="AssetProperty-ModalLabel">Status</label>
              <select className="AssetProperty-ModalInput AssetProperty-ModalSelect" name="status" value={formData.status} required>
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
              'propertyNo',
              'documentNo',
              'parNo',
              'description',
              'serialNo',
              'dateAcquired',
              'unitCost',
              'endUser',
              'estimatedLife',
              'remarks',
              'status'
            ];
            const missingFields = requiredFields.filter(field =>
              !formData[field] || formData[field].toString().trim() === ''
            );
            return missingFields.length > 0 ? (
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
