import React, { useState } from 'react';
import './AssetProperty.css';

const allData = [
  {
    propertyNo: 'PROP-0001',
    documentNo: 'DOC-2023-001',
    parNo: 'PAR-2023-001',
    description: 'Office Laptop',
    serialNo: 'SN-123456',
    dateAcquired: '2023-01-15',
    unitCost: '45,000.00',
    endUser: 'John Doe',
    estimatedLife: '5 years',
    status: 'Active',
    remarks: 'Assigned to IT Department'
  },
  // Add more sample data as needed
];

export default function AssetProperty() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredData = allData.filter(item => 
    Object.values(item).some(
      val => val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="AssetProperty-Container">
      <div className="AssetProperty-HeaderRow">
        <div className="AssetProperty-HeaderTabs">
          <div className="AssetProperty-Title">
            Asset Properties
          </div>
        </div>
        <div className="AssetProperty-SearchBox">
          <div className="AssetProperty-SearchWrapper">
            <input
              className="AssetProperty-SearchInput"
              type="text"
              placeholder="Enter Keyword"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="AssetProperty-SearchBtn">
              SEARCH
            </button>
          </div>
          <button className="AssetProperty-AddBtn">
            Add Property
          </button>
        </div>
      </div>

      <div className="AssetProperty-TableContainer">
        <table className="AssetProperty-Table">
          <thead>
            <tr>
              <th>Property No.</th>
              <th>Document No.</th>
              <th>PAR No.</th>
              <th>Description</th>
              <th>Serial No.</th>
              <th>Date Acquired</th>
              <th>Unit Cost</th>
              <th>End User</th>
              <th>Estimated Life Use</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                <td>{row.propertyNo}</td>
                <td>{row.documentNo}</td>
                <td>{row.parNo}</td>
                <td>{row.description}</td>
                <td>{row.serialNo}</td>
                <td>{row.dateAcquired}</td>
                <td>{row.unitCost}</td>
                <td>{row.endUser}</td>
                <td>{row.estimatedLife}</td>
                <td>
                  <span className={`AssetProperty-Status ${row.status.toLowerCase()}`}>
                    {row.status}
                  </span>
                </td>
                <td>{row.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
