import React, { useState, useEffect } from 'react';
import './AssetProperty.css';

export default function EditPropertyModal({ open, onClose, row, onUpdate }) {
  const [formData, setFormData] = useState({
    propertyNo: '',
    documentNo: '',
    parNo: '',
    serialNo: '',
    dateAcquired: '',
    unitCost: '',
    endUser: '',
    estimatedLife: '',
    status: '',
    remarks: '',
    description: ''
  });
  const [formValid, setFormValid] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (row) {
      const newData = {
        propertyNo: row.propertyNo || '',
        documentNo: row.documentNo || '',
        parNo: row.parNo || '',
        serialNo: row.serialNo || '',
        dateAcquired: row.dateAcquired || '',
        unitCost: row.unitCost ? row.unitCost.replace(/,/g, '') : '',
        endUser: row.endUser || '',
        estimatedLife: row.estimatedLife || '',
        status: row.status || 'Serviceable',
        remarks: row.remarks || '',
        description: row.description || ''
      };
      setFormData(newData);
      setInitialData(newData);
      // Validate initial data for required fields
      const requiredFields = ['endUser', 'status', 'remarks'];
      const isValid = requiredFields.every(field => newData[field]?.toString().trim() !== '');
      setFormValid(isValid);
      setHasChanges(false);
      console.log('Initial formData:', newData, 'formValid:', isValid);
    }
  }, [row]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (initialData) {
      // Check for changes in any editable field
      const editableFields = ['serialNo', 'unitCost', 'estimatedLife', 'endUser', 'status', 'remarks'];
      const changed = editableFields.some(field =>
        (name === field ? value : formData[field]) !== initialData[field]
      );
      setHasChanges(changed);

      // Validate required fields
      const requiredFields = ['endUser', 'status', 'remarks'];
      const isValid = requiredFields.every(field =>
        (name === field ? value : formData[field])?.toString().trim() !== ''
      );
      setFormValid(isValid);
      console.log('Field changed:', name, value, 'hasChanges:', changed, 'formValid:', isValid);
    }
  };

  if (!open || !row) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formValid && hasChanges && onUpdate) {
      const updatedData = {
        propertyNo: formData.propertyNo,
        serialNo: formData.serialNo,
        unitCost: formData.unitCost ? parseFloat(formData.unitCost) : null,
        endUser: formData.endUser,
        estimatedLife: formData.estimatedLife ? formData.estimatedLife : null,
        status: formData.status,
        remarks: formData.remarks
      };
      console.log('Submitting updatedData:', updatedData);
      onUpdate(updatedData);
    }
  };

  return (
    <div className="AssetProperty-EditModalOverlay">
      <div className="AssetProperty-EditModalBox">
        <form className="AssetProperty-ModalForm" onSubmit={handleSubmit} noValidate>
          <div className="AssetProperty-ModalGrid">
            <div>
              <label className="AssetProperty-ModalLabel">Property No.</label>
              <input className="AssetProperty-ModalInput" type="text" value={formData.propertyNo} disabled style={{background:'#e8eef7'}} />

              <label className="AssetProperty-ModalLabel">Document No.</label>
              <input className="AssetProperty-ModalInput" type="text" value={formData.documentNo} disabled style={{background:'#e8eef7'}} />

              <label className="AssetProperty-ModalLabel">PAR No.</label>
              <input 
                className="AssetProperty-ModalInput" 
                type="text" 
                name="parNo"
                value={formData.parNo} 
                disabled
                style={{background:'#e8eef7'}}
              />

              <label className="AssetProperty-ModalLabel">Description</label>
              <textarea 
                className="AssetProperty-ModalInput AssetProperty-ModalTextarea" 
                rows={3} 
                name="description" 
                value={formData.description}
                disabled
                style={{background:'#e8eef7'}}
              />
            </div>
            <div>
              <label className="AssetProperty-ModalLabel">Serial No.</label>
              <input 
                className="AssetProperty-ModalInput" 
                type="text"
                name="serialNo"
                value={formData.serialNo} 
                onChange={handleInputChange}
              />

              <label className="AssetProperty-ModalLabel">Date Acquired</label>
              <input 
                className="AssetProperty-ModalInput" 
                type="date" 
                name="dateAcquired"
                value={formData.dateAcquired} 
                disabled
                style={{background:'#e8eef7'}}
              />

              <label className="AssetProperty-ModalLabel">Unit Cost</label>   
              <input 
                className="AssetProperty-ModalInput" 
                type="number" 
                name="unitCost"
                step="0.01" 
                value={formData.unitCost}
                onChange={handleInputChange}
              />

              <label className="AssetProperty-ModalLabel">End User</label>
              <input 
                className="AssetProperty-ModalInput" 
                type="text" 
                name="endUser" 
                value={formData.endUser}
                onChange={handleInputChange}
                required 
              />
            </div>
            <div>
              <label className="AssetProperty-ModalLabel">Estimated Life Use</label>
              <input 
                className="AssetProperty-ModalInput" 
                type="text" 
                name="estimatedLife"
                value={formData.estimatedLife}
                onChange={handleInputChange}
                placeholder="0 Years"
              />

              <label className="AssetProperty-ModalLabel">Status</label>
              <select 
                className="AssetProperty-ModalInput" 
                name="status" 
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Status</option>
                <option value="Serviceable">Serviceable</option>
                <option value="Unserviceable">Unserviceable</option>
                <option value="For Repair">For Repair</option>
                <option value="Condemned">Condemned</option>
              </select>

              <label className="AssetProperty-ModalLabel">Remarks</label>
              <textarea 
                className="AssetProperty-ModalInput AssetProperty-ModalTextarea" 
                rows={3} 
                name="remarks" 
                value={formData.remarks}
                onChange={handleInputChange}
                required 
              />
            </div>
          </div>
          { !formValid && (
            <div className="PublicDocument-FormCenterError">End User, Status, and Remarks are required.</div>
          )}
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
