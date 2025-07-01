import React, { useState } from 'react';
import AddDocumentModal from './AddDocumentModal';
import EditDocumentModal from './EditDocumentModal';
import './PublicDocument.css';


const allData = [
  {
    id: 'PDID00000303', ref: 'ENDR000025', subject: 'Assistance Survey', type: 'Endorsement', date: '06/12/23', received: '02/14/25', receivedBy: 'John Smith', remarks: 'To be pass to DOLE', status: 'On Going', file: '#',
  },
  {
    id: 'PDID00000459', ref: 'MMRM00201', subject: 'Intern Application', type: 'Memorandum', date: '10/06/23', received: '05/12/25', receivedBy: 'Maria Garcia', remarks: 'Must be presented to DILG in June 30, 2026', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000305', ref: 'ENDR000027', subject: 'Barangay Clearance', type: 'Certification', date: '01/04/23', received: '03/04/25', receivedBy: 'Robert Johnson', remarks: 'For signature of Brgy. Captain', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000307', ref: 'ENDR000029', subject: 'Barangay ID Application', type: 'Application', date: '01/06/23', received: '03/06/25', receivedBy: 'Sarah Wilson', remarks: 'To be sent to Office of the Mayor', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000309', ref: 'ENDR000031', subject: 'Scholarship Endorsement', type: 'Endorsement', date: '01/08/23', received: '03/08/25', receivedBy: 'Michael Brown', remarks: 'To be distributed to residents', status: 'Completed', file: '#',
  }, 
  {
    id: 'PDID00000311', ref: 'ENDR000033', subject: 'Business Permit Request', type: 'Request', date: '01/10/23', received: '03/10/25', receivedBy: 'Jennifer Davis', remarks: 'For review by committee', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000313', ref: 'ENDR000035', subject: 'Barangay Residency Certification', type: 'Certification', date: '01/12/23', received: '03/12/25', receivedBy: 'James Miller', remarks: 'To be archived', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000315', ref: 'ENDR000037', subject: 'Solo Parent ID Application', type: 'Application', date: '01/14/23', received: '03/14/25', receivedBy: 'Patricia Taylor', remarks: 'To be checked by secretary', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000317', ref: 'ENDR000039', subject: 'PWD ID Application', type: 'Application', date: '01/16/23', received: '03/16/25', receivedBy: 'David Anderson', remarks: 'Pending further documentation', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000319', ref: 'ENDR000041', subject: 'Certificate of Indigency', type: 'Certification', date: '01/18/23', received: '03/18/25', receivedBy: 'Lisa Thomas', remarks: 'To be picked up by applicant', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000321', ref: 'ENDR000043', subject: 'Barangay Business Clearance', type: 'Certification', date: '01/20/23', received: '03/20/25', receivedBy: 'Daniel Jackson', remarks: 'For legal review', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000323', ref: 'ENDR000045', subject: 'Barangay Certificate of Good Moral', type: 'Certification', date: '01/22/23', received: '03/22/25', receivedBy: 'Nancy White', remarks: 'Requires additional attachment', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000325', ref: 'ENDR000047', subject: 'Late Registration of Birth', type: 'Request', date: '01/24/23', received: '03/24/25', receivedBy: 'Kevin Harris', remarks: 'To be forwarded to PNP', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000327', ref: 'ENDR000049', subject: 'Barangay Blotter Report', type: 'Report', date: '01/26/23', received: '03/26/25', receivedBy: 'Karen Martin', remarks: 'To be validated by Treasurer', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000329', ref: 'ENDR000051', subject: 'Barangay Indigency for Medical', type: 'Certification', date: '01/28/23', received: '03/28/25', receivedBy: 'Thomas Clark', remarks: 'To be submitted to Sangguniang Bayan', status: 'Completed', file: '#',
  },
  {
    id: 'PDID00000331', ref: 'ENDR000053', subject: 'Barangay Certificate for Employment', type: 'Certification', date: '01/30/23', received: '03/30/25', receivedBy: 'Susan Lewis', remarks: 'For digital archiving', status: 'Completed', file: '#',
  },
];


const archivingData = allData.filter((row, i) => i % 2 === 1); // Just for demo: alternate rows


import AddFollowUpModal from './AddFollowUpModal';

