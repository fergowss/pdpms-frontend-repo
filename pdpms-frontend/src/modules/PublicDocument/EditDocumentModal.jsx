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
    throw new Error('No username provided. Please log in and try again.');
  }
  const logId = generateLogId();
  const timestamp = new Date().toISOString();
  try {
    await axios.post('http://127.0.0.1:8000/pdpms/manila-city-hall/activity-logs/', {
      log_id: logId,
      username,
      action_log: 'Edited a Record in Public Documents',
      timestamp,
    });
    console.log(`Activity logged: ${action} by ${username} for Document ID: ${documentId}`);
  } catch (error) {
    console.error('Failed to log activity:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to log activity. Please try again.');
  }
}

const getFileName = (fileUrl) => {
  if (!fileUrl || fileUrl === '#') return '';
  return fileUrl.split('/').pop();
};

export default function EditDocumentModal({ open, onClose, doc, onUpdate, username }) {
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
  const [originalRemarks, setOriginalRemarks] = useState('');

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
      setOriginalRemarks(doc.remarks || '');
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
    
    // Special handling for remarks to protect original text
    if (name === 'remarks') {
      // If there's original remarks text, ensure it cannot be modified
      if (originalRemarks && originalRemarks.length > 0) {
        // Check if the new value still contains the original text at the beginning
        if (value.startsWith(originalRemarks)) {
          const newText = value.slice(originalRemarks.length).replace(/^\n*/, '');
          // Allow this change - original text is preserved
          setFormData(prev => ({
            ...prev,
            [name]: originalRemarks + '\n\n' + newText
          }));
        } else {
          // Don't allow this change - original text would be modified
          // Keep the original text and only allow additions after it
          setFormData(prev => ({
            ...prev,
            [name]: originalRemarks
          }));
          return;
        }
      } else {
        // No original remarks, allow any change
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      // For all other fields, handle normally
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // If changing status to Archived, validate date
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

    // If changing status from Completed to Ongoing, prevent it
    if (name === 'status' && value === 'Ongoing' && initialData && initialData.status === 'Completed') {
      setErrors(prev => ({
        ...prev,
        status: 'Cannot change status from Completed back to Ongoing.'
      }));
      setFormData(prev => ({
        ...prev,
        status: initialData.status // Reset to original status
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

  // Utility helpers for follow-up validation
  const getBaseDocumentId = (documentId) => {
    if (!documentId) return '';
    const parts = documentId.split('-');
    if (parts.length >= 5) {
      return parts.slice(0, 4).join('-');
    }
    return documentId;
  };

  const hasOngoingFollowUps = async (baseId) => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/pdpms/manila-city-hall/ongoing-documents/');
      return res.data.some((item) => {
        const id = item.document_id || item.id || '';
        if (!id.startsWith(baseId)) return false;
        const parts = id.split('-');
        const ext = parts.length >= 5 ? parts[parts.length - 1] : '';
        if (!ext || ext === '0000') return false; // only follow-ups
        const status = (item.document_status || item.status || '').replace(/\s/g,'').toLowerCase();
        return status === 'ongoing';
      });
    } catch (err) {
      console.error('Failed to check ongoing follow-ups:', err);
      // If the check fails, be safe and treat as having ongoing follow-ups
      return true;
    }
  };

  // Submit handler with extra logic for archived status
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'remarks') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });

    // Add the 5-year status-archived validation
    if (formData.status === 'Archived' && !isOver5Years(formData.date)) {
      newErrors.status = "Cannot set as Archived unless the document date is at least 5 years ago.";
    }

    // Prevent changing status FROM Archived to anything else
    if (initialData && initialData.status === 'Archived' && formData.status !== 'Archived') {
      newErrors.status = 'You cannot change status after it has been archived.';
    }

    // Prevent changing status FROM Completed to Ongoing
    if (initialData && initialData.status === 'Completed' && formData.status === 'Ongoing') {
      newErrors.status = 'Cannot change status from Completed back to Ongoing.';
    }

    // Check for username
    if (!username) {
      newErrors.submit = 'No username provided. Please log in and try again.';
    }

        // Async validation: prevent archiving when ongoing follow-ups still exist
    if (formData.status === 'Archived') {
      const baseId = getBaseDocumentId(doc.id);
      const ongoingExist = await hasOngoingFollowUps(baseId);
      if (ongoingExist) {
        newErrors.status = 'This document still has an ongoing file and cannot be moved to the archive section.';
      }
    }

    // Always set errors after async validation
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && hasChanges && onUpdate) {
      try {
        onUpdate(formData);
        try {
          await logActivity(username, `Edited a Record in Public Documents (Document ID: ${doc.id})`, doc.id);
        } catch (logError) {
          setErrors({ ...errors, submit: logError.message });
        }
        onClose();
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Failed to update document. Please try again.';
        setErrors({ ...errors, submit: errorMessage });
      }
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
                disabled
                style={{background:'#e8eef7'}}
              />
              {errors.referenceCode && <div className="PublicDocument-ErrorText">{errors.referenceCode}</div>}

              <label className="PublicDocument-ModalLabel">Subject/Description</label>
              <textarea 
                className="PublicDocument-ModalInput PublicDocument-ModalTextarea" 
                rows={3}
                value={doc.subject || 'Intern Application'} 
                disabled 
                style={{
                  background:'#e8eef7',
                  resize: 'none'
                }}
              />

              <label className="PublicDocument-ModalLabel">Document Type</label>
              <select className="PublicDocument-ModalInput" value={doc.type || ''} disabled style={{background:'#e8eef7'}}>
                <option>Endorsements</option>
                <option>Memorandums</option>
                <option>Dispositions</option>
                <option>Special Orders</option>
                <option>Request Letters</option>
                <option>Employee Documents</option>
                <option>Property Records</option>
                <option>Others</option>
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
                disabled={formData.status === 'Archived'}
              >
                <option value="">Select Status</option>
                <option value="Completed">Completed</option>
                <option 
                  value="Ongoing" 
                  disabled={initialData && initialData.status === 'Completed'}
                >
                  Ongoing{initialData && initialData.status === 'Completed' ? ' (Cannot revert from Completed)' : ''}
                </option>
                <option value="Archived" disabled={!isOver5Years(formData.date)}>
                  Archived{formData.date && !isOver5Years(formData.date) ? ' (5+ yrs only)' : ''}
                </option>
              </select>
              {errors.status && (
                <div style={{ color: 'gray', marginTop: 4, fontSize: '0.9em' }}>
                  {errors.status}
                </div>
              )}
              {formData.status === 'Archived' && errors.status !== 'This document still has an ongoing file and cannot be moved to the archive section.' &&
                <div className="PublicDocument-ErrorText" style={{color: 'gray', fontSize: '0.9em', marginTop: 3}}>
                  Status is archived and can no longer be changed.
                </div>
              }
              {initialData && initialData.status === 'Completed' && formData.status === 'Completed' && errors.status !== 'This document still has an ongoing file and cannot be moved to the archive section.' &&
                <div className="PublicDocument-ErrorText" style={{color: 'gray', fontSize: '0.9em', marginTop: 3}}>
                  Status cannot be changed from Completed to Ongoing.
                </div>
              }

              <label className="PublicDocument-ModalLabel">New Remarks</label>
                <textarea
                  className="PublicDocument-ModalInput PublicDocument-ModalTextarea"
                  rows={4}
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
              />
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