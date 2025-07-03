import React, { useState } from 'react';
import axios from 'axios';
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

  const isFormChanged = () => {
    return (
      form.employeeId !== (employee?.id || '') ||
      form.firstName !== (employee?.name?.split(' ')[0] || '') ||
      form.lastName !== (employee?.name?.split(' ').slice(1).join(' ') || '') ||
      form.position !== (employee?.position || '') ||
      form.contact !== (employee?.contact || '') ||
      form.status !== (employee?.status || 'Active')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormChanged()) {
      try {
        await axios.put(
          `http://127.0.0.1:8000/pdpms/manila-city-hall/employees/${form.employeeId}/`,
          {
            employee_id: form.employeeId,
            first_name: form.firstName,
            last_name: form.lastName,
            position_title: form.position,
            contact_no: form.contact,
            employee_status: form.status,
          }
        );
        onUpdate(form);
        onClose();
      } catch (error) {
        alert('Failed to update employee. Please try again.');
      }
    }
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
              <option value="Active">Active</option>
              <option value="Resigned">Resigned</option>
              <option value="Maternity Leave">Maternity Leave</option>
              <option value="Terminated">Terminated</option>
              <option value="Vacation Leave">Vacation Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
            </select>
          </div>
          <div className="EmployeeEditModal-Actions">
            <button type="submit" className="EmployeeEditModal-UpdateBtn" disabled={!(isFormChanged() && form.position && form.contact && form.status)}>UPDATE</button>
            <button type="button" className="EmployeeEditModal-CancelBtn" onClick={onClose}>CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
}
