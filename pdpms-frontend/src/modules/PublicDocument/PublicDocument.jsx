import React, { useState, useEffect } from 'react';
import AddDocumentModal from './AddDocumentModal';
import EditDocumentModal from './EditDocumentModal';
import AddFollowUpModal from './AddFollowUpModal';
import './PublicDocument.css';
import axios from 'axios';

export default function PublicDocument() {
  const [activeTab, setActiveTab] = useState('all');
  const [allData, setAllData] = useState([]);
  const [archivingData, setArchivingData] = useState([]);
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
  const [isLoading, setIsLoading] = useState(true);

  // Fetch documents and archived documents
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      axios.get('http://127.0.0.1:8000/pdpms/manila-city-hall/documents/'),
      axios.get('http://127.0.0.1:8000/pdpms/manila-city-hall/archived-documents/'),
    ])
      .then(([docsRes, archRes]) => {
        setAllData(Array.isArray(docsRes.data) ? docsRes.data : []);
        setArchivingData(Array.isArray(archRes.data) ? archRes.data : []);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching documents:', error);
        setAllData([]);
        setArchivingData([]);
        setIsLoading(false);
      });
  }, []);

  // Get base data based on active tab
  const baseData = activeTab === 'all' ? allData : archivingData;

  // Filter data based on search keyword
  const data = searchKeyword
    ? baseData.filter(row =>
        Object.values(row).some(
          value => value && value.toString().toLowerCase().includes(searchKeyword.toLowerCase())
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
        {isLoading ? (
          <div style={{textAlign: "center", padding: "2rem", color: "#888"}}>Loading...</div>
        ) : (
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
              <tr key={row.document_id || i} onClick={() => setSelectedRow(row)}>
                <td>{row.document_id}</td>
                <td>{row.reference_code || '-'}</td>
                <td>{row.subject}</td>
                <td>{row.document_type}</td>
                <td>{row.document_date}</td>
                <td>{row.date_received}</td>
                <td>{row.received_by}</td>
                <td>{row.document_status}</td>
                <td>{row.remarks}</td>
                <td><a href={row.file} className="PublicDocument-PDFLink">View PDF</a></td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
        {activeTab === 'all' && selectedRow && !editModalOpen && (
          <div className="PublicDocument-EditNotificationOverlay" style={{ zIndex: 2100 }}>
            <div className="PublicDocument-EditNotification">
              <button className="PublicDocument-EditNotification-Close" onClick={() => setSelectedRow(null)} title="Close">×</button>
              <div className="PublicDocument-EditNotification-Title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem' }}>
                <span>Manage Document</span>
                <b style={{ color: '#000000', fontWeight: 500 }}>{selectedRow.document_id}?</b>
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
                <button className="PublicDocument-EditNotification-EditBtn" onClick={() => { setAddFollowUpDocId(selectedRow?.document_id); setSelectedRow(null); setAddFollowUpModalOpen(true); }}>
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
                Archive Document<br/><b style={{ color: '#000000', fontWeight: 500 }}>{selectedRow.document_id}</b>?
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



