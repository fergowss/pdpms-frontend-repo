import React, { useState } from 'react';
import './EmployeeEditModal.css';

export default function EmployeeEditModal({ open, employee, onClose, onUpdate }) {
  const [form, setForm] = useState(() => ({
    employeeId: employee?.id || '',
    firstName: employee?.name?.split(' ')[0] || '',
    lastName: employee?.name?.split(' ').slice(1).join(' ') || '',
    position: employee?.position || '',
    contact: employee?.contact || '',
    status: employee?.status || 'Active',
  }));
  
  // Update form when employee prop changes
  React.useEffect(() => {
    if (employee) {
      setForm({
        employeeId: employee.id,
        firstName: employee.name?.split(' ')[0] || '',
        lastName: employee.name?.split(' ').slice(1).join(' ') || '',
        position: employee.position || '',
        contact: employee.contact || '',
        status: employee.status || 'Active',
      });
    }
  }, [employee]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(form);
  };

  return (
    <div className="EmployeeEditModal-Overlay">
      <div className="EmployeeEditModal-Box">
        <form className="EmployeeEditModal-Form" onSubmit={handleSubmit}>
          <div className="EmployeeEditModal-Row">
            <label className="EmployeeEditModal-Label">Employee ID</label>
            <input 
              className="EmployeeEditModal-Input EmployeeEditModal-Disabled" 
              name="employeeId" 
              value={form.employeeId} 
              disabled 
            />
          </div>
          <div className="EmployeeEditModal-Grid">
            <div>
              <label className="EmployeeEditModal-Label">First Name</label>
              <input 
                className="EmployeeEditModal-Input EmployeeEditModal-Disabled" 
                name="firstName" 
                value={form.firstName} 
                onChange={handleChange} 
                disabled
              />
            </div>
            <div>
              <label className="EmployeeEditModal-Label">Last Name</label>
              <input 
                className="EmployeeEditModal-Input EmployeeEditModal-Disabled" 
                name="lastName" 
                value={form.lastName} 
                onChange={handleChange} 
                disabled
              />
            </div>
          </div>
          <div className="EmployeeEditModal-Grid">
            <div>
              <label className="EmployeeEditModal-Label">Position</label>
              <select className="EmployeeEditModal-Input" name="position" value={form.position} onChange={handleChange}>
                <option value="">Select Position</option>
                <option value="Job Order">Job Order</option>
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
              <label className="EmployeeEditModal-Label">Contact No.</label>
              <input className="EmployeeEditModal-Input" name="contact" value={form.contact} onChange={handleChange} />
            </div>
          </div>
          <div className="EmployeeEditModal-Row">
            <label className="EmployeeEditModal-Label">Employee Status</label>
            <select className="EmployeeEditModal-Input" name="status" value={form.status} onChange={handleChange}>
              <option value="">Select Status</option>
              <option value="Job Order">Job Order</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="EmployeeEditModal-Actions">
            <button type="submit" className="EmployeeEditModal-UpdateBtn">UPDATE</button>
            <button type="button" className="EmployeeEditModal-CancelBtn" onClick={onClose}>CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
}
