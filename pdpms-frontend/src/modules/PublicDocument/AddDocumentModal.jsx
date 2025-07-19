import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PublicDocument.css';

function isOver5Years(dateString) {
  if (!dateString) return false;
  const docDate = new Date(dateString);
  if (isNaN(docDate.getTime())) return false;
  const now = new Date();
  const yearsDiff = (now - docDate) / (1000 * 60 * 60 * 24 * 365.25);
  return yearsDiff >= 5;
}

function validatePdfFile(file) {
  if (!file) return '';
  if (file.type !== 'application/pdf') return 'Only PDF files are allowed';
  if (file.size > 10 * 1024 * 1024) return 'File size must be 10MB or less';
  return '';
}

function generateReferenceCodeFromDate(dateString) {
  if (!dateString) return 'REF-CD-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'REF-CD-';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `REF-CD-${year}-${month}`;
}

function generateLogId() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `LOG-DOC-${year}-${random}`;
}

async function logActivity(username, action, documentId) {
  if (!username) {
    console.warn('Unable to log activity: No username available');
    return;
  }
  const logId = generateLogId();
  const timestamp = new Date().toISOString();
  try {
    await axios.post('http://127.0.0.1:8000/pdpms/manila-city-hall/activity-logs/', {
      log_id: logId,
      username,
      action_log: 'Added a Record in Public Documents',
      timestamp,
    });
    console.log(`Activity logged: ${action} by ${username} for Document ID: ${documentId}`);
  } catch (error) {
    console.error('Failed to log activity:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to log activity. Please try again.');
  }
}

