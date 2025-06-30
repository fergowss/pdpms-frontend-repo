import React, { useState, useEffect } from 'react';
import './AssetProperty.css';

export default function EditPropertyModal({ open, onClose, row, onUpdate }) {
  const [formValid, setFormValid] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (row) {
      setInitialData({
        serialNo: row.serialNo || '',
        dateAcquired: row.dateAcquired || '',
        unitCost: row.unitCost || '',
        endUser: row.endUser || '',
        estimatedLife: row.estimatedLife || '',
        status: row.status || '',
        remarks: row.remarks || '',
        description: row.description || ''
      });
    }
  }, [row]);

  const handleFormChange = (e) => {
    const form = e.currentTarget;
    setFormValid(form.checkValidity());
    if (initialData) {
      const changed = (
        form.serialNo.value !== initialData.serialNo ||
        form.dateAcquired.value !== initialData.dateAcquired ||
        form.unitCost.value !== initialData.unitCost ||
        form.endUser.value !== initialData.endUser ||
        form.estimatedLife.value !== initialData.estimatedLife ||
        form.status.value !== initialData.status ||
        form.remarks.value !== initialData.remarks ||
        form.description.value !== initialData.description
      );
      setHasChanges(changed);
    }
  };
  if (!open || !row) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formValid && hasChanges && onUpdate) {
      onUpdate();
    }
  };

  return (
    <div className="AssetProperty-EditModalOverlay">
      <div className="AssetProperty-EditModalBox">
        <form className="AssetProperty-ModalForm" onSubmit={handleSubmit} onChange={handleFormChange} noValidate>
          <div className="AssetProperty-ModalGrid">
            <div>
              <label className="AssetProperty-ModalLabel">Property No.</label>
              <input className="AssetProperty-ModalInput" type="text" value={row.propertyNo || ''} disabled style={{background:'#e8eef7'}} />

              <label className="AssetProperty-ModalLabel">Document No.</label>
              <input className="AssetProperty-ModalInput" type="text" value={row.documentNo || ''} disabled style={{background:'#e8eef7'}} />

              <label className="AssetProperty-ModalLabel">PAR No.</label>
              <input className="AssetProperty-ModalInput" type="text" value={row.parNo || ''} disabled style={{background:'#e8eef7'}} />

              <label className="AssetProperty-ModalLabel">Description</label>
              <textarea className="AssetProperty-ModalInput AssetProperty-ModalTextarea" rows={3} name="description" defaultValue={row.description || ''} required />
            </div>
            <div>
              <label className="AssetProperty-ModalLabel">Serial No.</label>
              <textarea 
                className="AssetProperty-ModalInput AssetProperty-ModalTextarea" 
                rows={3} 
                name="serialNo" 
                defaultValue={row.serialNo || ''} 
                required 
              />

              <label className="AssetProperty-ModalLabel">Date Acquired</label>
              <input className="AssetProperty-ModalInput" type="date" name="dateAcquired" defaultValue={row.dateAcquired || ''} required />

              <label className="AssetProperty-ModalLabel">Unit Cost</label>   
              <input className="AssetProperty-ModalInput" type="number" step="0.01" name="unitCost" defaultValue={row.unitCost || ''} required />

              <label className="AssetProperty-ModalLabel">End User</label>
              <input className="AssetProperty-ModalInput" type="text" name="endUser" defaultValue={row.endUser || ''} required />
            </div>
            <div>
              <label className="AssetProperty-ModalLabel">Estimated Life Use</label>
              <input className="AssetProperty-ModalInput" type="text" name="estimatedLife" defaultValue={row.estimatedLife || ''} required />

              <label className="AssetProperty-ModalLabel">Status</label>
              <select className="AssetProperty-ModalInput" name="status" defaultValue={row.status || ''} required>
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="For Repair">For Repair</option>
                <option value="Disposed">Disposed</option>
              </select>

              <label className="AssetProperty-ModalLabel">Remarks</label>
              <textarea className="AssetProperty-ModalInput AssetProperty-ModalTextarea" rows={3} name="remarks" defaultValue={row.remarks || ''} required />
            </div>
          </div>
          <div className="AssetProperty-ModalActions">
            <button 
              type="submit" 
              className="AssetProperty-ModalBtn AssetProperty-ModalBtn--primary" 
              disabled={!formValid || !hasChanges}
              style={{ opacity: formValid && hasChanges ? 1 : 0.6, cursor: formValid && hasChanges ? 'pointer' : 'not-allowed' }}
            >UPDATE</button>
            <button type="button" className="AssetProperty-ModalBtn AssetProperty-ModalBtn--secondary" onClick={onClose}>CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
}
