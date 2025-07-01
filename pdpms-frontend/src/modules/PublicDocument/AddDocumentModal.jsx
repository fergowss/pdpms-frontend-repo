import React, { useState, useEffect } from 'react';
import './PublicDocument.css';

export default function AddDocumentModal({ open, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    referenceCode: '',
    subject: '',
    documentType: '',
    date: '',
    dateReceived: '',
    status: '',
        remarks: '',
    file: null
  });
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    // Check if all required fields are filled
    const requiredFields = [
      'referenceCode',
      'subject',
      'documentType',
      'date',
      'dateReceived',
      'status',
       'remarks',
      'file'
    ];

    const allFieldsFilled = requiredFields.every(
      field => formData[field] && formData[field].toString().trim() !== ''
    );

    const hasNoErrors = Object.values(errors).every(error => !error);
    
    setIsFormValid(allFieldsFilled && hasNoErrors);
  }, [formData, errors]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'file' ? files[0] : value
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
    if (!value || (typeof value === 'string' && value.trim() === '')) {
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
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && onAdd) {
      onAdd(formData);
      // Reset form
      setFormData({
        referenceCode: '',
        subject: '',
        documentType: '',
        date: '',
        dateReceived: '',
        status: '',
        remarks: '',
        remarks: '',
        file: null
      });
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="PublicDocument-ModalOverlay">
      <div className="PublicDocument-ModalBox" style={{ minWidth: '700px', maxWidth: '700px', width: '700px' }}>
        <form className="PublicDocument-ModalForm" onSubmit={handleSubmit}>
          <div className="PublicDocument-ModalGrid">
            <div>
              <label className="PublicDocument-ModalLabel">Reference Code</label>
              <input 
                className={`PublicDocument-ModalInput ${errors.referenceCode ? 'PublicDocument-InputError' : ''}`}
                type="text"
                name="referenceCode"
                value={formData.referenceCode}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              
              <label className="PublicDocument-ModalLabel">Subject</label>
              <textarea 
                className={`PublicDocument-ModalInput PublicDocument-ModalTextarea ${errors.subject ? 'PublicDocument-InputError' : ''}`}
                rows={4}
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                onBlur={handleBlur}
              ></textarea>
              
              <label className="PublicDocument-ModalLabel">Document Type</label>
              <select 
                className={`PublicDocument-ModalInput ${errors.documentType ? 'PublicDocument-InputError' : ''}`}
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">Select Document Type</option>
                <option value="Endorsement">Endorsement</option>
                <option value="Memorandum">Memorandum</option>
                <option value="Certification">Certification</option>
                <option value="Application">Application</option>
                <option value="Request">Request</option>
                <option value="Report">Report</option>
              </select>
              
              <label className="PublicDocument-ModalLabel">Date *</label>
              <input 
                className={`PublicDocument-ModalInput ${errors.date ? 'PublicDocument-InputError' : ''}`} 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              
              <label className="PublicDocument-ModalLabel">Date Received *</label>
              <input 
                className={`PublicDocument-ModalInput ${errors.dateReceived ? 'PublicDocument-InputError' : ''}`} 
                type="date" 
                name="dateReceived"
                value={formData.dateReceived}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              
            </div>
            <div>
              <label className="PublicDocument-ModalLabel">Received by</label>
              <input className="PublicDocument-ModalInput" type="text" disabled style={{background:'#e8eef7'}} value="Herson Fergus Arcanghel" />
              <label className="PublicDocument-ModalLabel">Status</label>
              <select 
                className={`PublicDocument-ModalInput ${errors.status ? 'PublicDocument-InputError' : ''}`}
                name="status"
                value={formData.status}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">Select Status</option>
                <option value="On Going">On Going</option>
                <option value="Completed">Completed</option>
              </select>
              
              <label className="PublicDocument-ModalLabel">Remarks *</label>
              <textarea 
                className={`PublicDocument-ModalInput PublicDocument-ModalTextarea ${errors.remarks ? 'PublicDocument-InputError' : ''}`} 
                rows={4} 
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              
              <label className="PublicDocument-ModalLabel">Upload File <span className="PublicDocument-ModalHint">(PDF Only)</span></label>
              <div style={{ width: '100%', overflow: 'hidden' }}>
                <input 
                  className={`PublicDocument-ModalInput ${errors.file ? 'PublicDocument-InputError' : ''}`}
                  type="file" 
                  name="file"
                  accept="application/pdf"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', display: 'block' }}
                />
              </div>
            </div>
          </div>
          {(() => {
  const requiredFields = [
    'referenceCode',
    'subject',
    'documentType',
    'date',
    'dateReceived',
    'status',
    'remarks',
    'file',
  ];
  const missingFields = requiredFields.filter(field => !formData[field] || formData[field].toString().trim() === '');
  return missingFields.length === 1 ? (
    <div className="PublicDocument-FormCenterError">All fields are required.</div>
  ) : null;
})()}
<div className="PublicDocument-ModalActions">
            <button 
              type="submit" 
              className="PublicDocument-ModalBtn PublicDocument-ModalBtn--primary"
              disabled={!isFormValid}
              style={{
                opacity: isFormValid ? 1 : 0.6,
                cursor: isFormValid ? 'pointer' : 'not-allowed'
              }}
            >
              ADD
            </button>
            <button type="button" className="PublicDocument-ModalBtn PublicDocument-ModalBtn--secondary" onClick={onClose}>CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
}
