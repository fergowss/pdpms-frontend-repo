import React, { useState, useEffect, useRef } from 'react';
import './AssetProperty.css';
import axios from 'axios';

export default function EditPropertyModal({ open, onClose, row, onUpdate }) {
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
  const [formValid, setFormValid] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({ unitCost: '', estimatedLife: '' });
  // Track whether the unit cost field is still editable
  const [unitCostEditable, setUnitCostEditable] = useState(true);
  const [lifeEditable, setLifeEditable] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [employeeSearchInput, setEmployeeSearchInput] = useState('');
  const [employeeSearchResults, setEmployeeSearchResults] = useState([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [isValidatingEmployee, setIsValidatingEmployee] = useState(false);
  const [employeeValidationMessage, setEmployeeValidationMessage] = useState('');
  const [employeeValidationStatus, setEmployeeValidationStatus] = useState('');
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // ------------------------------------------------------------
  // Dynamic form validation
  // ------------------------------------------------------------
  useEffect(() => {
    if (!initialData) return;

    // Check if any editable field has been modified
    const editableFields = [
      'serialNo',
      'unitCost',
      'estimatedLife',
      'endUser',
      'status',
      'remarks',
    ];
    const changed = editableFields.some(
      (field) => formData[field] !== initialData[field]
    );
    setHasChanges(changed);

    // Individual validation rules ---------------------------------
    const isEndUserValid = formData.endUser?.toString().trim() !== '';
    const employeeValid = employeeValidationStatus === 'valid' || 
                         (formData.endUser === initialData.endUser && employeeValidationStatus !== 'invalid');
    const numericValid = Object.values(validationErrors).every(
      (err) => err === ''
    );

    setFormValid(isEndUserValid && employeeValid && numericValid);
  }, [formData, validationErrors, employeeValidationStatus, initialData]);

  const API_URL = 'http://127.0.0.1:8000';
  const EMPLOYEES_ENDPOINT = `${API_URL}/pdpms/manila-city-hall/employees/`;

  useEffect(() => {
    if (row) {
      const newData = {
        propertyNo: row.propertyNo || '',
        documentNo: row.documentNo || '',
        parNo: row.parNo || '',
        serialNo: row.serialNo || '',
        dateAcquired: row.dateAcquired || '',
        unitCost: row.unitCost ? row.unitCost.replace(/,/g, '') : '',
        endUser: row.endUser || '',
        estimatedLife: row.estimatedLife || '',
        status: row.status || 'Serviceable',
        remarks: row.remarks || '',
        description: row.description || ''
      };
      setFormData(newData);
      setInitialData(newData);
      setEmployeeSearchInput(newData.endUser);
      // Unit cost is editable only if initial value is empty
      setUnitCostEditable(!Boolean(newData.unitCost));
      // Estimated life is editable only if initial value is empty
      setLifeEditable(!Boolean(newData.estimatedLife));
      const requiredFields = ['endUser', 'status', 'remarks'];
      const isValid = requiredFields.every(field => newData[field]?.toString().trim() !== '');
      setFormValid(isValid);
      setHasChanges(false);
      if (newData.endUser) {
        setEmployeeValidationStatus('valid');
        setEmployeeValidationMessage('');
      }
    }
  }, [row]);

  useEffect(() => {
    if (!open) return;
    axios.get(EMPLOYEES_ENDPOINT)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        const normalized = data.map(emp => ({
          id: emp.employee_id,
          name: `${emp.first_name} ${emp.last_name}`,
          department: emp.department || '',
        }));
        setEmployees(normalized);
      })
      .catch(err => console.error('Unable to fetch employees:', err));
  }, [open]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmed = employeeSearchInput.trim();
      if (trimmed === '') {
        setShowEmployeeDropdown(false);
        setEmployeeValidationStatus('');
        setEmployeeValidationMessage('');
        return;
      }

      if (initialData && trimmed.toLowerCase() === initialData.endUser.toLowerCase()) {
        setEmployeeValidationStatus('valid');
        setEmployeeValidationMessage('');
        setShowEmployeeDropdown(false);
      } else {
        searchEmployees(trimmed);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [employeeSearchInput, initialData?.endUser]);

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
      emp.id.toLowerCase().includes(term) || emp.name.toLowerCase().includes(term)
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
    setFormData(prev => ({
      ...prev,
      endUser: employee.id
    }));
    setShowEmployeeDropdown(false);
    setFocusedSuggestionIndex(-1);
    setEmployeeValidationStatus('valid');
    setEmployeeValidationMessage('');
    updateFormValidation('endUser', employee.id);
    inputRef.current.focus();
  };

  const handleEmployeeInputChange = (e) => {
    const value = e.target.value;
    setEmployeeSearchInput(value);
    setFormData(prev => ({
      ...prev,
      endUser: value
    }));
    if (value !== initialData?.endUser) {
      setEmployeeValidationStatus('');
      setEmployeeValidationMessage('');
    }
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
    const trimmed = value.trim();

    if (trimmed === '') {
      // Empty is acceptable (handled as null later)
      error = '';
    } else if (/^-/.test(trimmed)) {
      error = 'Negative values are not allowed';
    } else if (name === 'estimatedLife') {
      // Positive whole numbers only
      if (!/^[0-9]+$/.test(trimmed)) {
        error = 'Only whole numbers are allowed';
      } else if (parseInt(trimmed, 10) === 0) {
        error = '0 is not allowed';
      }
    } else if (name === 'unitCost') {
      // Allow decimals and comma separators but > 0
      if (!/^[0-9.,]+$/.test(trimmed)) {
        error = 'Only numbers, comma, and decimal point are allowed';
      } else if ((trimmed.match(/\./g) || []).length > 1) {
        error = 'Only one decimal point is allowed';
      } else {
        const numeric = parseFloat(trimmed.replace(/,/g, ''));
        if (numeric === 0) {
          error = '0 is not allowed';
        }
      }
    }

    setValidationErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'unitCost') {
    // Once a non-empty value is entered, lock the field
    validateNumericInput(name, value);
  } else if (name === 'estimatedLife') {
      validateNumericInput(name, value);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    updateFormValidation(name, value);
  };

  const updateFormValidation = (changedField, changedValue) => {
    if (initialData) {
      const editableFields = ['serialNo', 'unitCost', 'estimatedLife', 'endUser', 'status', 'remarks'];
      const changed = editableFields.some(field =>
        (changedField === field ? changedValue : formData[field]) !== initialData[field]
      );
      setHasChanges(changed);

      // Only endUser is required
      const isEndUserValid = changedField === 'endUser' 
        ? changedValue?.toString().trim() !== ''
        : formData.endUser?.toString().trim() !== '';

      const employeeValid = employeeValidationStatus === 'valid' || 
                           (changedField === 'endUser' && changedValue === initialData.endUser);

      const numericValid = Object.values(validationErrors).every(err => err === '');
      
      setFormValid(isEndUserValid && employeeValid && numericValid);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (employeeValidationStatus !== 'valid' && formData.endUser !== initialData?.endUser) {
      setEmployeeValidationStatus('invalid');
      if (!employeeValidationMessage) {
        setEmployeeValidationMessage('No employee found.');
      }
      return;
    }
    
    if (formValid && hasChanges && onUpdate) {
      const updatedData = {
        propertyNo: formData.propertyNo,
        serialNo: formData.serialNo,
        unitCost: formData.unitCost ? parseFloat(formData.unitCost) : null,
        endUser: formData.endUser,
        estimatedLife: formData.estimatedLife ? formData.estimatedLife : null,
        status: formData.status,
        remarks: formData.remarks
      };
      onUpdate(updatedData);
    // After successful update, lock the unit cost field
    if (formData.unitCost) {
      setUnitCostEditable(false);
    }
    if (formData.estimatedLife) {
      setLifeEditable(false);
    }
  }
};

  if (!open || !row) return null;

  return (
    <div className="AssetProperty-EditModalOverlay">
      <div className="AssetProperty-EditModalBox">
        <form className="AssetProperty-ModalForm" onSubmit={handleSubmit} noValidate>
          <div className="AssetProperty-ModalGrid">
            <div>
              <label className="AssetProperty-ModalLabel">Property No.</label>
              <input className="AssetProperty-ModalInput" type="text" value={formData.propertyNo} disabled style={{background:'#e8eef7'}} />

              <label className="AssetProperty-ModalLabel">Document ID</label>
              <input className="AssetProperty-ModalInput" type="text" value={formData.documentNo} disabled style={{background:'#e8eef7'}} />

              <label className="AssetProperty-ModalLabel">PAR No.</label>
              <input 
                className="AssetProperty-ModalInput" 
                type="text" 
                name="parNo"
                value={formData.parNo} 
                disabled
                style={{background:'#e8eef7'}}
              />

              <label className="AssetProperty-ModalLabel">Description</label>
              <textarea 
                className="AssetProperty-ModalInput AssetProperty-ModalTextarea" 
                rows={3} 
                name="description" 
                value={formData.description}
                disabled
                style={{background:'#e8eef7'}}
              />
            </div>
            <div>
              <label className="AssetProperty-ModalLabel">Serial No.</label>
              <textarea
                className="AssetProperty-ModalInput AssetProperty-ModalTextarea"
                name="serialNo"
                value={formData.serialNo}
                onChange={handleInputChange}
                rows={3}
              />

              <label className="AssetProperty-ModalLabel">Date Acquired</label>
              <input 
                className="AssetProperty-ModalInput" 
                type="date" 
                name="dateAcquired"
                value={formData.dateAcquired} 
                disabled
                style={{background:'#e8eef7'}}
              />

              <label className="AssetProperty-ModalLabel">Unit Cost</label>   
              <input 
                className="AssetProperty-ModalInput" 
                type="text" 
                name="unitCost"
                value={formData.unitCost}
                onChange={handleInputChange}
                placeholder="0.00"
                disabled={!unitCostEditable}
                style={{ background: !unitCostEditable ? '#e8eef7' : 'white' }}
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
                  name="endUser" 
                  value={employeeSearchInput}
                  onChange={handleEmployeeInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter employee name or ID"
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
                {isValidatingEmployee ? (
                  <div className="AssetProperty-EmployeeValidation">
                    <span>Searching...</span>
                  </div>
                ) : employeeValidationStatus === 'valid' && employeeSearchInput.trim() !== '' && (
                  <div className="AssetProperty-EmployeeValidation AssetProperty-EmployeeValidation--valid">
                    <span>✓ Valid employee</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="AssetProperty-ModalLabel">Estimated Life Use</label>
              <input 
                className="AssetProperty-ModalInput" 
                type="text" 
                name="estimatedLife"
                value={formData.estimatedLife}
                onChange={handleInputChange}
                placeholder="0 Years"
                disabled={!lifeEditable}
                style={{ background: !lifeEditable ? '#e8eef7' : 'white' }}
              />
              {validationErrors.estimatedLife && (
                <div className="AssetProperty-ErrorText">{validationErrors.estimatedLife}</div>
              )}

              <label className="AssetProperty-ModalLabel">Status</label>
              <select 
                className="AssetProperty-ModalInput AssetProperty-ModalSelect" 
                name="status" 
                value={formData.status}
                onChange={handleInputChange}

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
                onChange={handleInputChange}
 
              />
            </div>
          </div>
          
          <div className="AssetProperty-ModalActions">
            <button 
              type="submit" 
              className="AssetProperty-ModalBtn AssetProperty-ModalBtn--primary" 
              disabled={!formValid || !hasChanges || employeeValidationStatus === 'invalid' || Object.values(validationErrors).some(err => err)}
              style={{ 
                opacity: (formValid && hasChanges && employeeValidationStatus !== 'invalid') ? 1 : 0.6, 
                cursor: (formValid && hasChanges && employeeValidationStatus !== 'invalid') ? 'pointer' : 'not-allowed' 
              }}
            >
              UPDATE
            </button>
            <button 
              type="button" 
              className="AssetProperty-ModalBtn AssetProperty-ModalBtn--secondary" 
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