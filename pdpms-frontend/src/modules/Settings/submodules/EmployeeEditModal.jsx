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
  // local overlay flag
  const [blockNotif, setBlockNotif] = useState(false);

  React.useEffect(() => {
    if (employee) {
      setForm({
        employeeId: employee.id,
        firstName: employee.name?.split(' ')[0] || '',
        lastName: employee.name?.split(' ').slice(1).join(' ') || '',
        position: employee.position || '',
        contact: employee.contact || '',
        status: employee.status === 'Resigned' ? 'Inactive' : (employee.status || 'Active'),
      });
    }
  }, [employee]);

  if (!open) return null;

  const isContactValid = (number) => {
    return /^09\d{9}$/.test(number) && !/^09(\d)\1{8}$/.test(number);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contact') {
      if (/^\d*$/.test(value)) {
        setForm(f => ({ ...f, [name]: value }));
      }
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
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
    if (isFormChanged() && isContactValid(form.contact)) {
      try {
        if (form.status === 'Inactive') {
          try {
            const propsRes = await axios.get('http://127.0.0.1:8000/pdpms/manila-city-hall/properties/');
            const propsData = Array.isArray(propsRes.data) ? propsRes.data : [];
            const stillOwned = propsData.filter(p => p && (p.end_user === form.employeeId));
            if (stillOwned.length > 0) {
              setBlockNotif(true);
              setTimeout(() => setBlockNotif(false), 3000);
              return;
            }
          } catch (propErr) {
            console.warn('Property check failed:', propErr.response?.data || propErr.message);
          }
        }

        await axios.put(
          `http://127.0.0.1:8000/pdpms/manila-city-hall/employees/${form.employeeId}/`,
          {
            employee_id: form.employeeId,
            first_name: form.firstName,
            last_name: form.lastName,
            position_title: form.position,
            contact_no: form.contact,
            employee_status: form.status === 'Inactive' ? 'Resigned' : form.status,
          }
        );
        // Sync linked user status
        try {
          const { data: usersData } = await axios.get('http://127.0.0.1:8000/pdpms/manila-city-hall/users/');
          const linkedUser = Array.isArray(usersData) ? usersData.find(u => u.employee_id === form.employeeId) : null;
          if (linkedUser) {
            await axios.patch(
              `http://127.0.0.1:8000/pdpms/manila-city-hall/users/${linkedUser.username}/`,
              {
                user_status: form.status === 'Inactive' ? 'Deactivated' : 'Active',
              }
            );
          }
        } catch (syncErr) {
          console.warn('User status sync failed:', syncErr.response?.data || syncErr.message);
        }
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
              <input
                className={`EmployeeEditModal-Input ${form.contact && !isContactValid(form.contact) ? 'InputError' : ''}`}
                name="contact"
                value={form.contact}
                onChange={handleChange}
                maxLength={11}
              />
              
              {form.contact && (
                <div className={`EmployeeEditModal-ValidationText--${isContactValid(form.contact) ? 'valid' : 'invalid'}`}>
                  {isContactValid(form.contact) ? 'Valid contact number' : 'Enter a valid contact number (e.g. 09123456789)'}
                </div>
              )}
            </div>
          </div>
          <div className="EmployeeEditModal-Row">
            <label className="EmployeeEditModal-Label">Employee Status</label>
            <select className="EmployeeEditModal-Input" name="status" value={form.status} onChange={handleChange}>
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="EmployeeEditModal-Actions">
            <button
              type="submit"
              className="EmployeeEditModal-UpdateBtn"
              disabled={!(isFormChanged() && form.position && isContactValid(form.contact) && form.status)}
            >
              UPDATE
            </button>
            <button type="button" className="EmployeeEditModal-CancelBtn" onClick={onClose}>CANCEL</button>
          </div>
        </form>

        {blockNotif && (
          <div className="AssetProperty-NotificationOverlay" style={{ justifyContent: 'center', alignItems: 'center' }} onClick={() => setBlockNotif(false)}>
            <div className="AssetProperty-NotificationBox" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.7rem', padding: '1.2rem 1.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', height: '24px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#223354"/>
                </svg>
              </span>
              <span style={{ fontSize: '1.05rem', color: '#223354', fontWeight: 400 }}>Deactivation could not be completed as this user still has properties associated with their account.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
