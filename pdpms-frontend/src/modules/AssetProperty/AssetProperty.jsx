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
  {
    propertyNo: 'PROP-0002',
    documentNo: 'DOC-2023-002',
    parNo: 'PAR-2023-002',
    description: 'Desktop Computer',
    serialNo: 'SN-789012',
    dateAcquired: '2023-02-20',
    unitCost: '35,000.00',
    endUser: 'Jane Smith',
    estimatedLife: '4 years',
    status: 'Active',
    remarks: 'Finance Department'
  },
  {
    propertyNo: 'PROP-0003',
    documentNo: 'DOC-2023-003',
    parNo: 'PAR-2023-003',
    description: 'Projector',
    serialNo: 'SN-345678',
    dateAcquired: '2023-03-10',
    unitCost: '28,500.00',
    endUser: 'Marketing Team',
    estimatedLife: '5 years',
    status: 'Active',
    remarks: 'Conference Room A'
  },
  {
    propertyNo: 'PROP-0004',
    documentNo: 'DOC-2023-004',
    parNo: 'PAR-2023-004',
    description: 'Printer',
    serialNo: 'SN-901234',
    dateAcquired: '2022-12-05',
    unitCost: '15,750.00',
    endUser: 'HR Department',
    estimatedLife: '3 years',
    status: 'For Repair',
    remarks: 'Paper jam issue'
  },
  {
    propertyNo: 'PROP-0005',
    documentNo: 'DOC-2023-005',
    parNo: 'PAR-2023-005',
    description: 'Office Chair',
    serialNo: 'SN-567890',
    dateAcquired: '2023-01-30',
    unitCost: '8,500.00',
    endUser: 'Meeting Room',
    estimatedLife: '5 years',
    status: 'Active',
    remarks: 'Executive chair'
  },
  {
    propertyNo: 'PROP-0006',
    documentNo: 'DOC-2023-006',
    parNo: 'PAR-2023-006',
    description: 'Air Conditioner',
    serialNo: 'SN-123789',
    dateAcquired: '2022-11-15',
    unitCost: '32,000.00',
    endUser: 'Executive Office',
    estimatedLife: '7 years',
    status: 'Active',
    remarks: '2.5HP Inverter'
  },
  {
    propertyNo: 'PROP-0007',
    documentNo: 'DOC-2023-007',
    parNo: 'PAR-2023-007',
    description: 'Office Table',
    serialNo: 'SN-456123',
    dateAcquired: '2023-02-28',
    unitCost: '12,500.00',
    endUser: 'Reception Area',
    estimatedLife: '8 years',
    status: 'Active',
    remarks: 'L-shaped work desk'
  },
  {
    propertyNo: 'PROP-0008',
    documentNo: 'DOC-2023-008',
    parNo: 'PAR-2023-008',
    description: 'Network Switch',
    serialNo: 'SN-789456',
    dateAcquired: '2023-01-10',
    unitCost: '18,750.00',
    endUser: 'IT Department',
    estimatedLife: '5 years',
    status: 'Active',
    remarks: '48-port Gigabit'
  },
  {
    propertyNo: 'PROP-0009',
    documentNo: 'DOC-2023-009',
    parNo: 'PAR-2023-009',
    description: 'Security Camera',
    serialNo: 'SN-321654',
    dateAcquired: '2022-12-20',
    unitCost: '9,800.00',
    endUser: 'Main Entrance',
    estimatedLife: '4 years',
    status: 'Active',
    remarks: '4K Resolution'
  },
  {
    propertyNo: 'PROP-0010',
    documentNo: 'DOC-2023-010',
    parNo: 'PAR-2023-010',
    description: 'Water Dispenser',
    serialNo: 'SN-987321',
    dateAcquired: '2023-03-01',
    unitCost: '7,200.00',
    endUser: 'Pantry Area',
    estimatedLife: '3 years',
    status: 'Active',
    remarks: 'Hot & Cold'
  },
  {
    propertyNo: 'PROP-0011',
    documentNo: 'DOC-2023-011',
    parNo: 'PAR-2023-011',
    description: 'Whiteboard',
    serialNo: 'SN-654789',
    dateAcquired: '2023-02-15',
    unitCost: '5,400.00',
    endUser: 'Training Room',
    estimatedLife: '5 years',
    status: 'Active',
    remarks: '120x180cm'
  },
  {
    propertyNo: 'PROP-0012',
    documentNo: 'DOC-2023-012',
    parNo: 'PAR-2023-012',
    description: 'File Cabinet',
    serialNo: 'SN-159753',
    dateAcquired: '2023-01-20',
    unitCost: '6,800.00',
    endUser: 'Admin Office',
    estimatedLife: '10 years',
    status: 'Active',
    remarks: '4-drawer, Lockable'
  },
  {
    propertyNo: 'PROP-0013',
    documentNo: 'DOC-2023-013',
    parNo: 'PAR-2023-013',
    description: 'Coffee Machine',
    serialNo: 'SN-357159',
    dateAcquired: '2023-03-05',
    unitCost: '24,500.00',
    endUser: 'Executive Lounge',
    estimatedLife: '5 years',
    status: 'Active',
    remarks: 'Espresso Machine'
  },
  {
    propertyNo: 'PROP-0014',
    documentNo: 'DOC-2023-014',
    parNo: 'PAR-2023-014',
    description: 'Server Rack',
    serialNo: 'SN-753951',
    dateAcquired: '2023-01-05',
    unitCost: '38,000.00',
    endUser: 'Server Room',
    estimatedLife: '8 years',
    status: 'Active',
    remarks: '42U Rack Cabinet'
  },
  {
    propertyNo: 'PROP-0015',
    documentNo: 'DOC-2023-015',
    parNo: 'PAR-2023-015',
    description: 'UPS',
    serialNo: 'SN-258369',
    dateAcquired: '2023-02-10',
    unitCost: '22,000.00',
    endUser: 'Server Room',
    estimatedLife: '4 years',
    status: 'Active',
    remarks: '3KVA Online UPS'
  },
  {
    propertyNo: 'PROP-0016',
    documentNo: 'DOC-2023-016',
    parNo: 'PAR-2023-016',
    description: 'Fire Extinguisher',
    serialNo: 'SN-147258',
    dateAcquired: '2023-01-15',
    unitCost: '3,200.00',
    endUser: 'Hallway',
    estimatedLife: '2 years',
    status: 'Active',
    remarks: '5kg ABC Type'
  },
  {
    propertyNo: 'PROP-0017',
    documentNo: 'DOC-2023-017',
    parNo: 'PAR-2023-017',
    description: 'First Aid Kit',
    serialNo: 'SN-369258',
    dateAcquired: '2023-03-10',
    unitCost: '1,800.00',
    endUser: 'Clinic',
    estimatedLife: '1 year',
    status: 'Active',
    remarks: 'Standard Kit'
  },
  {
    propertyNo: 'PROP-0018',
    documentNo: 'DOC-2023-018',
    parNo: 'PAR-2023-018',
    description: 'Microwave Oven',
    serialNo: 'SN-582471',
    dateAcquired: '2023-02-20',
    unitCost: '6,500.00',
    endUser: 'Pantry',
    estimatedLife: '5 years',
    status: 'Active',
    remarks: '25L Capacity'
  },
  {
    propertyNo: 'PROP-0019',
    documentNo: 'DOC-2023-019',
    parNo: 'PAR-2023-019',
    description: 'Refrigerator',
    serialNo: 'SN-694827',
    dateAcquired: '2023-01-25',
    unitCost: '21,000.00',
    endUser: 'Pantry',
    estimatedLife: '7 years',
    status: 'Active',
    remarks: '12 cu.ft'
  },
  {
    propertyNo: 'PROP-0020',
    documentNo: 'DOC-2023-020',
    parNo: 'PAR-2023-020',
    description: 'Air Purifier',
    serialNo: 'SN-135790',
    dateAcquired: '2023-03-15',
    unitCost: '15,000.00',
    endUser: 'Meeting Room',
    estimatedLife: '5 years',
    status: 'Active',
    remarks: 'HEPA Filter'
  }];