export default function PublicDocument() {
  const [activeTab, setActiveTab] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showAddNotif, setShowAddNotif] = useState(false);
  const [showUpdateNotif, setShowUpdateNotif] = useState(false);
  const [showArchiveNotif, setShowArchiveNotif] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [addFollowUpModalOpen, setAddFollowUpModalOpen] = useState(false);
  const [addFollowUpDocId, setAddFollowUpDocId] = useState(null);
  const [showFollowUpNotif, setShowFollowUpNotif] = useState(false);

  
  // Get base data based on active tab
  const baseData = activeTab === 'all' ? allData : archivingData;
  
  // Filter data based on search keyword
  const data = searchKeyword 
    ? baseData.filter(row => 
        Object.values(row).some(
          value => value.toString().toLowerCase().includes(searchKeyword.toLowerCase())
        )
      )
    : baseData;

  // Handler for when a document is added
  const closeAll = () => {
    setModalOpen(false);
    setEditModalOpen(false);
    setSelectedRow(null);
    setShowAddNotif(false);
    setShowUpdateNotif(false);
    setShowArchiveNotif(false);
    setShowFollowUpNotif(false);
  };

  const handleAddDocument = () => {
    closeAll();
    setShowAddNotif(true);
    setTimeout(() => setShowAddNotif(false), 3000);
  };

  // Handler for when a document is updated
  const handleUpdateDocument = () => {
    setEditModalOpen(false);
    setSelectedRow(null);
    setShowUpdateNotif(true);
    setTimeout(() => setShowUpdateNotif(false), 3000);
  };

  // Handle search on input change
  const handleSearch = (value) => {
    setSearchTerm(value);
    setSearchKeyword(value);
  };

  // Clear search when changing tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
    setSearchKeyword('');
  };

  return (
    <div className="Public-Document-Container">
      <AddDocumentModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAddDocument} />
      {/* Add Document Success Notification */}
      {showAddNotif && (
        <div className="PublicDocument-EditNotificationOverlay">
          <div className="PublicDocument-EditNotification" style={{ flexDirection: 'row', gap: '0.6rem', alignItems: 'center', padding: '1rem 1.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', marginRight: '0.4rem' }}>
              <svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="20" rx="2" stroke="#000000" strokeWidth="2" fill="none"/>
                <rect x="7" y="8" width="10" height="2" rx="1" fill="#000000"/>
                <rect x="7" y="13" width="7" height="2" rx="1" fill="#000000"/>
                <rect x="7" y="18" width="5" height="2" rx="1" fill="#000000"/>
              </svg>
            </span>
            <span style={{ fontSize: '0.97rem', color: '#000000', fontWeight: 500 }}>New Public Document Has Been Added.</span>
          </div>
        </div>
      )}

      {/* Update Document Success Notification */}
      {showUpdateNotif && (
        <div className="PublicDocument-EditNotificationOverlay">
          <div className="PublicDocument-EditNotification" style={{ flexDirection: 'row', gap: '0.6rem', alignItems: 'center', padding: '1rem 1.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', marginRight: '0.4rem' }}>
              <svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="20" rx="2" stroke="#000000" strokeWidth="2" fill="none"/>
                <rect x="7" y="8" width="10" height="2" rx="1" fill="#000000"/>
                <rect x="7" y="13" width="7" height="2" rx="1" fill="#000000"/>
                <rect x="7" y="18" width="5" height="2" rx="1" fill="#000000"/>
              </svg>
            </span>
            <span style={{ fontSize: '0.97rem', color: '#000000', fontWeight: 500 }}>Public Document Has Been Updated.</span>
          </div>
        </div>
      )}

      {/* Archive Document Success Notification */}
      {showArchiveNotif && (
        <div className="PublicDocument-EditNotificationOverlay">
          <div className="PublicDocument-EditNotification" style={{ flexDirection: 'row', gap: '0.6rem', alignItems: 'center', padding: '1rem 1.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', marginRight: '0.4rem' }}>
              <svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="20" rx="2" stroke="#000000" strokeWidth="2" fill="none"/>
                <rect x="7" y="8" width="10" height="2" rx="1" fill="#000000"/>
                <rect x="7" y="13" width="7" height="2" rx="1" fill="#000000"/>
                <rect x="7" y="18" width="5" height="2" rx="1" fill="#000000"/>
              </svg>
            </span>
            <span style={{ fontSize: '0.97rem', color: '#000000', fontWeight: 500 }}>Document Has Been Moved to Archived.</span>
          </div>
        </div>
      )}
      <div className="PublicDocument-HeaderRow">
        <div className="PublicDocument-HeaderTabs">
          <div
            className={`PublicDocument-Tab${activeTab === 'all' ? ' PublicDocument-Tab--active' : ''}`}
            onClick={() => handleTabChange('all')}
            role="button"
            tabIndex={0}
            style={{ userSelect: 'none' }}
          >
            All
          </div>
          <div
            className={`PublicDocument-Tab${activeTab === 'archiving' ? ' PublicDocument-Tab--active' : ''}`}
            onClick={() => handleTabChange('archiving')}
            role="button"
            tabIndex={0}
            style={{ userSelect: 'none' }}
          >
            For Archiving
          </div>
        </div>
        <div className="PublicDocument-SearchBox">
          <div className="PublicDocument-SearchBarRow">
            <input
              className="PublicDocument-SearchBar"
              type="text"
              placeholder="Enter Keyword"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="PublicDocument-TableContainer" style={{position: 'relative'}}>
        <table className="PublicDocument-Table">
          <thead>
            <tr>
              <th>Document ID</th>
              <th>Reference Code</th>
              <th>Subject</th>
              <th>Document Type</th>
              <th>Date</th>
              <th>Date Received</th>
              <th>Received By</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>File</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.id + i} onClick={activeTab === 'all' ? () => setSelectedRow(row) : activeTab === 'archiving' ? () => setSelectedRow(row) : undefined}>
                <td>{row.id}</td>
                <td>{row.ref}</td>
                <td>{row.subject}</td>
                <td>{row.type}</td>
                <td>{row.date}</td>
                <td>{row.received}</td>
                <td>{row.receivedBy}</td>
                <td>{row.status}</td>
                <td>{row.remarks}</td>
                <td><a href={row.file} className="PublicDocument-PDFLink">View PDF</a></td>
              </tr>
            ))}
          </tbody>
        </table>
        {activeTab === 'all' && selectedRow && !editModalOpen && (
          <div className="PublicDocument-EditNotificationOverlay" style={{ zIndex: 2100 }}>
            <div className="PublicDocument-EditNotification">
              <button className="PublicDocument-EditNotification-Close" onClick={() => setSelectedRow(null)} title="Close">×</button>
              <div className="PublicDocument-EditNotification-Title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem' }}>
  <span>Manage Document</span>
  <b style={{ color: '#000000', fontWeight: 500 }}>{selectedRow.id}?</b>
</div>
              <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center' }}>
  <button className="PublicDocument-EditNotification-EditBtn" onClick={() => {
    setEditModalOpen(true);
    setSelectedRow(selectedRow);
    setShowAddNotif(false);
    setShowUpdateNotif(false);
  }}>
    EDIT
  </button>
  <button className="PublicDocument-EditNotification-EditBtn" onClick={() => { setAddFollowUpDocId(selectedRow?.id); setSelectedRow(null); setAddFollowUpModalOpen(true); }}>
    ADD FOLLOW-UP
  </button>
</div>
            </div>
          </div>
        )}
        {activeTab === 'all' && editModalOpen && (
          <EditDocumentModal open={editModalOpen} onClose={() => { setEditModalOpen(false); setSelectedRow(null); }} doc={selectedRow} onUpdate={handleUpdateDocument} />
        )}
        {activeTab === 'archiving' && selectedRow && (
          <div className="PublicDocument-EditNotificationOverlay">
            <div className="PublicDocument-EditNotification">
              <button className="PublicDocument-EditNotification-Close" onClick={() => setSelectedRow(null)} title="Close">×</button>
              <div className="PublicDocument-EditNotification-Title">
                Archive Document<br/><b style={{ color: '#000000', fontWeight: 500 }}>{selectedRow.id}</b>?
              </div>
              <button className="PublicDocument-ArchiveBtn" onClick={() => {
                setSelectedRow(null);
                setShowArchiveNotif(true);
                setTimeout(() => setShowArchiveNotif(false), 3000);
              }}>
                ARCHIVE
              </button>
            </div>
          </div>
        )}
      </div>
      <AddFollowUpModal
        open={addFollowUpModalOpen}
        onClose={() => setAddFollowUpModalOpen(false)}
        onAddFollowUp={(data) => { 
          setAddFollowUpModalOpen(false);
          setShowFollowUpNotif(true);
          setTimeout(() => setShowFollowUpNotif(false), 3000);
        }}
        docId={addFollowUpDocId}
      />

      {/* Follow-Up Document Success Notification */}
      {showFollowUpNotif && (
        <div className="PublicDocument-EditNotificationOverlay">
          <div className="PublicDocument-EditNotification" style={{ flexDirection: 'row', gap: '0.6rem', alignItems: 'center', padding: '1rem 1.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', marginRight: '0.4rem' }}>
              <svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="20" rx="2" stroke="#000000" strokeWidth="2" fill="none"/>
                <rect x="7" y="8" width="10" height="2" rx="1" fill="#000000"/>
                <rect x="7" y="13" width="7" height="2" rx="1" fill="#000000"/>
                <rect x="7" y="18" width="5" height="2" rx="1" fill="#000000"/>
              </svg>
            </span>
            <span style={{ fontSize: '0.97rem', color: '#000000', fontWeight: 500 }}>Follow-Up Document Has Been Added.</span>
          </div>
        </div>
      )}
      <div className="PublicDocument-AddBtnContainer">
        <button className="PublicDocument-AddBtn" onClick={() => { closeAll(); setModalOpen(true); }}>ADD DOCUMENT</button>
      </div>
    </div>
  );
}



