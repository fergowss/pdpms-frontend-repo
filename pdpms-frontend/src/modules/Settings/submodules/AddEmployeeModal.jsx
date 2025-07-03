import React, { useState } from 'react';
import axios from 'axios';
import '../../PublicDocument/PublicDocument.css'; // Reuse modal styles

export default function AddEmployeeModal({ open, onClose, onAdd }) {
  const [form, setForm] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    position: '',
    contact: '',
    status: '',
  });

  if (!open) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = Object.values(form).every(v => v && v.trim() !== '');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isFormValid) return;
    try {
      await axios.post('http://127.0.0.1:8000/pdpms/manila-city-hall/employees/', {
        employee_id: form.employeeId,
        first_name: form.firstName,
        last_name: form.lastName,
        position_title: form.position,
        contact_no: form.contact,
        employee_status: form.status,
      });
      if (onAdd) onAdd(form);
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
              <input className="EmployeeManagement-ModalInput" type="text" name="employeeId" value={form.employeeId} onChange={handleChange} required />
              
              <label className="EmployeeManagement-ModalLabel">First Name</label>
              <input className="EmployeeManagement-ModalInput" type="text" name="firstName" value={form.firstName} onChange={handleChange} required />
              
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
              <input className="EmployeeManagement-ModalInput" type="text" name="contact" value={form.contact} onChange={handleChange} required />
              
              <label className="EmployeeManagement-ModalLabel">Last Name</label>
              <input className="EmployeeManagement-ModalInput" type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
              
              <label className="EmployeeManagement-ModalLabel">Employee Status</label>
              <select className="EmployeeManagement-ModalInput" name="status" value={form.status} onChange={handleChange} required>
                <option value="">Select Employee Status</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="EmployeeManagement-ModalActions">
            <button type="submit" className="PublicDocument-ModalBtn PublicDocument-ModalBtn--primary" disabled={!isFormValid}>
              ADD
            </button>
            <button type="button" className="PublicDocument-ModalBtn PublicDocument-ModalBtn--secondary" onClick={onClose}>
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