export default function AddDocumentModal({ open, onClose, onAdd, username }) {
  const [formData, setFormData] = useState({
    referenceCode: 'REF-CD-',
    subject: '',
    documentType: '',
    date: '',
    dateReceived: '',
    status: '',
    remarks: '',
    file: null,
    receivedBy: '',
  });
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current year and month dynamically
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const currentDay = String(currentDate.getDate()).padStart(2, '0');
  const maxDate = `${currentYear}-${currentMonth}-${currentDay}`;

  useEffect(() => {
    if (!open) {
      setFormData({
        referenceCode: 'REF-CD-',
        subject: '',
        documentType: '',
        date: '',
        dateReceived: '',
        status: '',
        remarks: '',
        file: null,
        receivedBy: '',
      });
      setErrors({});
      setIsFormValid(false);
      setIsSubmitting(false);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    }
  }, [open]);

  useEffect(() => {
    const requiredFields = [
      'referenceCode',
      'subject',
      'documentType',
      'date',
      'dateReceived',
      'status',
      'receivedBy',
    ]; // Remarks is not required
    const allFieldsFilled = requiredFields.every(
      (field) => formData[field] && formData[field].toString().trim() !== ''
    );
    const hasNoErrors = Object.values(errors).every((error) => !error);
    setIsFormValid(allFieldsFilled && hasNoErrors);
  }, [formData, errors]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      const file = files[0];
      setFormData((prev) => ({ ...prev, file }));
      setErrors((prev) => ({ ...prev, file: validatePdfFile(file) }));
    } else if (name === 'date') {
      // When date changes, automatically update reference code
      const newReferenceCode = generateReferenceCodeFromDate(value);
      setFormData((prev) => ({ 
        ...prev, 
        date: value,
        referenceCode: newReferenceCode
      }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
      if (errors.referenceCode) setErrors((prev) => ({ ...prev, referenceCode: '' }));
      
      // Handle status validation for archived documents
      if (formData.status === 'Archived' && !isOver5Years(value)) {
        setFormData((prev) => ({ ...prev, status: '' }));
        setErrors((prev) => ({
          ...prev,
          status: 'Cannot select Archived unless the document date is at least 5 years ago.',
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateField = (name, value) => {
    if (name === 'file') return '';
    if (name === 'referenceCode') {
      if (!value || value === 'REF-CD-') return 'Please select a date first to generate the reference code.';
      return '';
    }
    // Only apply "required" validation to required fields, exclude "remarks"
    if (name !== 'remarks' && (!value || value.toString().trim() === '')) return 'This field is required.';
    return '';
  };

  const handleBlur = (e) => {
    const { name, value, files } = e.target;
    const val = name === 'file' ? files[0] : value;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, val) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const requiredFields = [
      'referenceCode',
      'subject',
      'documentType',
      'date',
      'dateReceived',
      'status',
      'receivedBy',
    ]; // Remarks is not required
    requiredFields.forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });
    if (formData.file) {
      const fileError = validatePdfFile(formData.file);
      if (fileError) newErrors.file = fileError;
    }
    if (formData.status === 'Archived' && !isOver5Years(formData.date)) {
      newErrors.status = 'Cannot set as Archived unless document date is at least 5 years ago.';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0 && onAdd) {
      setIsSubmitting(true);
      const data = new FormData();
      const documentId = generateDocumentId();
      data.append('document_id', documentId);
      data.append('reference_code', formData.referenceCode);
      data.append('subject', formData.subject);
      data.append('document_type', formData.documentType);
      data.append('document_date', formData.date);
      data.append('date_received', formData.dateReceived);
      data.append('received_by', formData.receivedBy);
      data.append('document_status', formData.status);
      data.append('remarks', formData.remarks);
      if (formData.file) data.append('pdf_file', formData.file);
      try {
        await axios.post('http://127.0.0.1:8000/pdpms/manila-city-hall/documents/', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        try {
          await logActivity(username, `Added a Record in Public Documents (Document ID: ${documentId})`, documentId);
        } catch (logError) {
          setErrors({ ...errors, submit: logError.message });
        }
        onAdd({ ...formData, document_id: documentId });
        onClose();
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Failed to add document. Please try again.';
        setErrors({ ...errors, submit: errorMessage });
        setIsFormValid(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  function generateDocumentId() {
    const year = new Date().getFullYear();
    const random = Math.random().toString(16).substr(2, 6);
    return `PUBL-DOCU-${year}-${random}`;
  }

  if (!open) return null;

  return (
    <div className="PublicDocument-ModalOverlay">
      <div
        className="PublicDocument-ModalBox"
        style={{ minWidth: '700px', maxWidth: '700px', width: '700px' }}
      >
        <form className="PublicDocument-ModalForm" onSubmit={handleSubmit}>
          <div className="PublicDocument-ModalGrid">
            <div>
              <label className="PublicDocument-ModalLabel">Reference Code</label>
              <input
                className={`PublicDocument-ModalInput ${errors.referenceCode ? 'PublicDocument-InputError' : ''}`}
                type="text"
                name="referenceCode"
                value={formData.referenceCode}
                readOnly
              />
              {errors.referenceCode && (
                <div className="PublicDocument-ErrorText" style={{ color: 'red' }}>{errors.referenceCode}</div>
              )}
              <label className="PublicDocument-ModalLabel"> Subject/Description</label>
              <textarea
                className={`PublicDocument-ModalInput PublicDocument-ModalTextarea ${
                  errors.subject ? 'PublicDocument-InputError' : ''
                }`}
                rows={4}
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <label className="PublicDocument-ModalLabel">Document Type</label>
              <select
                className={`PublicDocument-ModalInput ${errors.documentType ? 'PublicDocument-InputError' : ''}`}
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                onBlur={handleBlur}
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
              <label className="PublicDocument-ModalLabel">Date</label>
              <input
                className={`PublicDocument-ModalInput ${errors.date ? 'PublicDocument-InputError' : ''}`}
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                onBlur={handleBlur}
                max={maxDate}
              />
              <label className="PublicDocument-ModalLabel">Date Received</label>
              <input
                className={`PublicDocument-ModalInput ${errors.dateReceived ? 'PublicDocument-InputError' : ''}`}
                type="date"
                name="dateReceived"
                value={formData.dateReceived}
                onChange={handleChange}
                onBlur={handleBlur}
                max={maxDate}
              />
            </div>
            <div>
              <label className="PublicDocument-ModalLabel">Received by</label>
              <input
                className={`PublicDocument-ModalInput ${errors.receivedBy ? 'PublicDocument-InputError' : ''}`}
                type="text"
                name="receivedBy"
                value={formData.receivedBy}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.receivedBy && (
                <div className="PublicDocument-ErrorText" style={{ color: 'red' }}>{errors.receivedBy}</div>
              )}
              <label className="PublicDocument-ModalLabel">Status</label>
              <select
                className={`PublicDocument-ModalInput ${errors.status ? 'PublicDocument-InputError' : ''}`}
                name="status"
                value={formData.status}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">Select Status</option>
                <option value="Completed">Completed</option>
                <option value="Ongoing">Ongoing</option>
                {isOver5Years(formData.date) && (
                  <option value="Archived">Archived</option>
                )}
              </select>
              {errors.status && <div className="PublicDocument-ErrorText" style={{ color: 'red' }}>{errors.status}</div>}
              <label className="PublicDocument-ModalLabel">Remarks</label> {/* Optional, no asterisk */}
              <textarea
                className={`PublicDocument-ModalInput PublicDocument-ModalTextarea ${
                  errors.remarks ? 'PublicDocument-InputError' : ''
                }`}
                rows={4}
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <label className="PublicDocument-ModalLabel">
                Upload File <span className="PublicDocument-ModalHint">(PDF Only, Max 10MB)</span>
              </label>
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
                {errors.file && <div className="PublicDocument-ErrorText" style={{ color: 'red' }}>{errors.file}</div>}
              </div>
            </div>
          </div>
          {errors.submit && (
            <div className="PublicDocument-FormCenterError" style={{ color: 'red', textAlign: 'center', margin: '10px 0' }}>
              {errors.submit}
            </div>
          )}
          <div style={{ marginTop: '0.5rem' }}>
            <div className="PublicDocument-ModalActions">
              <button
                type="submit"
                className="PublicDocument-ModalBtn PublicDocument-ModalBtn--primary"
                disabled={!isFormValid || isSubmitting}
                style={{ opacity: isFormValid && !isSubmitting ? 1 : 0.6, cursor: isFormValid && !isSubmitting ? 'pointer' : 'not-allowed' }}
              >
                {isSubmitting ? 'ADDING...' : 'ADD'}
              </button>
              <button
                type="button"
                className="PublicDocument-ModalBtn PublicDocument-ModalBtn--secondary"
                onClick={onClose}
              >
                CANCEL
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}