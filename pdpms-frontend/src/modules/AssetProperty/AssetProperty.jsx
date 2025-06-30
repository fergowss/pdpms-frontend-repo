import React, { useState } from 'react';
import './AssetProperty.css';
import AddPropertyModal from './AddPropertyModal';

// SVG for stack icon (from user screenshot)
const StackIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="16" width="20" height="4" rx="1" fill="#223354"/>
    <rect x="4" y="10" width="16" height="4" rx="1" fill="#223354"/>
    <rect x="6" y="4" width="12" height="4" rx="1" fill="#223354"/>
  </svg>
);

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

import EditPropertyModal from './EditPropertyModal';

export default function AssetProperty() {
  const [showAddNotif, setShowAddNotif] = useState(false);
  const [showUpdateNotif, setShowUpdateNotif] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // Handle search on input change
  const handleSearch = (value) => {
    setSearchTerm(value);
    setSearchKeyword(value);
  };

  // Filter data based on search keyword
  const filteredData = searchKeyword 
    ? allData.filter(item => 
        Object.values(item).some(
          val => val.toString().toLowerCase().includes(searchKeyword.toLowerCase())
        )
      )
    : allData;

  // Handler for when a property is added
  const closeAll = () => {
    setModalOpen(false);
    setEditModalOpen(false);
    setEditFormOpen(false);
    setSelectedRow(null);
    setShowAddNotif(false);
    setShowUpdateNotif(false);
  };

  const handleAddProperty = () => {
    closeAll();
    setShowAddNotif(true);
    setTimeout(() => setShowAddNotif(false), 3000);
  };

  // Handler for when a property is updated
  const handleUpdateProperty = () => {
    setEditFormOpen(false);
    setSelectedRow(null);
    setShowUpdateNotif(true);
    setTimeout(() => setShowUpdateNotif(false), 3000);
  };

  return (
    <div className="AssetProperty-Container">
      {showAddNotif && (
        <div className="AssetProperty-EditNotification" style={{zIndex: 3000, flexDirection: 'row', gap: '0.6rem', alignItems: 'center', minWidth: 260, padding: '0.7rem 1.1rem', position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}>
          <span style={{display: 'flex', alignItems: 'center', marginRight: '0.4rem'}}>
            {StackIcon}
          </span>
          <span style={{fontSize: '0.97rem', color: '#223354', fontWeight: 400}}>New Asset Property Has Been Added.</span>
        </div>
      )}
      {showUpdateNotif && (
        <div className="AssetProperty-EditNotification" style={{zIndex: 3000, flexDirection: 'row', gap: '0.6rem', alignItems: 'center', minWidth: 260, padding: '0.7rem 1.1rem', position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}>
          <span style={{display: 'flex', alignItems: 'center', marginRight: '0.4rem'}}>
            {StackIcon}
          </span>
          <span style={{fontSize: '0.97rem', color: '#223354', fontWeight: 400}}>Asset Property Has Been Updated.</span>
        </div>
      )}
      <div className="AssetProperty-HeaderRow">
        <div className="AssetProperty-HeaderTabs">
          <div className="AssetProperty-Title">
          </div>
        </div>
        <div className="AssetProperty-SearchBox">
          <div className="AssetProperty-SearchBarRow">
            <input
              className="AssetProperty-SearchBar"
              type="text"
              placeholder="Enter Keyword"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
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
              <tr key={index} onClick={() => { closeAll(); setSelectedRow(row); setEditModalOpen(true); }} style={{ cursor: 'pointer' }}>
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
      <div className="AssetProperty-AddBtnContainer">
        <button className="AssetProperty-AddBtn" onClick={() => { closeAll(); setModalOpen(true); }}>ADD PROPERTY</button>
      </div>
      {modalOpen && (
        <AddPropertyModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAddProperty} />
      )}
      {editModalOpen && selectedRow && !editFormOpen && (
        <div className="AssetProperty-EditNotification">
          <button className="AssetProperty-EditNotification-Close" onClick={() => { setEditModalOpen(false); setSelectedRow(null); }} title="Close">×</button>
          <div className="AssetProperty-EditNotification-Title">
            Edit Property<br/>{selectedRow.propertyNo}?
          </div>
          <button className="AssetProperty-EditNotification-EditBtn" onClick={() => { setEditModalOpen(false); setEditFormOpen(true); }}>
            EDIT
          </button>
        </div>
      )}
      {editFormOpen && selectedRow && (
        <EditPropertyModal 
          open={editFormOpen} 
          onClose={() => setEditFormOpen(false)} 
          row={selectedRow} 
          onUpdate={handleUpdateProperty} 
        />
      )};
    </div>
  );
}
