import React, { useState, useEffect, useRef } from 'react';
import './AssetProperty.css';
import axios from 'axios';

export default function TransferPropertyModal({ open, onClose, row, onTransfer }) {
  // State for base data
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
  // State for document extension
  const [basePropertyNo, setBasePropertyNo] = useState('');
  const [propExtension, setPropExtension] = useState('');
  // State for document extension
  const [baseDocumentId, setBaseDocumentId] = useState('');
  const [docExtension, setDocExtension] = useState('');
  // Controls whether Unit Cost is locked after submission
  const [unitCostLocked, setUnitCostLocked] = useState(false);
  // List of used extensions for this Document ID
  const [usedExtensions, setUsedExtensions] = useState([]);
  // List of used extensions for this Property No
  const [usedPropertyExtensions, setUsedPropertyExtensions] = useState([]);
  // Flag for duplicate extension
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
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const API_URL = 'http://127.0.0.1:8000';
  const EMPLOYEES_ENDPOINT = `${API_URL}/pdpms/manila-city-hall/employees/`;
  const DOCUMENTS_ENDPOINT = `${API_URL}/pdpms/manila-city-hall/documents/`;

  useEffect(() => {
    if (row) {
      // --- Parse Document No (existing logic) ---
      const rawDocNo = row.documentNo || '';
      const parts = rawDocNo.split(' - ');
      setBaseDocumentId(parts[0] || '');
      setDocExtension(parts[1] || '');

      // --- Parse Property No & prepare extension ---
      const rawPropNo = row.propertyNo || '';
      const propParts = rawPropNo.split(' - ');
      const baseProp = propParts[0] || '';
      setBasePropertyNo(baseProp);
      // Temporarily set to existing extension (if any) until we compute next
      setPropExtension(propParts[1] || '');
      // Update form data (propertyNo will be finalized after extension fetch)
      setFormData({
        propertyNo: row.propertyNo || '',
        documentNo: rawDocNo,
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

  // --- Fetch used PROPERTY extensions whenever modal opens or base propertyNo changes ---
  useEffect(() => {
    if (!open || !basePropertyNo) return;

    const fetchUsedPropertyExtensions = async () => {
      try {
        const res = await axios.get(`${API_URL}/pdpms/manila-city-hall/properties/`);
        const data = Array.isArray(res.data) ? res.data : [];
        const basePrefix = `${basePropertyNo} - `;
        const extensions = data
          .map(prop => prop.property_no || '')
          .filter(no => no.startsWith(basePrefix))
          .map(no => no.slice(basePrefix.length).trim())
          .filter(ext => ext !== '');
        setUsedPropertyExtensions(extensions);

        // Determine next available numeric extension (4-digit)
        const nums = extensions
          .map(ext => parseInt(ext, 10))
          .filter(n => !isNaN(n));
        const nextNum = nums.length ? Math.max(...nums) + 1 : 1;
        const nextExt = nextNum.toString().padStart(4, '0');
        setPropExtension(nextExt);
        setFormData(prev => ({ ...prev, propertyNo: `${basePropertyNo} - ${nextExt}` }));
      } catch (err) {
        console.error('Failed to fetch property numbers:', err);
        // Fallback to 0001
        const fallbackExt = '0001';
        setPropExtension(fallbackExt);
        setFormData(prev => ({ ...prev, propertyNo: `${basePropertyNo} - ${fallbackExt}` }));
      }
    };

    fetchUsedPropertyExtensions();
  }, [open, basePropertyNo]);

  // Fetch used document extensions whenever modal opens or base documentNo changes
  useEffect(() => {
    if (!open || !baseDocumentId) return;

    const fetchUsedExtensions = async () => {
      try {
        const res = await axios.get(DOCUMENTS_ENDPOINT);
        const data = Array.isArray(res.data) ? res.data : [];
        const basePrefix = `${baseDocumentId} - `;
        const extensions = data
          .map(doc => doc.document_no || doc.documentNo || '')
          .filter(docId => docId.startsWith(basePrefix))
          .map(docId => docId.slice(basePrefix.length).trim())
          .filter(ext => ext !== '');
        setUsedExtensions(extensions);
      } catch (err) {
        console.error('Failed to fetch document IDs:', err);
        setUsedExtensions([]);
      }
    };

    fetchUsedExtensions();
  }, [open, baseDocumentId]);

  // Re-evaluate duplicate status whenever the extension or the list of used extensions changes
  useEffect(() => {
    const duplicate = docExtension.trim() !== '' && usedExtensions.includes(docExtension.trim());
    setIsDocDuplicate(duplicate);
  }, [docExtension, usedExtensions]);

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

  const handleDocumentInputChange = (e) => {
    const { value } = e.target;
    
    // Split value into base and extension parts
    const parts = value.split(' - ');
    const base = parts[0]?.trim() || '';
    const ext = parts[1]?.trim() || '';
    
    // Ensure we maintain exactly one hyphen between base and extension
    const formattedValue = `${base} - ${ext}`;
    
    // Update states
    setBaseDocumentId(base);
    setDocExtension(ext);
    setFormData(prev => ({ ...prev, documentNo: formattedValue }));
    setIsDocDuplicate(ext !== '' && usedExtensions.includes(ext));
  };

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
    // lock unit cost so it becomes read-only after clicking TRANSFER
    setUnitCostLocked(true);
    e.preventDefault();
    if (formValid && onTransfer) {
      const fullDocumentNo = `${baseDocumentId} - ${docExtension.trim()}`;
      const fullPropertyNo = `${basePropertyNo} - ${propExtension}`;
      onTransfer({ ...formData, documentNo: fullDocumentNo, propertyNo: fullPropertyNo });
    }
  };

  // Form validation
  useEffect(() => {
    const hasDocumentId = baseDocumentId.trim() !== '' && docExtension.trim() !== '';
    const hasInteracted = employeeSearchInput.trim() !== '';
    const hasValidEndUser = hasInteracted
      ? formData.endUser?.toString().trim() !== '' && employeeValidationStatus === 'valid'
      : false;

    setFormValid(hasDocumentId && hasValidEndUser);
  }, [baseDocumentId, docExtension, formData.endUser, employeeValidationStatus, employeeSearchInput]);

  if (!open) return null;

  return (
    <div className="AssetProperty-EditModalOverlay">
      <div className="AssetProperty-EditModalBox">
        <form className="AssetProperty-ModalForm" onSubmit={handleSubmit} noValidate>
          <div className="AssetProperty-ModalGrid AssetProperty-ModalGrid--3col">
            <div>
              <label className="AssetProperty-ModalLabel">Property No.</label>
              <input className="AssetProperty-ModalInput" type="text" value={`${basePropertyNo} - ${propExtension}`} disabled style={{background:'#e8eef7'}} />

              <label className="AssetProperty-ModalLabel">Document ID</label>
              <input
                className="AssetProperty-ModalInput"
                type="text"
                name="documentNoCombined"
                value={`${baseDocumentId} - ${docExtension}`}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  // Prevent deletion of the extension separator
                  if (e.key === 'Backspace' || e.key === 'Delete') {
                    const hyphenIndex = e.target.value.indexOf(' - ');
                    if (hyphenIndex !== -1) {
                      // Prevent deletion of the hyphen and spaces around it
                      const selectionStart = e.target.selectionStart;
                      const selectionEnd = e.target.selectionEnd;
                      if (selectionStart <= hyphenIndex + 3 && selectionEnd >= hyphenIndex) {
                        e.preventDefault();
                      }
                    }
                  }
                }}
                autoComplete="off"
                placeholder="Base Document ID - Extension (e.g., PUBL-DOCU-2025-4c2626 - 0001)"
              />
              {isDocDuplicate && (
                <div className="AssetProperty-ValidationMessage AssetProperty-ValidationMessage--error">
                  This document is already existing.
                </div>
              )}

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
              <input
                className="AssetProperty-ModalInput"
                type="text"
                name="unitCost"
                value={formData.unitCost}
                onChange={handleInputChange}
                disabled
                style={unitCostLocked ? { background: '#e8eef7' } : {}}
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
            </div>
          </div>

          <div className="AssetProperty-ModalActions">
            <button
              type="submit"
              className="AssetProperty-ModalBtn AssetProperty-ModalBtn--primary"
              disabled={!formValid || isDocDuplicate}
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
