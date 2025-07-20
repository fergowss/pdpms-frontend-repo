import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PublicDocument.css';

function isOver5Years(dateString) {
  if (!dateString) return false;
  let docDate;
  if (dateString.includes('-')) {
    docDate = new Date(dateString);
  } else if (dateString.split('/').length === 3) {
    const parts = dateString.split('/');
    let year = parts[2];
    if (year.length === 2) {
      year = +year < 50 ? '20' + year : '19' + year;
    }
    docDate = new Date(`${year}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`);
  } else {
    docDate = new Date(dateString);
  }
  if (isNaN(docDate.getTime())) return false;
  const now = new Date();
  const yearsDiff = (now - docDate) / (1000 * 60 * 60 * 24 * 365.25);
  return yearsDiff >= 5;
}

function generateLogId() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `LOG-DOC-${year}-${random}`;
}

async function logActivity(username, action, documentId) {
  if (!username) {
    console.warn('Unable to log activity: No username available');
    return; // Changed to return instead of throw, aligning with AddDocumentModal
  }
  const logId = generateLogId();
  const timestamp = new Date().toISOString();
  try {
    await axios.post('http://127.0.0.1:8000/pdpms/manila-city-hall/activity-logs/', {
      log_id: logId,
      username,
      action_log: 'Added a follow-up in Public Documents', // Corrected action_log
      timestamp,
    });
    console.log(`Activity logged: ${action} by ${username} for Document ID: ${documentId}`);
  } catch (error) {
    console.error('Failed to log activity:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to log activity. Please try again.');
  }
}

function validatePdfFile(file) {
  if (!file) return '';
  if (file.type !== 'application/pdf') return 'Only PDF files are allowed';
  if (file.size > 10 * 1024 * 1024) return 'File size must be 10MB or less';
  return '';
}

