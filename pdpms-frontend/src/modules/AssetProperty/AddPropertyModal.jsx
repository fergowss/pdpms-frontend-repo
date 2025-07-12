import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AssetProperty.css';

export default function AddPropertyModal({ open, onClose, onAdd }) {
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

  useEffect(() => {
    if (open) {
      setFormData(initialFormData);
      setEmployeeSearchInput('');
      setEmployeeValidationStatus('');
      setEmployeeValidationMessage('');
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !inputRef.current.contains(e.target)) {
        setShowEmployeeDropdown(false);
        setFocusedSuggestionIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    if (name === 'unitCost' || name === 'estimatedLife') {
      validateNumericInput(name, value);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    updateFormValidation(name, value);
  };

  const updateFormValidation = (changedField, changedValue) => {
    const requiredFields = ['endUser', 'status', 'remarks'];
    const isValid = requiredFields.every(field => {
      const fieldValue = changedField === field ? changedValue : formData[field];
      return fieldValue?.toString().trim() !== '';
    });

    const employeeValid = employeeValidationStatus === 'valid';
    const numericValid = Object.values(validationErrors).every(err => err === '');

    setFormValid(isValid && employeeValid && numericValid);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (employeeValidationStatus !== 'valid') {
      setEmployeeValidationStatus('invalid');
      if (!employeeValidationMessage) {
        setEmployeeValidationMessage('No employee found.');
      }
      return;
    }

    if (formValid && onAdd) {
      const newProperty = {
        documentNo: formData.documentNo,
        parNo: formData.parNo,
        description: formData.description,
        serialNo: formData.serialNo,
        dateAcquired: formData.dateAcquired,
        unitCost: formData.unitCost ? parseFloat(formData.unitCost) : null,
        endUser: formData.endUser,
        estimatedLife: formData.estimatedLife ? formData.estimatedLife : null,
        remarks: formData.remarks,
        status: formData.status || 'Serviceable'
      };
      onAdd(newProperty);
      setFormData(initialFormData);
      setEmployeeSearchInput('');
      setEmployeeValidationStatus('');
      setEmployeeValidationMessage('');
      setFormValid(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setEmployeeSearchInput('');
    setEmployeeValidationStatus('');
    setEmployeeValidationMessage('');
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
                className="AssetProperty-ModalInput" 
                type="text" 
                name="parNo" 
                value={formData.parNo} 
                onChange={handleFormChange} 
              />

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
              />

              <label className="AssetProperty-ModalLabel">Unit Cost</label>
              <input 
                className="AssetProperty-ModalInput" 
                type="text" 
                name="unitCost" 
                value={formData.unitCost} 
                onChange={handleFormChange} 
                placeholder="0.00"
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
              <input 
                className="AssetProperty-ModalInput" 
                type="text" 
                name="documentNo" 
                value={formData.documentNo} 
                onChange={handleFormChange} 
              />
            </div>
          </div>
          <div className="AssetProperty-ModalActions">
            <button 
              type="submit" 
              className="AssetProperty-ModalBtn AssetProperty-ModalBtn--primary" 
              disabled={!formValid || employeeValidationStatus === 'invalid' || Object.values(validationErrors).some(err => err)}
              style={{ 
                opacity: (formValid && employeeValidationStatus !== 'invalid') ? 1 : 0.6, 
                cursor: (formValid && employeeValidationStatus !== 'invalid') ? 'pointer' : 'not-allowed' 
              }}
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