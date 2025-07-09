import React, { useState, useEffect } from 'react';
import './AssetProperty.css';

export default function AddPropertyModal({ open, onClose, onAdd }) {
  const initialFormData = {
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
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (open) {
      setFormData(initialFormData);
    }
  }, [open]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    console.log('Form data updated:', { ...formData, [name]: value });
  };

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAdd) {
      console.log('Submitting formData:', formData);
      onAdd(formData);
      setFormData(initialFormData);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onClose();
  };

  return (
    <div className="AssetProperty-AddModalOverlay">
      <div className="AssetProperty-AddModalBox">
        <form className="AssetProperty-ModalForm" onSubmit={handleSubmit} noValidate>
          <div className="AssetProperty-ModalGrid">
            <div>
              <label className="AssetProperty-ModalLabel">Document No.</label>
              <input 
                className="AssetProperty-ModalInput" 
                type="text" 
                name="documentNo" 
                value={formData.documentNo} 
                onChange={handleFormChange} 
              />

              <label className="AssetProperty-ModalLabel">PAR No.</label>
              <input 
                className="AssetProperty-ModalInput" 
                type="text" 
                name="parNo" 
                value={formData.parNo} 
                onChange={handleFormChange} 
              />

              <label className="AssetProperty-ModalLabel">Description</label>
              <textarea 
                className="AssetProperty-ModalInput AssetProperty-ModalTextarea" 
                rows={3} 
                name="description" 
                value={formData.description} 
                onChange={handleFormChange} 
              />

              <label className="AssetProperty-ModalLabel">Serial No.</label>
              <textarea 
                className="AssetProperty-ModalInput AssetProperty-ModalTextarea" 
                rows={3} 
                name="serialNo" 
                value={formData.serialNo} 
                onChange={handleFormChange} 
              />

              <label className="AssetProperty-ModalLabel">Date Acquired</label>
              <input 
                className="AssetProperty-ModalInput" 
                type="date" 
                name="dateAcquired" 
                value={formData.dateAcquired} 
                onChange={handleFormChange} 
              />
            </div>
            <div>
              <label className="AssetProperty-ModalLabel">Unit Cost</label>
              <input 
                className="AssetProperty-ModalInput" 
                type="number" 
                step="0.01" 
                name="unitCost" 
                value={formData.unitCost} 
                onChange={handleFormChange} 
              />

              <label className="AssetProperty-ModalLabel">End User</label>
              <input 
                className="AssetProperty-ModalInput" 
                type="text" 
                name="endUser" 
                value={formData.endUser} 
                onChange={handleFormChange} 
              />

              <label className="AssetProperty-ModalLabel">Estimated Life Use</label>
              <input 
                className="AssetProperty-ModalInput" 
                type="text" 
                name="estimatedLife" 
                value={formData.estimatedLife} 
                onChange={handleFormChange} 
                placeholder="0 Years" 
              />

              <label className="AssetProperty-ModalLabel">Remarks</label>
              <textarea 
                className="AssetProperty-ModalInput AssetProperty-ModalTextarea" 
                rows={3} 
                name="remarks" 
                value={formData.remarks} 
                onChange={handleFormChange} 
              />

              <label className="AssetProperty-ModalLabel">Status</label>
              <select 
                className="AssetProperty-ModalInput AssetProperty-ModalSelect" 
                name="status" 
                value={formData.status} 
                onChange={handleFormChange}
              >
                <option value="">Select Status</option>
                <option value="Serviceable">Serviceable</option>
                <option value="Unserviceable">Unserviceable</option>
                <option value="For Repair">For Repair</option>
                <option value="Condemned">Condemned</option>
              </select>
            </div>
          </div>
          <div className="AssetProperty-ModalActions">
            <button
              type="submit"
              className="AssetProperty-ModalBtn AssetProperty-ModalBtn--primary"
            >ADD</button>
            <button 
              type="button" 
              className="AssetProperty-ModalBtn AssetProperty-ModalBtn--secondary" 
              onClick={handleClose}
            >CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
}