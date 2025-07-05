import React, { useState, useEffect } from 'react';
import './PublicDocument.css';

export default function AddFollowUpModal({ open, onClose, onAddFollowUp, docId }) {
  const [formData, setFormData] = useState({
    referenceCode: '',
    subject: '',
    documentType: '',
    date: '',
    dateReceived: '',
    receivedBy: '',
    status: '',
    remarks: '',
    file: null,
  });
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const requiredFields = [
      'referenceCode',
      'subject',
      'documentType',
      'date',
      'dateReceived',
      'receivedBy',
      'status',
    ];
    const allFieldsFilled = requiredFields.every(
      field => formData[field] && formData[field].toString().trim() !== ''
    );
    const hasNoErrors = Object.values(errors).every(error => !error);
    setIsFormValid(allFieldsFilled && hasNoErrors);
  }, [formData, errors]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'file' ? files[0] : value
    }));
    if (name === 'date' || name === 'dateReceived') {
      const isValidDate = value.match(/^\d{4}-\d{2}-\d{2}$/);
      setErrors(prev => ({
        ...prev,
        [name]: isValidDate ? '' : 'Invalid date format (YYYY-MM-DD)',
      }));
    } else if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    ['referenceCode', 'subject', 'documentType', 'date', 'dateReceived', 'receivedBy', 'status'].forEach(key => {
      if (!formData[key] || formData[key].toString().trim() === '') {
        newErrors[key] = 'This field is required';
      }
    });
    if (formData.date && !formData.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      newErrors.date = 'Invalid date format (YYYY-MM-DD)';
    }
    if (formData.dateReceived && !formData.dateReceived.match(/^\d{4}-\d{2}-\d{2}$/)) {
      newErrors.dateReceived = 'Invalid date format (YYYY-MM-DD)';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onAddFollowUp(formData);
      onClose();
    }
  };

  return (
    <div className="PublicDocument-ModalOverlay">
      <div className="PublicDocument-ModalBox">
        <form className="PublicDocument-ModalForm" onSubmit={handleSubmit}>
          <div className="PublicDocument-ModalGrid" style={{ width: '100%' }}>
            <div style={{ maxWidth: '100%' }}>
              <label className="PublicDocument-ModalLabel">Document ID</label>
              <input
                className="PublicDocument-ModalInput"
                type="text"
                value={docId || ''}
                disabled
                style={{
                  background: '#e8eef7',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  cursor: 'not-allowed'
                }}
              />
              <label className="PublicDocument-ModalLabel">Reference Code</label>
              <input
                className={`PublicDocument-ModalInput ${errors.referenceCode ? 'PublicDocument-InputError' : ''}`}
                type="text"
                name="referenceCode"
                value={formData.referenceCode}
                onChange={handleChange}
                style={{ maxWidth: '100%', boxSizing: 'border-box' }}
              />
              {errors.referenceCode && <span className="PublicDocument-ErrorText">{errors.referenceCode}</span>}
              <label className="PublicDocument-ModalLabel">Subject</label>
              <textarea
                className={`PublicDocument-ModalInput ${errors.subject ? 'PublicDocument-InputError' : ''}`}
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                style={{ minHeight: '5.5rem', resize: 'none', maxWidth: '100%', boxSizing: 'border-box' }}
              />
              {errors.subject && <span className="PublicDocument-ErrorText">{errors.subject}</span>}
              <label className="PublicDocument-ModalLabel">Document Type</label>
              <select
                className={`PublicDocument-ModalInput ${errors.documentType ? 'PublicDocument-InputError' : ''}`}
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                style={{ maxWidth: '100%', boxSizing: 'border-box' }}
              >
                <option value="">Select Document Type</option>
                <option value="Certification">Certification</option>
                <option value="Memorandum">Memorandum</option>
                <option value="Application">Application</option>
                <option value="Request">Request</option>
                <option value="Report">Report</option>
              </select>
              {errors.documentType && <span className="PublicDocument-ErrorText">{errors.documentType}</span>}
              <label className="PublicDocument-ModalLabel">Date</label>
              <input
                className={`PublicDocument-ModalInput ${errors.date ? 'PublicDocument-InputError' : ''}`}
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                style={{ maxWidth: '100%', boxSizing: 'border-box' }}
              />
              {errors.date && <span className="PublicDocument-ErrorText">{errors.date}</span>}
            </div>
            <div style={{ maxWidth: '100%' }}>
              <label className="PublicDocument-ModalLabel">Date Received</label>
              <input
                className={`PublicDocument-ModalInput ${errors.dateReceived ? 'PublicDocument-InputError' : ''}`}
                type="date"
                name="dateReceived"
                value={formData.dateReceived}
                onChange={handleChange}
                style={{ maxWidth: '100%', boxSizing: 'border-box' }}
              />
              {errors.dateReceived && <span className="PublicDocument-ErrorText">{errors.dateReceived}</span>}
              <label className="PublicDocument-ModalLabel">Received by</label>
              <input
                className={`PublicDocument-ModalInput ${errors.receivedBy ? 'PublicDocument-InputError' : ''}`}
                type="text"
                name="receivedBy"
                value={formData.receivedBy}
                onChange={handleChange}
                style={{ maxWidth: '100%', boxSizing: 'border-box' }}
              />
              {errors.receivedBy && <span className="PublicDocument-ErrorText">{errors.receivedBy}</span>}
              <label className="PublicDocument-ModalLabel">Status</label>
              <select
                className={`PublicDocument-ModalInput ${errors.status ? 'PublicDocument-InputError' : ''}`}
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{ maxWidth: '100%', boxSizing: 'border-box' }}
              >
                <option value="">Select Status</option>
                <option value="Completed">Completed</option>
                <option value="On Going">On Going</option>
                <option value="Pending">Pending</option>
              </select>
              {errors.status && <span className="PublicDocument-ErrorText">{errors.status}</span>}
              <label className="PublicDocument-ModalLabel">Remarks</label>
              <textarea
                className={`PublicDocument-ModalInput ${errors.remarks ? 'PublicDocument-InputError' : ''}`}
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                style={{ minHeight: '5.5rem', resize: 'none', maxWidth: '100%', boxSizing: 'border-box' }}
              />
              {errors.remarks && <span className="PublicDocument-ErrorText">{errors.remarks}</span>}
              <label className="PublicDocument-ModalLabel">Upload File <span className="PublicDocument-ModalHint">(PDF Only, Optional)</span></label>
              <div style={{ width: '100%', overflow: 'hidden' }}>
                <input
                  className={`PublicDocument-ModalInput ${errors.file ? 'PublicDocument-InputError' : ''}`}
                  type="file"
                  name="file"
                  accept="application/pdf"
                  onChange={handleChange}
                  style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', display: 'block' }}
                />
                {errors.file && <span className="PublicDocument-ErrorText">{errors.file}</span>}
              </div>
            </div>
          </div>
          <div className="PublicDocument-ModalActions">
            <button type="submit" className="PublicDocument-ModalBtn PublicDocument-ModalBtn--primary" disabled={!isFormValid} style={{ opacity: isFormValid ? 1 : 0.6, cursor: isFormValid ? 'pointer' : 'not-allowed' }}>ADD FOLLOW-UP</button>
            <button type="button" className="PublicDocument-ModalBtn PublicDocument-ModalBtn--secondary" onClick={onClose}>CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
}
