import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmployeeManagement.css';
import AddEmployeeModal from './AddEmployeeModal';

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
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addNotifOpen, setAddNotifOpen] = useState(false);
  const [updateNotifOpen, setUpdateNotifOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch and transform employees from API
  useEffect(() => {
    setIsLoading(true);
    axios.get('http://127.0.0.1:8000/pdpms/manila-city-hall/employees/')
      .then(res => {
        const data = res.data;
        const transformed = Array.isArray(data) ? data.map(emp => ({
          id: emp.employee_id,
          name: `${emp.first_name} ${emp.last_name}`,
          position: emp.position_title,
          contact: emp.contact_no,
          status: emp.employee_status,
          firstName: emp.first_name,
          lastName: emp.last_name,
          employeeId: emp.employee_id,
        })) : [];
        setEmployees(transformed);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch employees:", err);
        setIsLoading(false);
      });
  }, []);

  // Filter data based on search keyword
  const data = searchKeyword
    ? employees.filter(row =>
        Object.values(row).some(
          value => value && value.toString().toLowerCase().includes(searchKeyword.toLowerCase())
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
        firstName: newEmp.firstName,
        lastName: newEmp.lastName,
        employeeId: newEmp.employeeId,
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
            firstName: updatedEmp.firstName,
            lastName: updatedEmp.lastName,
            employeeId: updatedEmp.employeeId,
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
        {isLoading ? (
          <div style={{textAlign: 'center', padding: '2rem', color: '#888'}}>Loading...</div>
        ) : (
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
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#888' }}>No records found.</td>
              </tr>
            ) : (
              data.map((row, i) => (
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
              ))
            )}
          </tbody>
        </table>
        )}
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
