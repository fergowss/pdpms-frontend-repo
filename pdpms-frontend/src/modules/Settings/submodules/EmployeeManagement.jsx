import React, { useState } from 'react';
import './EmployeeManagement.css';

export default function EmployeeManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Sample data - replace with actual API call
  const employees = [
    { id: 'EMP0001', name: 'Juan Dela Cruz', department: 'HR', position: 'HR Manager', status: 'Active' },
    { id: 'EMP0002', name: 'Maria Santos', department: 'IT', position: 'Developer', status: 'Active' },
    { id: 'EMP0003', name: 'Pedro Reyes', department: 'Finance', position: 'Accountant', status: 'Inactive' },
  ];

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchKeyword);
  };

  return (
    <div className="EmployeeManagement-Container">
      <div className="EmployeeManagement-Header">
        <h2 className="EmployeeManagement-Title">Employee Management</h2>
        <div className="EmployeeManagement-TopRow">
          <form onSubmit={handleSearch} className="EmployeeManagement-SearchBarRow">
            <input
              type="text"
              placeholder="Search employees..."
              className="EmployeeManagement-SearchBar"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </form>
        </div>
      </div>
      
      <div className="EmployeeManagement-TableContainer">
        <table className="EmployeeManagement-Table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Position</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td>{emp.name}</td>
                <td>{emp.department}</td>
                <td>{emp.position}</td>
                <td>
                  <span className={`EmployeeManagement-Status ${emp.status.toLowerCase()}`}>
                    {emp.status}
                  </span>
                </td>
                <td>
                  <button className="EmployeeManagement-EditBtn">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
