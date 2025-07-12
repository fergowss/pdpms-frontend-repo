import React, { useState, useEffect, useRef } from 'react';
import './AssetProperty.css';
import axios from 'axios';

export default function TransferPropertyModal({ open, onClose, row, onTransfer }) {
  const [formData, setFormData] = useState({
    propertyNo: '',
    documentNo: '',
    parNo: '',  // Empty by default
    serialNo: '',
    dateAcquired: '',
    unitCost: '',
    endUser: '',
    estimatedLife: '',
    status: '',
    remarks: '',
    description: ''
  });
  const [formValid, setFormValid] = useState(false);
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

  const API_URL = 'http://127.0.0.1:8000';
  const EMPLOYEES_ENDPOINT = `${API_URL}/pdpms/manila-city-hall/employees/`;

  useEffect(() => {
    if (row) {
      setFormData({
        propertyNo: row.propertyNo || '',
        documentNo: row.documentNo || '',
        parNo: '',  // Always set to empty string
        serialNo: row.serialNo || '',
        dateAcquired: row.dateAcquired || '',
        unitCost: row.unitCost || '',
        endUser: row.endUser || '',
        estimatedLife: row.estimatedLife || '',
        status: row.status || '',
        remarks: row.remarks || '',
        description: row.description || ''
      });
    }
  }, [row]);

  // Form validation
  useEffect(() => {
    // Only validate if the user has started typing or selected an employee
    const hasInteracted = employeeSearchInput.trim() !== '';
    const isValid = hasInteracted 
      ? formData.endUser?.toString().trim() !== '' && employeeValidationStatus === 'valid'
      : false;
    
    setFormValid(isValid);
  }, [formData, employeeValidationStatus, employeeSearchInput]);

  // Load employees when modal opens
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

  // Handle employee search input
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

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && 
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowEmployeeDropdown(false);
        setFocusedSuggestionIndex(-1);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search employees function
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

  // Employee validation logic
  useEffect(() => {
    if (!formData.endUser) {
      setEmployeeValidationStatus('');
      setEmployeeValidationMessage('');
      return;
    }
    
    // Check if the current input matches any employee ID in the already loaded list
    const exactMatch = employees.find(emp => emp.id === formData.endUser);
    if (exactMatch) {
      setEmployeeValidationStatus('valid');
      setEmployeeValidationMessage('');
      return;
    }
    
    // If no match found, show a message but don't show error state
    setEmployeeValidationStatus('');
    setEmployeeValidationMessage('');
  }, [formData.endUser, employees]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'endUser') {
      setEmployeeSearchInput(value);
      setFormData(prev => ({
        ...prev,
        endUser: value
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEmployeeSelect = (employee) => {
    const employeeName = employee.name;
    setFormData(prev => ({
      ...prev,
      endUser: employeeName
    }));
    setEmployeeSearchInput(employeeName);
    setShowEmployeeDropdown(false);
    setEmployeeValidationStatus('valid');
    setEmployeeValidationMessage('');
    // Clear any previous validation errors
    setValidationErrors(prev => ({
      ...prev,
      endUser: ''
    }));
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
      setFocusedSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : 0
      );
    } else if (e.key === 'Enter' && focusedSuggestionIndex >= 0) {
      e.preventDefault();
      handleEmployeeSelect(employeeSearchResults[focusedSuggestionIndex]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formValid && onTransfer) {
      onTransfer({ ...formData });
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
              <input className="AssetProperty-ModalInput" type="text" value={formData.propertyNo} disabled style={{background:'#e8eef7'}} />


              <label className="AssetProperty-ModalLabel">PAR No.</label>
              <input 
                className="AssetProperty-ModalInput" 
                type="text" 
                name="parNo"
                value={formData.parNo} 
                onChange={handleInputChange}
              />

              <label className="AssetProperty-ModalLabel">Description</label>
              <textarea className="AssetProperty-ModalInput AssetProperty-ModalTextarea" rows={3} value={formData.description} disabled style={{background:'#e8eef7', resize: 'none'}} />
            </div>
            <div>
              <label className="AssetProperty-ModalLabel">Serial No.</label>
              <textarea 
                className="AssetProperty-ModalInput AssetProperty-ModalTextarea" 
                value={formData.serialNo} 
                disabled 
                style={{background:'#e8eef7', resize: 'none'}}
                rows={3}
              />

              <label className="AssetProperty-ModalLabel">Date Acquired</label>
              <input className="AssetProperty-ModalInput" type="date" value={formData.dateAcquired} disabled style={{background:'#e8eef7'}} />

              <label className="AssetProperty-ModalLabel">Unit Cost</label>
              <input className="AssetProperty-ModalInput" type="text" value={formData.unitCost} disabled style={{background:'#e8eef7'}} />

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
                  onFocus={() => setShowEmployeeDropdown(employeeSearchResults.length > 0)}
                  autoComplete="off"
                  required
                  placeholder="Enter employee name or ID"
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
              <input className="AssetProperty-ModalInput" type="text" value={formData.estimatedLife} disabled style={{background:'#e8eef7'}} />

              <label className="AssetProperty-ModalLabel">Status</label>
              <input className="AssetProperty-ModalInput" type="text" value={formData.status} disabled style={{background:'#e8eef7'}} />

              <label className="AssetProperty-ModalLabel">Remarks</label>
              <textarea 
                className="AssetProperty-ModalInput AssetProperty-ModalTextarea" 
                rows={3} 
                name="remarks"
                value={formData.remarks} 
                onChange={handleInputChange}
                style={{resize: 'none'}} 
              />

              <label className="AssetProperty-ModalLabel">Document ID</label>
              <input 
                className="AssetProperty-ModalInput" 
                type="text" 
                name="documentNo"
                value={formData.documentNo} 
                disabled
                style={{background:'#e8eef7'}}
              />
            </div>
          </div>

          <div className="AssetProperty-ModalActions">
            <button
              type="submit"
              className="AssetProperty-ModalBtn AssetProperty-ModalBtn--primary"
              disabled={!formValid}
            >
              TRANSFER
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
