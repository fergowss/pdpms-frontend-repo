import React, { useState, useEffect } from 'react';
import AddDocumentModal from './AddDocumentModal';
import EditDocumentModal from './EditDocumentModal';
import AddFollowUpModal from './AddFollowUpModal';
import './PublicDocument.css';
import axios from 'axios';

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

  // Data state
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [validation, setValidation] = useState({
    isOpen: false,
    type: 'error',
    title: '',
    message: '',
  });

  // Fetch documents from the API
  const fetchDocuments = () => {
    setIsLoading(true);
    axios
      .get('http://127.0.0.1:8000/pdpms/manila-city-hall/documents/')
      .then((response) => {
        console.log('API response:', response.data); // Debug
        const fetchedData = Array.isArray(response.data)
          ? response.data
              .filter((item) => item && typeof item === 'object')
              .map((item) => {
                if (!item.document_id) return null;
                return {
                  id: item.document_id || '',
                  ref: item.reference_code || '-',
                  subject: item.subject || '',
                  type: item.document_type || '',
                  date: item.document_date || '',
                  received: item.date_received || '',
                  receivedBy: item.received_by || '',
                  status: item.document_status || '',
                  remarks: item.remarks || '',
                  file: item.pdf_file ? item.pdf_file.startsWith('http') 
                    ? item.pdf_file // Use absolute URL as-is
                    : `http://127.0.0.1:8000${item.pdf_file}` // Prepend only for relative URLs
                    : '#',
                };
              })
              .filter((item) => item !== null)
          : [];
        setAllData(fetchedData);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        setValidation({
          isOpen: true,
          type: 'error',
          title: 'Fetch Error',
          message: 'Failed to load documents. Please check your connection.',
        });
      });
  };

  // Call fetchDocuments when the component mounts 
  useEffect(() => {
    fetchDocuments();
    }, []);

  // Helper: check if date is more than 5 years old
  function isOver5Years(dateString) {
    if (!dateString) return false;
    let docDate;
    if (dateString.split('/').length === 3) {
      // Accept both MM/DD/YY and YYYY-MM-DD
      if (dateString.includes('-')) {
        docDate = new Date(dateString);
      } else {
        const parts = dateString.split('/');
        // If year is 2-digit, prefix with 20
        let year = parts[2];
        if (year.length === 2) {
          year = +year < 50 ? '20' + year : '19' + year; // crude century logic
        }
        docDate = new Date(`${year}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`);
      }
    } else {
      docDate = new Date(dateString);
    }
    const now = new Date();
    const yearsDiff = (now - docDate) / (1000 * 60 * 60 * 24 * 365.25);
    return yearsDiff >= 5;
  }

  // Archiving data: NOT archived and document date > 5 years ago
  const archivingData = allData.filter(
    (row) => row.status !== 'Archived' && isOver5Years(row.date)
  );

  // Get base data based on active tab
  const baseData = activeTab === 'all' ? allData : archivingData;

  // Filter data based on search keyword
  const data = searchKeyword
    ? baseData.filter((row) =>
        Object.values(row).some(
          (value) =>
            value && value.toString().toLowerCase().includes(searchKeyword.toLowerCase())
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
    setValidation({ ...validation, isOpen: false });
  };

  const handleAddDocument = () => {
    closeAll();
    setShowAddNotif(true);
    setTimeout(() => setShowAddNotif(false), 3000);
  };

  // Handler for when a document is updated
  const handleUpdateDocument = (updatedFields) => {
    axios.patch(
      `http://127.0.0.1:8000/pdpms/manila-city-hall/documents/${selectedRow.id}/`,
      {
        reference_code: updatedFields.referenceCode,
        document_status: updatedFields.status,
        remarks: updatedFields.remarks,
      }
    )
    .then(() => {
      setEditModalOpen(false);
      setSelectedRow(null);
      setShowUpdateNotif(true);
      fetchDocuments(); // to refresh the data
      setTimeout(() => setShowUpdateNotif(false), 3000);
    })
    .catch((error) => {
      setValidation({
        isOpen: true,
        type: 'error',
        title: 'Update Error',
        message: 'Failed to update document. Please try again.',
      });
      console.error('Update error:', error);
    });
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

      {/* Validation/Error Notification */}
      {validation.isOpen && (
        <div className="PublicDocument-EditNotificationOverlay">
          <div className="PublicDocument-EditNotification">
            <h3>{validation.title}</h3>
            <p>{validation.message}</p>
            <button
              onClick={() => setValidation({ ...validation, isOpen: false })}
              style={{ padding: '5px 10px', cursor: 'pointer' }}
            >
              Close
            </button>
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
                <td>{row.file && row.file !== '#' ? ( 
                <>
                  {console.log('Rendering link for:', row.id, row.file)} {/* Debug */}
                  <button
                    className="PublicDocument-PDFLink"
                    onClick={() => {
                      try {
                        window.open(row.file, '_blank', 'noopener,noreferrer');
                        } catch (e) {
                          console.error('Failed to open PDF:', e, row.file);
                        }        
                        }}
                  >
                    View PDF
                  </button>
                </>
                ) : (
                  <span className="PublicDocument-NoPDF">No PDF</span>
                )}
                </td>
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



