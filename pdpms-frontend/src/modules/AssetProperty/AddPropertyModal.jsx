import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AssetProperty.css';

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
      action_log: 'Added an Asset Property',
      timestamp,
    });
    console.log(`Activity logged: ${action} by ${username} for Property No: ${propertyNo}`);
  } catch (error) {
    console.error('Failed to log activity:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to log activity. Please try again.');
  }
}

export default function AddPropertyModal({ open, onClose, onAdd, existingDocIds = [], existingParNos = [], username = '' }) {
  // Today's date in YYYY-MM-DD format
  const todayStr = new Date().toISOString().split('T')[0];
  const [employees, setEmployees] = useState([]);
  const [employeeSearchInput, setEmployeeSearchInput] = useState('');
  const [employeeSearchResults, setEmployeeSearchResults] = useState([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [employeeValidationMessage, setEmployeeValidationMessage] = useState('');
  const [employeeValidationStatus, setEmployeeValidationStatus] = useState('');
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const [formValid, setFormValid] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // --- Document ID dropdown states ---
  const [docIds, setDocIds] = useState([]);
  const [docSearchInput, setDocSearchInput] = useState('');
  const [docSearchResults, setDocSearchResults] = useState([]);
  const [showDocDropdown, setShowDocDropdown] = useState(false);
  const [docValidationStatus, setDocValidationStatus] = useState('');
  const [docValidationMessage, setDocValidationMessage] = useState('');
  const [docFocusedSuggestionIndex, setDocFocusedSuggestionIndex] = useState(-1);
  const [isDocDuplicate, setIsDocDuplicate] = useState(false);
  const docDropdownRef = useRef(null);
  const docInputRef = useRef(null);

  // --- PAR No validation states ---
  const [isParDuplicate, setIsParDuplicate] = useState(false);
  const [parValidationMessage, setParValidationMessage] = useState('');

  const initialFormData = {
    documentNo: '',
    parNo: '',
    description: '',
    serialNo: '',
    dateAcquired: '',
    unitCost: '',
    endUser: '',
    estimatedLife: '',
    remarks: '',
    status: ''
  };
  const [formData, setFormData] = useState(initialFormData);
  const [validationErrors, setValidationErrors] = useState({ unitCost: '', estimatedLife: '' });

  const API_URL = 'http://127.0.0.1:8000';
  const EMPLOYEES_ENDPOINT = `${API_URL}/pdpms/manila-city-hall/employees/`;
  const DOCUMENTS_ENDPOINT = `${API_URL}/pdpms/manila-city-hall/documents/`;

  useEffect(() => {
    if (open) {
      setFormData({ ...initialFormData, dateAcquired: todayStr });
      setEmployeeSearchInput('');
      setEmployeeValidationStatus('');
      setEmployeeValidationMessage('');
      setDocSearchInput('');
      setDocValidationStatus('');
      setDocValidationMessage('');
      setIsDocDuplicate(false);
      setIsParDuplicate(false);
      setParValidationMessage('');
      setFormValid(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    axios
      .get(EMPLOYEES_ENDPOINT)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const normalized = data.reduce((acc, emp) => {
          const employee = {
            id: emp.employee_id,
            name: `${emp.first_name} ${emp.last_name}`,
            department: emp.department || ''
          };
          if (!acc.some(e => e.id === employee.id)) {
            acc.push(employee);
          }
          return acc;
        }, []);
        setEmployees(normalized);
      })
      .catch((err) => {
        console.error('Failed to fetch employees:', err);
      });
  }, [open]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmed = employeeSearchInput.trim();
      if (trimmed === '') {
        setEmployeeSearchResults([]);
        setShowEmployeeDropdown(false);
        setEmployeeValidationStatus('');
        setEmployeeValidationMessage('');
        updateFormValidation('endUser', '');
        return;
      }

      searchEmployees(trimmed);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [employeeSearchInput]);

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
        return;
      }

      searchDocuments(trimmed);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [docSearchInput]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !inputRef.current.contains(e.target)) {
        setShowEmployeeDropdown(false);
        setFocusedSuggestionIndex(-1);
      }
      // Document dropdown
      if (docDropdownRef.current && !docDropdownRef.current.contains(e.target) && !docInputRef.current.contains(e.target)) {
        setShowDocDropdown(false);
        setDocFocusedSuggestionIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Employee search helpers ---
  const searchEmployees = (searchTerm) => {
    const term = searchTerm.toLowerCase();
    const results = employees.filter(emp =>
      (emp.id.toLowerCase().includes(term) || emp.name.toLowerCase().includes(term)) &&
      !employeeSearchResults.some(res => res.id === emp.id)
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

  // --- Employee handlers ---
  const handleEmployeeSelect = (employee) => {
    setEmployeeSearchInput(employee.id);
    const newFormData = {
      ...formData,
      endUser: employee.id
    };
    setFormData(newFormData);
    setShowEmployeeDropdown(false);
    setFocusedSuggestionIndex(-1);
    setEmployeeValidationStatus('valid');
    setEmployeeValidationMessage('');
    updateFormValidation('endUser', employee.id);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleEmployeeInputChange = (e) => {
    const value = e.target.value;
    setEmployeeSearchInput(value);
    setFormData(prev => ({
      ...prev,
      endUser: value
    }));
    setEmployeeValidationStatus('');
    setEmployeeValidationMessage('');
    updateFormValidation('endUser', value);
  };

  const handleKeyDown = (e) => {
    if (!showEmployeeDropdown || employeeSearchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedSuggestionIndex(prev =>
        prev < employeeSearchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && focusedSuggestionIndex >= 0) {
      e.preventDefault();
      handleEmployeeSelect(employeeSearchResults[focusedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowEmployeeDropdown(false);
      setFocusedSuggestionIndex(-1);
    }
  };

  // --- Document ID search helpers ---
  const searchDocuments = (searchTerm) => {
    const term = searchTerm.toLowerCase();
    axios
      .get(DOCUMENTS_ENDPOINT)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const propertyRecords = data.filter(doc => doc.document_type === 'Property Records');
        
        // Filter to only show main document IDs (no increment suffixes) and remove duplicates
        const mainDocIds = propertyRecords
          .filter(doc => doc.document_id && doc.document_id.toLowerCase().includes(term))
          .map(doc => doc.document_id)
          .filter(id => {
            // Only allow main document IDs like PUBL-DOCU-2025-3cb3ac
            // Exclude ones with increments like PUBL-DOCU-2025-3cb3ac-0001
            const parts = id.split('-');
            if (parts.length >= 4) {
              const lastPart = parts[parts.length - 1];
              // If last part is numeric (like 0001), it's an increment - exclude it
              return !/^\d+$/.test(lastPart);
            }
            return true;
          })
          // Remove duplicates by converting to Set and back to array
          // Remove duplicates (case-insensitive)
          .reduce((acc, id) => {
            const lower = id.toLowerCase();
            if (!acc.seen.has(lower)) {
              acc.seen.add(lower);
              acc.unique.push(id);
            }
            return acc;
          }, { seen: new Set(), unique: [] }).unique
          // Filter out already used document IDs
          .filter(id => !existingDocIds.some(existingId => existingId.toLowerCase() === id.toLowerCase()));

        setDocSearchResults(mainDocIds);
        setShowDocDropdown(mainDocIds.length > 0);
        setDocFocusedSuggestionIndex(-1);

        const isDuplicate = existingDocIds.some(id => id.toLowerCase() === term);
        setIsDocDuplicate(isDuplicate);
        if (isDuplicate) {
          setDocValidationStatus('invalid');
          setDocValidationMessage('This Document ID has been added');
        } else if (mainDocIds.some(id => id.toLowerCase() === term)) {
          setDocValidationStatus('valid');
          setDocValidationMessage('');
        } 
      })
      .catch((err) => {
        console.error('Failed to fetch documents:', err);
      });
  };

  // --- Document ID handlers ---
  const handleDocSelect = (id) => {
    setDocSearchInput(id);
    const newFormData = {
      ...formData,
      documentNo: id
    };
    setFormData(newFormData);
    setShowDocDropdown(false);
    setDocFocusedSuggestionIndex(-1);
    const duplicate = existingDocIds.some(existing => existing.toLowerCase() === id.toLowerCase());
    setIsDocDuplicate(duplicate);
    
    // Check if it's a main document ID (no increment suffix)
    const parts = id.split('-');
    const isMainDoc = parts.length >= 4 ? !/^\d+$/.test(parts[parts.length - 1]) : true;
    
    if (!isMainDoc) {
      setDocValidationStatus('invalid');
      setDocValidationMessage('Only main document IDs are allowed (no increment suffixes)');
    } else {
      axios.get(`${DOCUMENTS_ENDPOINT}${id}/`) // Assuming endpoint supports single doc fetch
        .then(res => {
          if (res.data.document_type !== 'Property Records') {
            setDocValidationStatus('invalid');
            setDocValidationMessage('Document ID must be a Property Records.');
          } else if (duplicate) {
            setDocValidationStatus('invalid');
            setDocValidationMessage('The Document ID has been used');
          } else {
            setDocValidationStatus('valid');
            setDocValidationMessage('');
          }
        })
        .catch(err => {
          console.error('Error validating document type:', err);
          setDocValidationStatus('invalid');
          setDocValidationMessage('Unable to validate document type.');
        });
    }
    
    updateFormValidation('documentNo', id);
    if (docInputRef.current) {
      docInputRef.current.focus();
    }
  };

  const handleDocInputChange = (e) => {
    const value = e.target.value;
    setDocSearchInput(value);
    setFormData(prev => ({
      ...prev,
      documentNo: value
    }));

    // Check if it's a main document ID (no increment suffix)
    const parts = value.split('-');
    const isMainDoc = parts.length >= 4 ? !/^\d+$/.test(parts[parts.length - 1]) : true;
    
    const duplicate = existingDocIds.some(existing => existing.toLowerCase() === value.trim().toLowerCase());
    setIsDocDuplicate(duplicate);
    
    if (!isMainDoc) {
      setDocValidationStatus('invalid');
      setDocValidationMessage('Only main document IDs are allowed (no increment suffixes)');
    } else if (duplicate) {
      setDocValidationStatus('invalid');
      setDocValidationMessage('The Document ID has been used');
    } else {
      setDocValidationStatus('');
      setDocValidationMessage('');
    }
    updateFormValidation('documentNo', value);
  };

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

  // --- PAR No validation ---
  const validateParNo = (value) => {
    const trimmed = value.trim();
    let isValid = true;

    console.log('Validating PAR No:', trimmed, 'Duplicate:', existingParNos.some(parNo => parNo.toLowerCase() === trimmed.toLowerCase()), 'Existing PAR Nos:', existingParNos); // Debug log

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

  const validateNumericInput = (name, value) => {
    let error = '';
    if (value.trim() === '') {
      error = '';
    } else if (/^-/.test(value)) {
      error = 'Negative values are not allowed';
    } else if (!/^[0-9.,]+$/.test(value)) {
      error = 'Only numbers, comma, and decimal point are allowed';
    } else if ((value.match(/\./g) || []).length > 1) {
      error = 'Only one decimal point is allowed';
    }
    setValidationErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    // Validate field directly
    if (name === 'parNo') {
      validateParNo(value); // triggers message + duplicate check
    }

    if (name === 'unitCost' || name === 'estimatedLife') {
      validateNumericInput(name, value);
    }

    updateFormValidation(name, value); // update formValid status every change
  };

  const updateFormValidation = (changedField, changedValue) => {
    const requiredFields = ['parNo', 'unitCost', 'estimatedLife', 'endUser', 'status'];
    const isValid = requiredFields.every(field => {
      const fieldValue = changedField === field ? changedValue : formData[field];
      return fieldValue?.toString().trim() !== '';
    });

    const employeeValid = employeeValidationStatus === 'valid';
    const docValid = docValidationStatus === 'valid' && !isDocDuplicate;
    const parValid = !isParDuplicate;
    const numericValid = Object.values(validationErrors).every(err => err === '');

    setFormValid(isValid && employeeValid && docValid && parValid && numericValid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Re-validate PAR No. before submission
    const isParValid = validateParNo(formData.parNo);
    if (!isParValid) {
      setIsParDuplicate(true);
      setParValidationMessage('PAR No. has already been used');
      return;
    }

    if (employeeValidationStatus !== 'valid') {
      setEmployeeValidationStatus('invalid');
      if (!employeeValidationMessage) {
        setEmployeeValidationMessage('No employee found.');
      }
      return;
    }

    if (docValidationStatus !== 'valid' || isDocDuplicate) {
      setDocValidationStatus('invalid');
      if (!docValidationMessage) {
        setDocValidationMessage(isDocDuplicate ? 'The Document ID has been used' : 'No Property Records document found.');
      }
      return;
    }

    if (formValid && onAdd) {
      const newProperty = {
        documentNo: formData.documentNo,
        parNo: formData.parNo,
        description: formData.description,
        serialNo: formData.serialNo.trim() === '' ? 'N/A' : formData.serialNo,
        dateAcquired: formData.dateAcquired,
        unitCost: formData.unitCost ? parseFloat(formData.unitCost) : null,
        endUser: formData.endUser,
        estimatedLife: formData.estimatedLife ? formData.estimatedLife : null,
        remarks: formData.remarks,
        status: formData.status || 'Serviceable'
      };

      try {
        await onAdd(newProperty);

        // Log activity
        await logActivity(
          username, 
          `Added a Property (Property No: ${formData.parNo}, Document ID: ${formData.documentNo})`,
          formData.parNo
        );
      } catch (err) {
        console.error('Failed to add property or log activity:', err);
      }

      setFormData(initialFormData);
      setEmployeeSearchInput('');
      setEmployeeValidationStatus('');
      setEmployeeValidationMessage('');
      setDocSearchInput('');
      setDocValidationStatus('');
      setDocValidationMessage('');
      setIsDocDuplicate(false);
      setIsParDuplicate(false);
      setParValidationMessage('');
      setFormValid(false);
    }
  };

  const handleClose = (e) => {
    setFormData(initialFormData);
    setEmployeeSearchInput('');
    setEmployeeValidationStatus('');
    setEmployeeValidationMessage('');
    setDocSearchInput('');
    setDocValidationStatus('');
    setDocValidationMessage('');
    setIsDocDuplicate(false);
    setIsParDuplicate(false);
    setParValidationMessage('');
    setFormValid(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="AssetProperty-AddModalOverlay">
      <div className="AssetProperty-AddModalBox">
        <form className="AssetProperty-ModalForm" onSubmit={handleSubmit} noValidate>
          <div className="AssetProperty-ModalGrid">
            <div>
              <label className="AssetProperty-ModalLabel">PAR No.</label>
              <input
                className={`AssetProperty-ModalInput ${isParDuplicate ? 'AssetProperty-ModalInput--invalid' : ''}`}
                type="text"
                name="parNo"
                value={formData.parNo}
                onChange={handleFormChange}
                required
              />
              {parValidationMessage && (
                  <div className={`AssetProperty-EmployeeValidation AssetProperty-EmployeeValidation--invalid`}> {parValidationMessage} </div>
              )}

              <label className="AssetProperty-ModalLabel">Description</label>
              <textarea
                className="AssetProperty-ModalInput AssetProperty-ModalTextarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleFormChange}
              />

              <label className="AssetProperty-ModalLabel">Serial No.</label>
              <textarea
                className="AssetProperty-ModalInput AssetProperty-ModalTextarea"
                rows={3}
                name="serialNo"
                value={formData.serialNo}
                onChange={handleFormChange}
                placeholder="Put N/A if serial number is not available"
              />
            </div>
            <div>
              <label className="AssetProperty-ModalLabel">Date Acquired</label>
              <input
                className="AssetProperty-ModalInput"
                type="date"
                name="dateAcquired"
                value={formData.dateAcquired}
                onChange={handleFormChange}
                max={todayStr}
              />

              <label className="AssetProperty-ModalLabel">Unit Cost</label>
              <input
                className="AssetProperty-ModalInput"
                type="text"
                name="unitCost"
                value={formData.unitCost}
                onChange={handleFormChange}
                placeholder="0.00"
                required
              />
              {validationErrors.unitCost && (
                <div className="AssetProperty-ErrorText">{validationErrors.unitCost}</div>
              )}

              <label className="AssetProperty-ModalLabel">End User</label>
              <div className="AssetProperty-EmployeeSearchContainer">
                <input
                  ref={inputRef}
                  className={`AssetProperty-ModalInput AssetProperty-ModalInput--${employeeValidationStatus || 'default'}`}
                  type="text"
                  placeholder="Type employee name or ID…"
                  name="endUser"
                  value={employeeSearchInput}
                  onChange={handleEmployeeInputChange}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                  required
                />
                {showEmployeeDropdown && employeeSearchResults.length > 0 && (
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
                {employeeValidationStatus && (
                  <div className={`AssetProperty-EmployeeValidation AssetProperty-EmployeeValidation--${employeeValidationStatus}`}>
                    {employeeValidationMessage}
                  </div>
                )}
              </div>

              <label className="AssetProperty-ModalLabel">Estimated Life Use</label>
              <input
                className="AssetProperty-ModalInput"
                type="text"
                name="estimatedLife"
                value={formData.estimatedLife}
                onChange={handleFormChange}
                placeholder="0 Years"
                required
              />
              {validationErrors.estimatedLife && (
                <div className="AssetProperty-ErrorText">{validationErrors.estimatedLife}</div>
              )}
            </div>
            <div>
              <label className="AssetProperty-ModalLabel">Status</label>
              <select
                className="AssetProperty-ModalInput AssetProperty-ModalSelect"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
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
                onChange={handleFormChange}
              />

              <label className="AssetProperty-ModalLabel">Document ID</label>
              <div className="AssetProperty-EmployeeSearchContainer">
                <input
                  ref={docInputRef}
                  className={`AssetProperty-ModalInput AssetProperty-ModalInput--${docValidationStatus || 'default'}`}
                  type="text"
                  placeholder="Type document ID…"
                  name="documentNo"
                  value={docSearchInput}
                  onChange={handleDocInputChange}
                  onKeyDown={handleDocKeyDown}
                  autoComplete="off"
                />
                {showDocDropdown && docSearchResults.length > 0 && (
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
                {docValidationStatus && (
                  <div className={`AssetProperty-EmployeeValidation AssetProperty-EmployeeValidation--${docValidationStatus}`}>
                    {docValidationMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="AssetProperty-ModalActions">
            <button
              type="submit"
              className="AssetProperty-ModalBtn AssetProperty-ModalBtn--primary"
              disabled={!formValid || employeeValidationStatus === 'invalid' || docValidationStatus === 'invalid' || isDocDuplicate || isParDuplicate || Object.values(validationErrors).some(err => err)}
            >
              ADD
            </button>
            <button 
              type="button" 
              className="AssetProperty-ModalBtn AssetProperty-ModalBtn--secondary" 
              onClick={handleClose}
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}