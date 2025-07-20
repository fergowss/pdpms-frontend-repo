import React, { useState, useEffect, useRef } from 'react';
import './AssetProperty.css';
import axios from 'axios';

// Utility function to generate a unique log ID
function generateLogId() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `LOG-ASSET-${year}-${random}`;
}

// Utility function to log activity
async function logActivity(username, action, propertyNo) {
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
      action_log: 'Transferred an Asset Property',
      timestamp,
    });
    console.log(`Activity logged: ${action} by ${username} for Property No: ${propertyNo}`);
  } catch (error) {
    console.error('Failed to log activity:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to log activity. Please try again.');
  }
}

export default function TransferPropertyModal({ open, onClose, row, onTransfer, existingParNos = [], username = '' }) {
  // State for base data
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
  const [basePropertyNo, setBasePropertyNo] = useState('');
  const [propExtension, setPropExtension] = useState('');
  const [baseDocumentId, setBaseDocumentId] = useState('');
  const [docExtension, setDocExtension] = useState('');
  const [isDocumentValid, setIsDocumentValid] = useState(true);
  const [documentValidationMessage, setDocumentValidationMessage] = useState('');
  const [isDocumentLoading, setIsDocumentLoading] = useState(false);
  const [unitCostLocked, setUnitCostLocked] = useState(false);
  const [usedExtensions, setUsedExtensions] = useState([]);
  const [usedPropertyExtensions, setUsedPropertyExtensions] = useState([]);
  const [isDocDuplicate, setIsDocDuplicate] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeeSearchInput, setEmployeeSearchInput] = useState('');
  const [employeeSearchResults, setEmployeeSearchResults] = useState([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [isValidatingEmployee, setIsValidatingEmployee] = useState(false);
  const [employeeValidationMessage, setEmployeeValidationMessage] = useState('');
  const [employeeValidationStatus, setEmployeeValidationStatus] = useState('');
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState(false);
  // PAR No validation states
  const [isParDuplicate, setIsParDuplicate] = useState(false);
  const [parValidationMessage, setParValidationMessage] = useState('');

  // Document ID dropdown states
  const [docIds, setDocIds] = useState([]);
  const [docSearchInput, setDocSearchInput] = useState('');
  const [docSearchResults, setDocSearchResults] = useState([]);
  const [showDocDropdown, setShowDocDropdown] = useState(false);
  const [docValidationStatus, setDocValidationStatus] = useState('');
  const [docValidationMessage, setDocValidationMessage] = useState('');
  const [docFocusedSuggestionIndex, setDocFocusedSuggestionIndex] = useState(-1);
  const docDropdownRef = useRef(null);
  const docInputRef = useRef(null);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const API_URL = 'http://127.0.0.1:8000';
  const EMPLOYEES_ENDPOINT = `${API_URL}/pdpms/manila-city-hall/employees/`;
  const DOCUMENTS_ENDPOINT = `${API_URL}/pdpms/manila-city-hall/documents/`;
  const PROPERTIES_ENDPOINT = `${API_URL}/pdpms/manila-city-hall/properties/`;

  // Reset states when modal opens/closes
  useEffect(() => {
    if (open) {
      setUnitCostLocked(false);
      setIsTransferring(false);
      setTransferError('');
      setTransferSuccess(false);
      setEmployeeSearchInput('');
      setEmployeeValidationStatus('');
      setEmployeeValidationMessage('');
      setShowEmployeeDropdown(false);
      setIsDocumentValid(true);
      setDocumentValidationMessage('');
      setIsDocumentLoading(false);
      setUsedExtensions([]);
      setIsDocDuplicate(false);
      setDocSearchInput('');
      setDocValidationStatus('');
      setDocValidationMessage('');
      setShowDocDropdown(false);
      setDocFocusedSuggestionIndex(-1);
      setIsParDuplicate(false);
      setParValidationMessage('');
    }
  }, [open]);

  // Parse row data and clear remarks
  useEffect(() => {
    if (row) {
      const rawDocNo = row.documentNo || '';
      const parts = rawDocNo.split('-');
      const extension = parts.length > 1 ? parts.pop().trim() : '';
      const base = parts.join('-').trim();
      setBaseDocumentId(base);
      setDocExtension(extension);
      setDocSearchInput(rawDocNo);

      const rawPropNo = row.propertyNo || '';
      const propParts = rawPropNo.split(' - ');
      const baseProp = propParts[0] || '';
      setBasePropertyNo(baseProp);
      setPropExtension(propParts[1] || '');

      setFormData({
        propertyNo: rawPropNo,
        documentNo: rawDocNo,
        parNo: '',
        serialNo: row.serialNo || '',
        dateAcquired: row.dateAcquired || '',
        unitCost: row.unitCost || '',
        endUser: row.endUser || '',
        estimatedLife: row.estimatedLife || '',
        status: row.status || '',
        remarks: '', // Clear remarks on modal open
        description: row.description || ''
      });
    }
  }, [row]);

  // Fetch property extensions
  useEffect(() => {
    if (!open || !basePropertyNo) return;

    const fetchUsedPropertyExtensions = async () => {
      try {
        const res = await axios.get(PROPERTIES_ENDPOINT);
        const data = Array.isArray(res.data) ? res.data : [];
        const basePrefix = `${basePropertyNo} - `;
        const extensions = data
          .map(prop => prop.property_no || '')
          .filter(no => no.startsWith(basePrefix))
          .map(no => no.slice(basePrefix.length).trim())
          .filter(ext => ext !== '');
        setUsedPropertyExtensions(extensions);

        const nums = extensions
          .map(ext => parseInt(ext, 10))
          .filter(n => !isNaN(n));
        const nextNum = nums.length ? Math.max(...nums) + 1 : 1;
        const nextExt = nextNum.toString().padStart(4, '0');
        setPropExtension(nextExt);
        setFormData(prev => ({ ...prev, propertyNo: `${basePropertyNo} - ${nextExt}` }));
      } catch (err) {
        console.error('Failed to fetch property numbers:', err);
        const fallbackExt = '0001';
        setPropExtension(fallbackExt);
        setFormData(prev => ({ ...prev, propertyNo: `${basePropertyNo} - ${fallbackExt}` }));
      }
    };

    fetchUsedPropertyExtensions();
  }, [open, basePropertyNo]);

  // Fetch employees
  useEffect(() => {
    if (!open) return;

    const loadEmployees = async () => {
      try {
        const res = await axios.get(EMPLOYEES_ENDPOINT);
        const data = Array.isArray(res.data) ? res.data : [];
        const normalized = data.map(emp => ({
          id: emp.employee_id,
          name: `${emp.first_name} ${emp.last_name}`,
          department: emp.department || '',
        }));
        setEmployees(normalized);
      } catch (err) {
        console.error('Unable to fetch employees:', err);
        setEmployees([]);
      }
    };

    loadEmployees();
  }, [open]);

  // Debounced search for document IDs
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmed = docSearchInput.trim();
      if (trimmed === '') {
        setDocSearchResults([]);
        setShowDocDropdown(false);
        setDocValidationStatus('');
        setDocValidationMessage('');
        setIsDocDuplicate(false);
        setIsDocumentValid(true);
        return;
      }

      searchDocuments(trimmed);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [docSearchInput]);

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowEmployeeDropdown(false);
        setFocusedSuggestionIndex(-1);
      }
      if (docDropdownRef.current && !docDropdownRef.current.contains(e.target) &&
          docInputRef.current && !docInputRef.current.contains(e.target)) {
        setShowDocDropdown(false);
        setDocFocusedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search documents
  const searchDocuments = (searchTerm) => {
    const term = searchTerm.toLowerCase();
    setIsDocumentLoading(true);
    axios
      .get(DOCUMENTS_ENDPOINT)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const propertyRecords = data.filter(doc => doc.document_type === 'Property Records');

        const incrementedDocIds = propertyRecords
          .filter(doc => {
            const docNo = (
              doc.document_no ||
              doc.documentNo ||
              doc.document_id ||
              doc.id ||
              doc.public_document_id ||
              doc.doc_id ||
              ''
            ).trim();
            const parts = docNo.split('-');
            if (parts.length >= 4) {
              const lastPart = parts[parts.length - 1];
              return /^\d{4}$/.test(lastPart) && docNo.toLowerCase().includes(term);
            }
            return false;
          })
          .map(doc => {
            const docNo = (
              doc.document_no ||
              doc.documentNo ||
              doc.document_id ||
              doc.id ||
              doc.public_document_id ||
              doc.doc_id ||
              ''
            ).trim();
            return docNo;
          });

        setDocSearchResults(incrementedDocIds);
        setShowDocDropdown(incrementedDocIds.length > 0);
        setDocFocusedSuggestionIndex(-1);

        const isDuplicate = usedExtensions.includes(docExtension);
        setIsDocDuplicate(isDuplicate);
        if (isDuplicate) {
          setDocValidationStatus('invalid');
          setDocValidationMessage('The Document ID extension has been used');
          setIsDocumentValid(false);
        } else if (incrementedDocIds.some(id => id.toLowerCase() === term)) {
          setDocValidationStatus('valid');
          setDocValidationMessage('');
          setIsDocumentValid(true);
        } else {
          setDocValidationStatus('invalid');
          setDocValidationMessage('No Property Records document with increment suffix found.');
          setIsDocumentValid(false);
        }
        setIsDocumentLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch documents:', err);
        setDocValidationStatus('invalid');
        setDocValidationMessage('Failed to fetch documents.');
        setIsDocumentValid(false);
        setIsDocumentLoading(false);
      });
  };

  // Handle document selection
  const handleDocSelect = (id) => {
    setDocSearchInput(id);
    const parts = id.split('-');
    const extension = parts.pop().trim();
    const base = parts.join('-').trim();

    const isValidIncrement = /^\d{4}$/.test(extension);
    if (!isValidIncrement) {
      setDocValidationStatus('invalid');
      setDocValidationMessage('Document ID must have a 4-digit increment suffix (e.g., 0001)');
      setIsDocumentValid(false);
      return;
    }

    setBaseDocumentId(base);
    setDocExtension(extension);

    const newFormData = {
      ...formData,
      documentNo: id
    };
    setFormData(newFormData);
    setShowDocDropdown(false);
    setDocFocusedSuggestionIndex(-1);

    axios.get(`${DOCUMENTS_ENDPOINT}${id}/`)
      .then(res => {
        if (res.data.document_type !== 'Property Records') {
          setDocValidationStatus('invalid');
          setDocValidationMessage('Document ID must be a Property Records.');
          setIsDocumentValid(false);
        } else if (usedExtensions.includes(extension)) {
          setDocValidationStatus('invalid');
          setDocValidationMessage('This Document ID extension has been used.');
          setIsDocDuplicate(true);
          setIsDocumentValid(false);
        } else {
          setDocValidationStatus('valid');
          setDocValidationMessage('');
          setIsDocumentValid(true);
          setIsDocDuplicate(false);
        }
      })
      .catch(err => {
        console.error('Error validating document type:', err);
        setDocValidationStatus('invalid');
        setDocValidationMessage('Unable to validate document type.');
        setIsDocumentValid(false);
      });

    if (docInputRef.current) {
      docInputRef.current.focus();
    }
  };

  // Handle document input change
  const handleDocumentInputChange = (e) => {
    const value = e.target.value;
    setDocSearchInput(value);

    const parts = value.split('-');
    if (parts.length < 2) {
      setBaseDocumentId(value.trim());
      setDocExtension('');
      setFormData(prev => ({ ...prev, documentNo: value.trim() }));
      setIsDocumentValid(false);
      setDocValidationStatus('');
      setDocValidationMessage('');
      return;
    }

    const extension = parts.pop().trim();
    const base = parts.join('-').trim();

    setBaseDocumentId(base);
    setDocExtension(extension);
    setFormData(prev => ({ ...prev, documentNo: `${base}-${extension}` }));

    const isValidExtension = /^\d{4}$/.test(extension);
    setIsDocDuplicate(isValidExtension && usedExtensions.includes(extension));

    if (!isValidExtension && extension !== '') {
      setDocValidationStatus('invalid');
      setDocValidationMessage('Document ID must have a 4-digit increment suffix (e.g., 0001)');
      setIsDocumentValid(false);
    } else if (isDocDuplicate) {
      setDocValidationStatus('invalid');
      setDocValidationMessage('This Document ID extension has already been used');
      setIsDocumentValid(false);
    } else {
      setDocValidationStatus('');
      setDocValidationMessage('');
    }
  };

  // Handle document key down
  const handleDocKeyDown = (e) => {
    if (!showDocDropdown || docSearchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDocFocusedSuggestionIndex(prev =>
        prev < docSearchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDocFocusedSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && docFocusedSuggestionIndex >= 0) {
      e.preventDefault();
      handleDocSelect(docSearchResults[docFocusedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowDocDropdown(false);
      setDocFocusedSuggestionIndex(-1);
    }
  };

  // Search employees
  const searchEmployees = (searchTerm) => {
    const term = searchTerm.toLowerCase();
    const results = employees.filter(emp =>
      emp.id.toLowerCase().includes(term) ||
      emp.name.toLowerCase().includes(term) ||
      (emp.department && emp.department.toLowerCase().includes(term))
    );

    setEmployeeSearchResults(results);
    setShowEmployeeDropdown(results.length > 0);
    setFocusedSuggestionIndex(-1);

    const exactMatch = employees.find(emp => emp.id.toLowerCase() === term);
    if (exactMatch) {
      setEmployeeValidationStatus('valid');
      setEmployeeValidationMessage('');
    } else {
      setEmployeeValidationStatus('invalid');
      setEmployeeValidationMessage('No employee found.');
    }
  };

  // Employee validation
  useEffect(() => {
    if (!formData.endUser) {
      setEmployeeValidationStatus('');
      setEmployeeValidationMessage('');
      return;
    }

    const exactMatch = employees.find(emp => emp.name === formData.endUser);
    if (exactMatch) {
      setEmployeeValidationStatus('valid');
      setEmployeeValidationMessage('');
      return;
    }

    setEmployeeValidationStatus('invalid');
    setEmployeeValidationMessage('Please select a valid employee from the dropdown.');
  }, [formData.endUser, employees]);

  // Employee search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmed = employeeSearchInput.trim();
      if (trimmed === '') {
        setShowEmployeeDropdown(false);
        setEmployeeValidationStatus('');
        setEmployeeValidationMessage('');
        return;
      }
      searchEmployees(trimmed);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [employeeSearchInput]);

  // Handle employee select
  const handleEmployeeSelect = (employee) => {
    setFormData(prev => ({
      ...prev,
      endUser: employee.id
    }));
    setEmployeeSearchInput(employee.name);
    setShowEmployeeDropdown(false);
    setEmployeeValidationStatus('valid');
    setEmployeeValidationMessage('');
  };

  // Handle key down for employee dropdown
  const handleKeyDown = (e) => {
    if (!showEmployeeDropdown || employeeSearchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedSuggestionIndex(prev =>
        prev < employeeSearchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedSuggestionIndex(prev =>
        prev > 0 ? prev - 1 : 0
      );
    } else if (e.key === 'Enter' && focusedSuggestionIndex >= 0) {
      e.preventDefault();
      handleEmployeeSelect(employeeSearchResults[focusedSuggestionIndex]);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'documentNoCombined') {
      handleDocumentInputChange(e);
    } else if (name === 'endUser') {
      setEmployeeSearchInput(value);
      setFormData(prev => ({
        ...prev,
        endUser: value
      }));
    } else if (name === 'parNo') {
      setFormData(prev => ({ ...prev, [name]: value }));
      validateParNo(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // PAR No validation
  const validateParNo = (value) => {
    const trimmed = value.trim();
    let isValid = true;

    const isDuplicate = existingParNos.some(parNo => parNo.toLowerCase() === trimmed.toLowerCase());
    setIsParDuplicate(isDuplicate);

    if (trimmed === '') {
      setParValidationMessage('');
      isValid = false;
    } else if (isDuplicate) {
      setParValidationMessage('PAR No. has already been used');
      isValid = false;
    } else {
      setParValidationMessage('');
    }

    return isValid;
  };

  // Form validation
  useEffect(() => {
    const hasDocumentId = baseDocumentId.trim() !== '' && docExtension.trim() !== '';
    const hasValidEndUser = employeeSearchInput.trim() !== '' &&
      formData.endUser?.toString().trim() !== '' &&
      employeeValidationStatus === 'valid';
    const hasValidParNo = !isParDuplicate;

    setFormValid(
      hasDocumentId &&
      hasValidEndUser &&
      hasValidParNo &&
      !isTransferring &&
      isDocumentValid &&
      !isDocumentLoading &&
      docValidationStatus === 'valid' &&
      !isDocDuplicate
    );
  }, [
    baseDocumentId,
    docExtension,
    formData.endUser,
    employeeValidationStatus,
    employeeSearchInput,
    isTransferring,
    isDocumentValid,
    isDocumentLoading,
    docValidationStatus,
    isDocDuplicate,
    isParDuplicate
  ]);

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formValid || isDocDuplicate || isTransferring || !isDocumentValid || isDocumentLoading || docValidationStatus !== 'valid' || isParDuplicate) {
      if (isParDuplicate) {
        setParValidationMessage('PAR No. has already been used');
      }
      return;
    }

    setIsTransferring(true);
    setTransferError('');
    setTransferSuccess(false);
    setUnitCostLocked(true);

    try {
      const fullDocumentNo = `${baseDocumentId}-${docExtension.trim()}`;
      const fullPropertyNo = `${basePropertyNo} - ${propExtension}`;

      const transferData = {
        ...formData,
        documentNo: fullDocumentNo,
        propertyNo: fullPropertyNo,
        originalPropertyNo: row.propertyNo
      };

      if (onTransfer) {
        await onTransfer(transferData);
      }

      try {
        // Log activity
        await logActivity(
          username, 
          `Transferred an Asset Property (Property No: ${formData.parNo}, Document ID: ${formData.documentNo})`,
          formData.parNo
          );
        } catch (err) {
          console.error('Failed to add property or log activity:', err);
        }

      setTransferSuccess(true);
      setIsTransferring(false);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Transfer failed:', error);
      setTransferError(error.message || 'Transfer failed. Please try again.');
      setIsTransferring(false);
      setUnitCostLocked(false);
    }
  };

  if (!open) return null;

  return (
    <div className="AssetProperty-EditModalOverlay">
      <div className="AssetProperty-EditModalBox">
        <form className="AssetProperty-ModalForm" onSubmit={handleSubmit} noValidate>
          <div className="AssetProperty-ModalGrid AssetProperty-ModalGrid--3col">
            <div>
              <label className="AssetProperty-ModalLabel">Property No.</label>
              <input
                className="AssetProperty-ModalInput"
                type="text"
                value={`${basePropertyNo} - ${propExtension}`}
                disabled
                style={{ background: '#e8eef7' }}
              />

              <label className="AssetProperty-ModalLabel">Document ID</label>
              <div className="AssetProperty-EmployeeSearchContainer">
                <input
                  ref={docInputRef}
                  className={`AssetProperty-ModalInput AssetProperty-ModalInput--${docValidationStatus || 'default'}`}
                  type="text"
                  name="documentNoCombined"
                  value={docSearchInput}
                  onChange={handleDocumentInputChange}
                  onKeyDown={handleDocKeyDown}
                  disabled={isTransferring}
                  autoComplete="off"
                  placeholder="Type document ID (e.g., PUBL-DOCU-2025-9ab552-0001)"
                />
                {showDocDropdown && docSearchResults.length > 0 && !isTransferring && (
                  <div className="AssetProperty-EmployeeDropdown" ref={docDropdownRef}>
                    {docSearchResults.map((id, index) => (
                      <div
                        key={id}
                        className={`AssetProperty-EmployeeOption ${index === docFocusedSuggestionIndex ? 'AssetProperty-EmployeeOption--focused' : ''}`}
                        onClick={() => handleDocSelect(id)}
                      >
                        <div className="AssetProperty-EmployeeOption-Name">{id}</div>
                      </div>
                    ))}
                  </div>
                )}
                {isDocumentLoading && (
                  <div className="AssetProperty-ValidationMessage">
                    Validating Document ID...
                  </div>
                )}
                {docValidationStatus && (
                  <div className={`AssetProperty-EmployeeValidation AssetProperty-EmployeeValidation--${docValidationStatus}`}>
                    {docValidationMessage}
                  </div>
                )}
              </div>

              <label className="AssetProperty-ModalLabel">PAR No.</label>
              <input
                className={`AssetProperty-ModalInput ${isParDuplicate ? 'AssetProperty-ModalInput--invalid' : ''}`}
                type="text"
                name="parNo"
                value={formData.parNo}
                onChange={handleInputChange}
                disabled={isTransferring}
              />
              {parValidationMessage && (
                <div className="AssetProperty-EmployeeValidation AssetProperty-EmployeeValidation--invalid">
                  {parValidationMessage}
                </div>
              )}

              <label className="AssetProperty-ModalLabel">Description</label>
              <textarea
                className="AssetProperty-ModalInput AssetProperty-ModalTextarea"
                rows={3}
                value={formData.description}
                disabled
                style={{ background: '#e8eef7', resize: 'none' }}
              />
            </div>

            <div>
              <label className="AssetProperty-ModalLabel">Serial No.</label>
              <textarea
                className="AssetProperty-ModalInput AssetProperty-ModalTextarea"
                value={formData.serialNo}
                disabled
                style={{ background: '#e8eef7', resize: 'none' }}
                rows={3}
              />

              <label className="AssetProperty-ModalLabel">Date Acquired</label>
              <input
                className="AssetProperty-ModalInput"
                type="date"
                value={formData.dateAcquired}
                disabled
                style={{ background: '#e8eef7' }}
              />

              <label className="AssetProperty-ModalLabel">Unit Cost</label>
              <input
                className="AssetProperty-ModalInput"
                type="text"
                name="unitCost"
                value={formData.unitCost}
                disabled
                style={{ background: '#e8eef7' }}
              />

              <label className="AssetProperty-ModalLabel">End User</label>
              <div className="AssetProperty-EmployeeSearchContainer">
                <input
                  ref={inputRef}
                  className={`AssetProperty-ModalInput AssetProperty-ModalInput--${employeeValidationStatus || 'default'}`}
                  type="text"
                  name="endUser"
                  value={employeeSearchInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => employeeSearchResults.length > 0 && setShowEmployeeDropdown(true)}
                  disabled={isTransferring}
                  autoComplete="off"
                  required
                  placeholder="Enter employee name or ID"
                />
                {showEmployeeDropdown && employeeSearchResults.length > 0 && !isTransferring && (
                  <div className="AssetProperty-EmployeeDropdown" ref={dropdownRef}>
                    {employeeSearchResults.map((employee, index) => (
                      <div
                        key={employee.id}
                        className={`AssetProperty-EmployeeOption ${index === focusedSuggestionIndex ? 'AssetProperty-EmployeeOption--focused' : ''}`}
                        onClick={() => handleEmployeeSelect(employee)}
                      >
                        <div className="AssetProperty-EmployeeOption-Name">{employee.name}</div>
                        <div className="AssetProperty-EmployeeOption-Id">{employee.id}</div>
                        {employee.department && (
                          <div className="AssetProperty-EmployeeOption-Department">{employee.department}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {isValidatingEmployee ? (
                  <div className="AssetProperty-EmployeeValidation">
                    <span>Searching...</span>
                  </div>
                ) : employeeValidationStatus === 'valid' && employeeSearchInput.trim() !== '' && (
                  <div className="AssetProperty-EmployeeValidation AssetProperty-EmployeeValidation--valid">
                    <span>✓ Valid employee</span>
                  </div>
                )}
                {employeeValidationStatus === 'invalid' && employeeSearchInput.trim() !== '' && (
                  <div className="AssetProperty-EmployeeValidation AssetProperty-EmployeeValidation--invalid">
                    <span>{employeeValidationMessage}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="AssetProperty-ModalLabel">Estimated Life Use</label>
              <input
                className="AssetProperty-ModalInput"
                type="text"
                value={formData.estimatedLife}
                disabled
                style={{ background: '#e8eef7' }}
              />

              <label className="AssetProperty-ModalLabel">Status</label>
              <input
                className="AssetProperty-ModalInput"
                type="text"
                value={formData.status}
                disabled
                style={{ background: '#e8eef7' }}
              />

              <label className="AssetProperty-ModalLabel">Remarks</label>
              <textarea
                className="AssetProperty-ModalInput AssetProperty-ModalTextarea"
                rows={3}
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                disabled={isTransferring}
                style={{ resize: 'none' }}

              />
            </div>
          </div>

          {transferError && (
            <div className="AssetProperty-ValidationMessage AssetProperty-ValidationMessage--error" style={{ marginTop: '10px' }}>
              {transferError}
            </div>
          )}

          {transferSuccess && (
            <div className="AssetProperty-ValidationMessage AssetProperty-ValidationMessage--success" style={{ marginTop: '10px' }}>
              ✓ Transfer completed successfully! Closing modal...
            </div>
          )}

          <div className="AssetProperty-ModalActions">
            <button
              type="submit"
              className="AssetProperty-ModalBtn AssetProperty-ModalBtn--primary"
              disabled={!formValid || isDocDuplicate || isTransferring || !isDocumentValid || isDocumentLoading || docValidationStatus !== 'valid' || isParDuplicate}
            >
              {isTransferring ? 'TRANSFERRING...' : 'TRANSFER'}
            </button>
            <button
              type="button"
              className="AssetProperty-ModalBtn AssetProperty-ModalBtn--secondary"
              onClick={onClose}
              disabled={isTransferring}
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}