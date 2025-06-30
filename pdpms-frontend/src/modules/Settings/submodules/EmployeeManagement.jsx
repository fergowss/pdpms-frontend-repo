import React, { useState } from 'react';
import './EmployeeManagement.css';
import AddEmployeeModal from './AddEmployeeModal';


const employeeData = [
  { id: 'EMP001', name: 'John Smith', position: 'Manager', contact: '09123456789', status: 'Active' },
  { id: 'EMP002', name: 'Maria Garcia', position: 'Developer', contact: '09234567890', status: 'Active' },
  { id: 'EMP003', name: 'Robert Johnson', position: 'Designer', contact: '09345678901', status: 'Active' },
  { id: 'EMP004', name: 'Sarah Wilson', position: 'QA Engineer', contact: '09456789012', status: 'On Leave' },
  { id: 'EMP005', name: 'Michael Brown', position: 'HR Specialist', contact: '09567890123', status: 'Active' },
  { id: 'EMP006', name: 'Jennifer Davis', position: 'Accountant', contact: '09678901234', status: 'Active' },
  { id: 'EMP007', name: 'James Miller', position: 'Admin Assistant', contact: '09789012345', status: 'Inactive' },
  { id: 'EMP008', name: 'Patricia Taylor', position: 'Marketing Officer', contact: '09890123456', status: 'Active' },
  { id: 'EMP009', name: 'David Anderson', position: 'Sales Executive', contact: '09901234567', status: 'Active' },
  { id: 'EMP010', name: 'Lisa Thomas', position: 'IT Support', contact: '09112345678', status: 'Active' },
  { id: 'EMP011', name: 'Daniel Jackson', position: 'Operations Head', contact: '09223456789', status: 'Active' },
  { id: 'EMP012', name: 'Nancy White', position: 'Recruiter', contact: '09334567890', status: 'On Leave' },
  { id: 'EMP013', name: 'Kevin Harris', position: 'Content Writer', contact: '09445678901', status: 'Active' },
  { id: 'EMP014', name: 'Karen Martin', position: 'Graphic Designer', contact: '09556789012', status: 'Active' },
  { id: 'EMP015', name: 'Thomas Clark', position: 'System Admin', contact: '09667890123', status: 'Active' },
];

import EmployeeEditNotification from './EmployeeEditNotification';
import './EmployeeEditNotification.css';

import EmployeeEditModal from './EmployeeEditModal';
import './EmployeeEditModal.css';
import EmployeeAddNotification from './EmployeeAddNotification';
import EmployeeUpdateNotification from './EmployeeUpdateNotification';

export default function EmployeeManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [employees, setEmployees] = useState(employeeData);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addNotifOpen, setAddNotifOpen] = useState(false);
  const [updateNotifOpen, setUpdateNotifOpen] = useState(false);

  // Filter data based on search keyword
  const data = searchKeyword
    ? employees.filter(row =>
        Object.values(row).some(
          value => value.toString().toLowerCase().includes(searchKeyword.toLowerCase())
        )
      )
    : employees;

  const handleSearch = (value) => {
    setSearchTerm(value);
    setSearchKeyword(value);
  };

  const handleAddEmployee = (newEmp) => {
    setEmployees(prev => [
      ...prev,
      {
        id: newEmp.employeeId,
        name: `${newEmp.firstName} ${newEmp.lastName}`,
        position: newEmp.position,
        contact: newEmp.contact,
        status: newEmp.status,
      },
    ]);
    setAddNotifOpen(true);
    setTimeout(() => setAddNotifOpen(false), 2500);
  };

  const handleRowClick = (row) => {
    setSelectedEmployee(row);
  };

  const handleUpdateEmployee = (updatedEmp) => {
    setEmployees(prev => prev.map(emp =>
      emp.id === updatedEmp.employeeId
        ? {
            ...emp,
            name: `${updatedEmp.firstName} ${updatedEmp.lastName}`,
            position: updatedEmp.position,
            contact: updatedEmp.contact,
            status: updatedEmp.status,
          }
        : emp
    ));
    setUpdateNotifOpen(true);
    setTimeout(() => setUpdateNotifOpen(false), 2500);
  };

  return (
    <div className="EmployeeManagement-Container">
      <EmployeeAddNotification open={addNotifOpen} onClose={() => setAddNotifOpen(false)} />
      <EmployeeUpdateNotification open={updateNotifOpen} onClose={() => setUpdateNotifOpen(false)} />
      <div className="EmployeeManagement-HeaderRow">
      <div style={{ flex: 1 }}></div>
        <div className="EmployeeManagement-SearchBox">
          <div className="EmployeeManagement-SearchBarRow">
            <input
              className="EmployeeManagement-SearchBar"
              type="text"
              placeholder="Enter Keyword"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="EmployeeManagement-TableContainer">
        <table className="EmployeeManagement-Table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Full Name</th>
              <th>Position</th>
              <th>Contact No.</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.id + i} onClick={() => handleRowClick(row)}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.position}</td>
                <td>{row.contact}</td>
                <td>
                  <span className={`EmployeeManagement-Status ${row.status.toLowerCase().replace(/\s+/g, '')}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="EmployeeManagement-AddBtnContainer">
        <button className="EmployeeManagement-AddBtn" onClick={() => setModalOpen(true)}>
          ADD EMPLOYEE
        </button>
      </div>
      <AddEmployeeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddEmployee}
      />
      <EmployeeEditNotification
        open={!!selectedEmployee && !editModalOpen}
        onClose={() => setSelectedEmployee(null)}
        onEdit={() => setEditModalOpen(true)}
      />
      <EmployeeEditModal
        open={!!selectedEmployee && editModalOpen}
        employee={selectedEmployee}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        onUpdate={handleUpdateEmployee}
      />
    </div>
  );
}