import EditPropertyModal from './EditPropertyModal';

export default function AssetProperty() {
  const [showAddNotif, setShowAddNotif] = useState(false);
  const [showUpdateNotif, setShowUpdateNotif] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
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
    setAddModalOpen(false);
    setEditModalOpen(false);
    setShowEditConfirm(false);
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
  const handleUpdateProperty = (updatedData) => {
    // Update the data in the table
    const updatedIndex = allData.findIndex(item => item.propertyNo === selectedRow.propertyNo);
    if (updatedIndex !== -1) {
      allData[updatedIndex] = {
        ...allData[updatedIndex],
        ...updatedData
      };
    }
    setSelectedRow(null);
    setShowUpdateNotif(true);
    setTimeout(() => setShowUpdateNotif(false), 3000);
  };

  return (
    <div className="AssetProperty-Container">
      {showAddNotif && (
        <div className="AssetProperty-NotificationOverlay">
          <div className="AssetProperty-NotificationBox">
            <div className="AssetProperty-NotificationContent" style={{flexDirection: 'row', gap: '0.6rem', alignItems: 'center'}}>
              <span style={{display: 'flex', alignItems: 'center', marginRight: '0.4rem'}}>
                {StackIcon}
              </span>
              <span style={{fontSize: '0.97rem', color: '#223354', fontWeight: 400}}>New Asset Property Has Been Added.</span>
            </div>
          </div>
        </div>
      )}
      {showUpdateNotif && (
        <div className="AssetProperty-NotificationOverlay">
          <div className="AssetProperty-NotificationBox">
            <div className="AssetProperty-NotificationContent" style={{flexDirection: 'row', gap: '0.6rem', alignItems: 'center'}}>
              <span style={{display: 'flex', alignItems: 'center', marginRight: '0.4rem'}}>
                {StackIcon}
              </span>
              <span style={{fontSize: '0.97rem', color: '#223354', fontWeight: 400}}>Asset Property Has Been Updated.</span>
            </div>
          </div>
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
              <tr key={index} onClick={() => { closeAll(); setSelectedRow(row); setShowEditConfirm(true); }} style={{ cursor: 'pointer' }}>
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
                  <span className={`AssetProperty-Status ${row.status.toLowerCase().replace(/\s+/g, '')}`}>
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
        <button className="AssetProperty-AddBtn" onClick={() => { closeAll(); setAddModalOpen(true); }}>ADD PROPERTY</button>
      </div>
      <AddPropertyModal open={addModalOpen} onClose={closeAll} onAdd={handleAddProperty} />
      {/* Edit confirmation modal */}
      {showEditConfirm && selectedRow && (
        <div className="AssetProperty-EditNotificationOverlay">
          <div className="AssetProperty-EditNotification">
            <button 
              className="AssetProperty-EditNotification-Close" 
              onClick={closeAll}
              aria-label="Close"
            >
              ×
            </button>
            <div className="AssetProperty-EditNotification-Title">
              Edit Property<br/><b>{selectedRow.propertyNo}</b>?
            </div>
            <div className="AssetProperty-EditNotification-Actions">
              <button 
                className="AssetProperty-EditNotification-EditBtn"
                onClick={() => { setShowEditConfirm(false); setEditModalOpen(true); }}
              >
                EDIT
              </button>
            </div>
          </div>
        </div>
      )}
      <EditPropertyModal open={editModalOpen && !!selectedRow} onClose={closeAll} row={selectedRow} onUpdate={handleUpdateProperty} />

    </div>
  );
}