export default function AddFollowUpModal({ open, onClose, onAddFollowUp, docId, username }) {
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
    if (open) {
      setFormData({
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
      setErrors({});
      setIsFormValid(false);
    }
  }, [open]);

  const currentDate = new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    if (formData.date) {
      const date = new Date(formData.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      setFormData(prev => ({
        ...prev,
        referenceCode: `REF-CD-${year}-${month}`
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        referenceCode: ''
      }));
    }
  }, [formData.date]);

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

    if (name === 'file') {
      const file = files[0];
      const fileError = validatePdfFile(file);
      setFormData(prev => ({ ...prev, file }));
      setErrors(prev => ({ ...prev, file: fileError }));
      return;
    }

    if (name === 'date' || name === 'dateReceived') {
      const selectedDate = new Date(value);
      const currentDateObj = new Date(currentDate);
      selectedDate.setHours(0, 0, 0, 0);
      currentDateObj.setHours(0, 0, 0, 0);
      if (selectedDate > currentDateObj) {
        setErrors(prev => ({
          ...prev,
          [name]: 'Future dates are not allowed'
        }));
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (name === 'status' && value === 'Archived' && !isOver5Years(formData.date)) {
      setErrors(prev => ({
        ...prev,
        status: 'Cannot set as Archived unless the document date is at least 5 years ago.'
      }));
      setFormData(prev => ({
        ...prev,
        status: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
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
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const currentDateObj = new Date(currentDate);
      selectedDate.setHours(0, 0, 0, 0);
      currentDateObj.setHours(0, 0, 0, 0);
      if (selectedDate > currentDateObj) {
        newErrors.date = 'Future dates are not allowed';
      }
    }
    if (formData.dateReceived) {
      const selectedDate = new Date(formData.dateReceived);
      const currentDateObj = new Date(currentDate);
      selectedDate.setHours(0, 0, 0, 0);
      currentDateObj.setHours(0, 0, 0, 0);
      if (selectedDate > currentDateObj) {
        newErrors.dateReceived = 'Future dates are not allowed';
      }
    }
    if (formData.status === 'Archived' && !isOver5Years(formData.date)) {
      newErrors.status = 'Cannot set as Archived unless the document date is at least 5 years ago.';
    }
    if (formData.file) {
      const fileError = validatePdfFile(formData.file);
      if (fileError) newErrors.file = fileError;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      try {
        await logActivity(username, `Added a Follow-up Record in Public Documents (Document ID: ${docId})`, docId);
        onAddFollowUp(formData);
        onClose();
      } catch (logError) {
        setErrors({ ...errors, submit: logError.message });
      }
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
                disabled
                style={{ maxWidth: '100%', boxSizing: 'border-box', background: '#e8eef7' }}
              />
              {errors.referenceCode && <div className="PublicDocument-ErrorText" style={{ color: 'red' }}>{errors.referenceCode}</div>}
              <label className="PublicDocument-ModalLabel">Subject</label>
              <textarea
                className={`PublicDocument-ModalInput ${errors.subject ? 'PublicDocument-InputError' : ''}`}
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                style={{ minHeight: '5.5rem', resize: 'none', maxWidth: '100%', boxSizing: 'border-box' }}
              />
              {errors.subject && <div className="PublicDocument-ErrorText" style={{ color: 'red' }}>{errors.subject}</div>}
              <label className="PublicDocument-ModalLabel">Document Type</label>
              <select
                className={`PublicDocument-ModalInput ${errors.documentType ? 'PublicDocument-InputError' : ''}`}
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                style={{ maxWidth: '100%', boxSizing: 'border-box' }}
              >
                <option value="">Select Document Type</option>
                <option value="Endorsements">Endorsements</option>
                <option value="Memorandums">Memorandums</option>
                <option value="Dispositions">Dispositions</option>
                <option value="Special Orders">Special Orders</option>
                <option value="Request Letters">Request Letters</option>
                <option value="Employee Documents">Employee Documents</option>
                <option value="Property Records">Property Records</option>
                <option value="Others">Others</option>
              </select>
              {errors.documentType && <div className="PublicDocument-ErrorText" style={{ color: 'red' }}>{errors.documentType}</div>}
              <label className="PublicDocument-ModalLabel">Date</label>
              <input
                className={`PublicDocument-ModalInput ${errors.date ? 'PublicDocument-InputError' : ''}`}
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                max={currentDate}
                style={{ maxWidth: '100%', boxSizing: 'border-box' }}
              />
              {errors.date && <div className="PublicDocument-ErrorText" style={{ color: 'red' }}>{errors.date}</div>}
            </div>
            <div style={{ maxWidth: '100%' }}>
              <label className="PublicDocument-ModalLabel">Date Received</label>
              <input
                className={`PublicDocument-ModalInput ${errors.dateReceived ? 'PublicDocument-InputError' : ''}`}
                type="date"
                name="dateReceived"
                value={formData.dateReceived}
                onChange={handleChange}
                max={currentDate}
                style={{ maxWidth: '100%', boxSizing: 'border-box' }}
              />
              {errors.dateReceived && <div className="PublicDocument-ErrorText" style={{ color: 'red' }}>{errors.dateReceived}</div>}
              <label className="PublicDocument-ModalLabel">Received by</label>
              <input
                className={`PublicDocument-ModalInput ${errors.receivedBy ? 'PublicDocument-InputError' : ''}`}
                type="text"
                name="receivedBy"
                value={formData.receivedBy}
                onChange={handleChange}
                style={{ maxWidth: '100%', boxSizing: 'border-box' }}
              />
              {errors.receivedBy && <div className="PublicDocument-ErrorText" style={{ color: 'red' }}>{errors.receivedBy}</div>}
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
                <option value="Ongoing">Ongoing</option>
                {isOver5Years(formData.date) && (
                  <option value="Archived">Archived</option>
                )}
              </select>
              {errors.status && <div className="PublicDocument-ErrorText" style={{ color: 'red' }}>{errors.status}</div>}
              <label className="PublicDocument-ModalLabel">Remarks</label>
              <textarea
                className={`PublicDocument-ModalInput ${errors.remarks ? 'PublicDocument-InputError' : ''}`}
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                style={{ minHeight: '5.5rem', resize: 'none', maxWidth: '100%', boxSizing: 'border-box' }}
              />
              {errors.remarks && <div className="PublicDocument-ErrorText" style={{ color: 'red' }}>{errors.remarks}</div>}
              <label className="PublicDocument-ModalLabel">Upload File <span className="PublicDocument-ModalHint">(PDF Only, Max 10MB)</span></label>
              <input
                className={`PublicDocument-ModalInput ${errors.file ? 'PublicDocument-InputError' : ''}`}
                type="file"
                name="file"
                onChange={handleChange}
                accept="application/pdf"
                style={{ maxWidth: '100%', boxSizing: 'border-box' }}
              />
              {errors.file && <div className="PublicDocument-ErrorText" style={{ color: 'red' }}>{errors.file}</div>}
            </div>
          </div>
          {errors.submit && (
            <div className="PublicDocument-FormCenterError" style={{ color: 'red', textAlign: 'center', margin: '10px 0' }}>
              {errors.submit}
            </div>
          )}
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
              ADD FOLLOW-UP
            </button>
            <button
              type="button"
              className="PublicDocument-ModalBtn PublicDocument-ModalBtn--secondary"
              onClick={onClose}
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}