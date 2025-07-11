import React, { useState, useEffect, useRef } from 'react';
import './AssetProperty.css';
import axios from 'axios';

export default function TransferPropertyModal({ open, onClose, row, onTransfer }) {
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
        parNo: row.parNo || '',
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

  useEffect(() => {
    setFormValid(formData.endUser?.toString().trim() !== '' && employeeValidationStatus === 'valid');
  }, [formData, employeeValidationStatus]);

  // Employee search logic (same as EditPropertyModal)
  useEffect(() => {
    if (!employeeSearchInput) {
      setEmployeeSearchResults([]);
      setShowEmployeeDropdown(false);
      return;
    }
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(EMPLOYEES_ENDPOINT, { params: { search: employeeSearchInput } });
        setEmployeeSearchResults(res.data || []);
        setShowEmployeeDropdown(true);
      } catch (err) {
        setEmployeeSearchResults([]);
        setShowEmployeeDropdown(false);
      }
    };
    fetchEmployees();
  }, [employeeSearchInput]);

  // Employee validation logic
  useEffect(() => {
    if (!formData.endUser) {
      setEmployeeValidationStatus('');
      setEmployeeValidationMessage('');
      return;
    }
    setIsValidatingEmployee(true);
    axios.get(EMPLOYEES_ENDPOINT, { params: { search: formData.endUser } })
      .then(res => {
        const found = res.data && Array.isArray(res.data) && res.data.some(emp => emp.employee_id === formData.endUser);
        setEmployeeValidationStatus(found ? 'valid' : 'invalid');
        setEmployeeValidationMessage(found ? 'Valid employee' : 'Employee not found');
      })
      .catch(() => {
        setEmployeeValidationStatus('invalid');
        setEmployeeValidationMessage('Employee not found');
      })
      .finally(() => setIsValidatingEmployee(false));
  }, [formData.endUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'endUser') {
      setEmployeeSearchInput(value);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmployeeSelect = (employee) => {
    setFormData(prev => ({ ...prev, endUser: employee.employee_id }));
    setEmployeeSearchInput('');
    setShowEmployeeDropdown(false);
    setEmployeeValidationStatus('valid');
    setEmployeeValidationMessage('Valid employee');
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

              <label className="AssetProperty-ModalLabel">Document No.</label>
              <input className="AssetProperty-ModalInput" type="text" value={formData.documentNo} disabled style={{background:'#e8eef7'}} />

              <label className="AssetProperty-ModalLabel">PAR No.</label>
              <input className="AssetProperty-ModalInput" type="text" value={formData.parNo} disabled style={{background:'#e8eef7'}} />

              <label className="AssetProperty-ModalLabel">Description</label>
              <textarea className="AssetProperty-ModalInput AssetProperty-ModalTextarea" rows={3} value={formData.description} disabled style={{background:'#e8eef7', resize: 'none'}} />
            </div>
            <div>
              <label className="AssetProperty-ModalLabel">Serial No.</label>
              <input className="AssetProperty-ModalInput" type="text" value={formData.serialNo} disabled style={{background:'#e8eef7'}} />

              <label className="AssetProperty-ModalLabel">Date Acquired</label>
              <input className="AssetProperty-ModalInput" type="date" value={formData.dateAcquired} disabled style={{background:'#e8eef7'}} />

              <label className="AssetProperty-ModalLabel">Unit Cost</label>
              <input className="AssetProperty-ModalInput" type="text" value={formData.unitCost} disabled style={{background:'#e8eef7'}} />

              <label className="AssetProperty-ModalLabel">End User <span style={{ color: '#e53935' }}>*</span></label>
              <div className="AssetProperty-EmployeeSearchContainer">
                <input
                  ref={inputRef}
                  className={`AssetProperty-ModalInput AssetProperty-ModalInput--${employeeValidationStatus || 'default'}`}
                  type="text"
                  name="endUser"
                  value={formData.endUser}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                  onFocus={() => setShowEmployeeDropdown(employeeSearchResults.length > 0)}
                />
                {showEmployeeDropdown && employeeSearchResults.length > 0 && (
                  <div className="AssetProperty-EmployeeDropdown" ref={dropdownRef}>
                    {employeeSearchResults.map((employee, index) => (
                      <div
                        key={employee.employee_id}
                        className={`AssetProperty-EmployeeOption${focusedSuggestionIndex === index ? ' AssetProperty-EmployeeOption--focused' : ''}`}
                        onClick={() => handleEmployeeSelect(employee)}
                      >
                        <div className="AssetProperty-EmployeeOption-Name">{employee.full_name}</div>
                        <div className="AssetProperty-EmployeeOption-Id">{employee.employee_id}</div>
                        <div className="AssetProperty-EmployeeOption-Department">{employee.department}</div>
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
          {/* Error message for invalid employee selection */}
          {showEmployeeDropdown === false && employeeValidationStatus === 'invalid' && (
            <div className="PublicDocument-FormCenterError">
              Please select a valid employee from the dropdown.
            </div>
          )}
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
