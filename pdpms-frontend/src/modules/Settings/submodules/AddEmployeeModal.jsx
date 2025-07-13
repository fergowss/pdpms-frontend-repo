import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../PublicDocument/PublicDocument.css';
import './EmployeeManagement.css'; // Add this if you use shared styles

export default function AddEmployeeModal({ open, onClose, onAdd }) {
  const PREFIX = 'EDPS-EMPL-';
  const [form, setForm] = useState({
    employeeIdSuffix: '',
    firstName: '',
    lastName: '',
    position: '',
    contact: '',
    status: '',
  });

  const [employeeIdStatus, setEmployeeIdStatus] = useState('');
  const [employeeIdMessage, setEmployeeIdMessage] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm({
      employeeIdSuffix: '',
      firstName: '',
      lastName: '',
      position: '',
      contact: '',
      status: '',
    });
    setEmployeeIdStatus('');
    setEmployeeIdMessage('');
  }, [open]);

  if (!open) return null;

  const isContactValid = (number) => {
    return /^09\d{9}$/.test(number) && !/^09(\d)\1{8}$/.test(number);
  };

  const isEmployeeIdValid = (suffix) => /^\d{4}$/.test(suffix);

  const checkEmployeeIdDuplicate = async (fullId) => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/pdpms/manila-city-hall/employees/');
      const exists = res.data.some(emp => emp.employee_id === fullId);
      if (exists) {
        setEmployeeIdStatus('invalid');
        setEmployeeIdMessage('Employee ID already exists.');
      } else {
        setEmployeeIdStatus('valid');
        setEmployeeIdMessage('Employee ID is available.');
      }
    } catch (error) {
      setEmployeeIdStatus('invalid');
      setEmployeeIdMessage('Error checking Employee ID.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'contact') {
      if (/^\d*$/.test(value)) {
        setForm(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === 'employeeIdSuffix') {
      const numericPart = value.replace(/\D/g, '').slice(0, 4);
      setForm(prev => ({ ...prev, employeeIdSuffix: numericPart }));

      const fullId = `${PREFIX}${numericPart}`;
      if (numericPart.length === 4) {
        checkEmployeeIdDuplicate(fullId);
      } else {
        setEmployeeIdStatus('');
        setEmployeeIdMessage('');
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const fullEmployeeId = `${PREFIX}${form.employeeIdSuffix}`;

  const isFormValid =
    Object.values(form).every((v) => v.trim() !== '') &&
    isContactValid(form.contact) &&
    isEmployeeIdValid(form.employeeIdSuffix) &&
    employeeIdStatus === 'valid';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      await axios.post('http://127.0.0.1:8000/pdpms/manila-city-hall/employees/', {
        employee_id: fullEmployeeId,
        first_name: form.firstName,
        last_name: form.lastName,
        position_title: form.position,
        contact_no: form.contact,
        employee_status: form.status,
      });
      if (onAdd) onAdd({ ...form, employeeId: fullEmployeeId });
      onClose();
    } catch (error) {
      alert('Failed to add employee. Please try again.');
    }
  };

  return (
    <div className="EmployeeManagement-ModalOverlay">
      <div className="EmployeeManagement-ModalBox">
        <form className="EmployeeManagement-ModalForm" onSubmit={handleSubmit}>
          <div className="EmployeeManagement-ModalGrid">
            <div>
              <label className="EmployeeManagement-ModalLabel">Employee ID</label>
              <input
                className={`EmployeeManagement-ModalInput`}
                name="employeeIdSuffix"
                value={fullEmployeeId}
                onChange={handleChange}
                maxLength={PREFIX.length + 4}
                required
              />
              {employeeIdMessage && (
                <div className={`AssetProperty-EmployeeValidation AssetProperty-EmployeeValidation--${employeeIdStatus}`}>
                  {employeeIdMessage}
                </div>
              )}

              <label className="EmployeeManagement-ModalLabel">First Name</label>
              <input className="EmployeeManagement-ModalInput" name="firstName" value={form.firstName} onChange={handleChange} required />

              <label className="EmployeeManagement-ModalLabel">Position</label>
              <select className="EmployeeManagement-ModalInput" name="position" value={form.position} onChange={handleChange} required>
                <option value="">Select Position</option>
                <option value="Manager">Manager</option>
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
                <option value="QA Engineer">QA Engineer</option>
                <option value="HR Specialist">HR Specialist</option>
                <option value="Accountant">Accountant</option>
                <option value="Admin Assistant">Admin Assistant</option>
                <option value="Marketing Officer">Marketing Officer</option>
                <option value="Sales Executive">Sales Executive</option>
                <option value="IT Support">IT Support</option>
                <option value="Operations Head">Operations Head</option>
                <option value="Recruiter">Recruiter</option>
                <option value="Content Writer">Content Writer</option>
                <option value="Graphic Designer">Graphic Designer</option>
                <option value="System Admin">System Admin</option>
              </select>
            </div>

            <div>
              <label className="EmployeeManagement-ModalLabel">Contact No.</label>
              <input
                className={`EmployeeManagement-ModalInput ${form.contact && !isContactValid(form.contact) ? 'InputError' : ''}`}
                name="contact"
                value={form.contact}
                onChange={handleChange}
                maxLength={11}
                required
              />
              {form.contact && !isContactValid(form.contact) && (
                <div className="AssetProperty-EmployeeValidation AssetProperty-EmployeeValidation--invalid">
                  Enter a valid contact number (e.g. 09123456789)
                </div>
              )}

              <label className="EmployeeManagement-ModalLabel">Last Name</label>
              <input className="EmployeeManagement-ModalInput" name="lastName" value={form.lastName} onChange={handleChange} required />

              <label className="EmployeeManagement-ModalLabel">Employee Status</label>
              <select className="EmployeeManagement-ModalInput" name="status" value={form.status} onChange={handleChange} required>
                <option value="">Select Employee Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="EmployeeManagement-ModalActions">
            <button
              type="submit"
              className="PublicDocument-ModalBtn PublicDocument-ModalBtn--primary"
              disabled={!isFormValid}
            >
              ADD
            </button>
            <button
              type="button"
              className="PublicDocument-ModalBtn PublicDocument-ModalBtn--secondary"
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
