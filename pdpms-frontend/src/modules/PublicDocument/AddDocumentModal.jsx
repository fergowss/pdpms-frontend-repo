import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields on submit
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && onAdd) {
      setIsSubmitting(true);
      const data = new FormData();
      const documentId = generateDocumentId();

      // Map frontend fields to Django backend fields
      data.append('document_id', documentId);
      data.append('reference_code', formData.referenceCode);
      data.append('subject', formData.subject);
      data.append('document_type', formData.documentType);
      data.append('document_date', formData.date);
      data.append('date_received', formData.dateReceived);
      data.append('received_by', "Herson Fergus Arcanghel");
      data.append('document_status', formData.status);
      data.append('remarks', formData.remarks);
      
      // Add the file
      if (formData.file) {
        data.append('pdf_file', formData.file);
      }

      // Debug: log all FormData entries
      for (let pair of data.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }

      try {
        const response = await axios.post('http://127.0.0.1:8000/pdpms/manila-city-hall/documents/', data, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            // Remove any Authorization header if you're not using authentication yet
          }
        });
        
        console.log('Document added successfully:', response.data);
        onAdd({ ...formData, document_id: documentId });
        
        // Reset form
        setFormData({
          referenceCode: '',
          subject: '',
          documentType: '',
          date: '',
          dateReceived: '',
          status: '',
          remarks: '',
          file: null
        });
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        
        onClose();
      } catch (error) {
        console.error('Error adding document:', error);
        let errorMessage = 'Failed to add document. Please try again.';
        
        if (error.response) {
          console.error('Error response:', error.response.data);
          errorMessage = error.response.data.detail || errorMessage;
        }
        
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
                <option value="Endorsements">Endorsements</option>
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
              <input className="PublicDocument-ModalInput" type="text" disabled readOnly style={{background:'#e8eef7'}} value="Herson Fergus Arcanghel" />
              
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
                <option value="Archived">Archived</option>
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
          
          {errors.submit && (
            <div className="PublicDocument-FormCenterError" style={{ color: 'red', textAlign: 'center', margin: '10px 0' }}>
              {errors.submit}
            </div>
          )}
          
          <div style={{ marginTop: '0.5rem' }}>
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
              return missingFields.length > 0 ? (
                <div className="PublicDocument-FormCenterError">All fields are required.</div>
              ) : null;
            })()}
            <div className="PublicDocument-ModalActions">
              <button 
                type="submit" 
                className="PublicDocument-ModalBtn PublicDocument-ModalBtn--primary"
                disabled={!isFormValid || isSubmitting}
                style={{
                  opacity: (isFormValid && !isSubmitting) ? 1 : 0.6,
                  cursor: (isFormValid && !isSubmitting) ? 'pointer' : 'not-allowed'
                }}
              >
                {isSubmitting ? 'ADDING...' : 'ADD'}
              </button>
              <button type="button" className="PublicDocument-ModalBtn PublicDocument-ModalBtn--secondary" onClick={onClose}>CANCEL</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
