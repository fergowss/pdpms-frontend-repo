import React, { useState, useEffect } from 'react';
import './PublicDocument.css';

const getFileName = (fileUrl) => {
  if (!fileUrl || fileUrl === '#') return '';
  return fileUrl.split('/').pop();
};

export default function EditDocumentModal({ open, onClose, doc, onUpdate }) {
  const [formData, setFormData] = useState({
    referenceCode: '',
    date: '',
    dateReceived: '',
    status: '',
    remarks: ''
  });
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [initialData, setInitialData] = useState(null);

  // Initialize form data when doc changes
  useEffect(() => {
    if (doc) {
      const newData = {
        referenceCode: doc.ref || '',
        date: doc.date ? new Date(doc.date).toISOString().split('T')[0] : '',
        dateReceived: doc.received ? new Date(doc.received).toISOString().split('T')[0] : '',
        status: doc.status || '',
        remarks: doc.remarks || ''
      };
      setFormData(newData);
      setInitialData(newData);
    }
  }, [doc]);

  // Check for changes
  useEffect(() => {
    if (initialData) {
      const changesDetected = Object.keys(formData).some(
        key => formData[key] !== initialData[key]
      );
      setHasChanges(changesDetected);
    }
  }, [formData, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateField = (name, value) => {
    if ((!value || (typeof value === 'string' && value.trim() === '')) && name !== 'remarks') {
      return 'This field is required';
    }
    return '';
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields on submit
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'remarks') { // Remarks is optional
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && hasChanges && onUpdate) {
      onUpdate(formData);
      onClose();
    }
  };

  if (!open || !doc) return null;

  return (
    <div className="PublicDocument-ModalOverlay">
      <div className="PublicDocument-ModalBox">
        <form className="PublicDocument-ModalForm" onSubmit={handleSubmit}>
          <div className="PublicDocument-ModalGrid">
            <div>
              <label className="PublicDocument-ModalLabel">Document ID</label>
              <input className="PublicDocument-ModalInput" type="text" value={doc.id || 'PDID00000459'} disabled style={{background:'#e8eef7'}} />
              
              <label className="PublicDocument-ModalLabel">Reference Code</label>
              <input 
                className={`PublicDocument-ModalInput ${errors.referenceCode ? 'PublicDocument-InputError' : ''}`}
                type="text" 
                name="referenceCode"
                value={formData.referenceCode}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.referenceCode && <div className="PublicDocument-ErrorText">{errors.referenceCode}</div>}
              
              <label className="PublicDocument-ModalLabel">Subject</label>
              <input className="PublicDocument-ModalInput PublicDocument-ModalInput--large" type="text" value={doc.subject || 'Intern Application'} disabled style={{background:'#e8eef7'}} />
              
              <label className="PublicDocument-ModalLabel">Document Type</label>
              <select className="PublicDocument-ModalInput" value={doc.type || 'Memorandum'} disabled style={{background:'#e8eef7'}}>
                <option>Endorsement</option>
                <option>Memorandum</option>
                <option>Certification</option>
                <option>Application</option>
                <option>Request</option>
                <option>Report</option>
              </select>
              
              <label className="PublicDocument-ModalLabel">Date</label>
              <input 
                className="PublicDocument-ModalInput"
                type="date" 
                name="date"
                value={formData.date}
                disabled 
                style={{background:'#e8eef7'}}
              />
            </div>
            <div>
              <label className="PublicDocument-ModalLabel">Date Received</label>
              <input 
                className="PublicDocument-ModalInput"
                type="date" 
                name="dateReceived"
                value={formData.dateReceived}
                disabled 
                style={{background:'#e8eef7'}}
              />
              
              <label className="PublicDocument-ModalLabel">Received by</label>
              <input className="PublicDocument-ModalInput" type="text" value={doc.receivedBy || 'Edwin Agustin'} disabled style={{background:'#e8eef7'}} />
              
              <label className="PublicDocument-ModalLabel">Status</label>
              <select 
                className={`PublicDocument-ModalInput ${errors.status ? 'PublicDocument-InputError' : ''}`}
                name="status"
                value={formData.status}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">Select Status</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
              {errors.status && <div className="PublicDocument-ErrorText">{errors.status}</div>}
              
              <label className="PublicDocument-ModalLabel">Remarks</label>
              <textarea 
                className="PublicDocument-ModalInput PublicDocument-ModalTextarea" 
                rows={4} 
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
              />
              
              <label className="PublicDocument-ModalLabel">Upload File <span className="PublicDocument-ModalHint">(PDF Only)</span></label>
              <input className="PublicDocument-ModalInput" type="text" value={getFileName(doc.file)} disabled style={{background:'#f2f4f8'}} />
            </div>
          </div>
          <div className="PublicDocument-ModalActions">
            <button 
              type="submit" 
              className="PublicDocument-ModalBtn PublicDocument-ModalBtn--primary"
              disabled={!hasChanges || Object.keys(errors).some(key => errors[key])}
              style={{
                opacity: hasChanges ? 1 : 0.6,
                cursor: hasChanges ? 'pointer' : 'not-allowed'
              }}
            >
              UPDATE
            </button>
            <button type="button" className="PublicDocument-ModalBtn PublicDocument-ModalBtn--secondary" onClick={onClose}>CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
}