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
  // Date filter states
  const [docDateFilter, setDocDateFilter] = useState('');
  const [receivedDateFilter, setReceivedDateFilter] = useState('');
  const [showDocDateFilter, setShowDocDateFilter] = useState(false);
  const [showReceivedDateFilter, setShowReceivedDateFilter] = useState(false);
  const docInputRef = React.useRef(null);
  const receivedInputRef = React.useRef(null);

  // auto-open native picker when input appears
  useEffect(() => {
    if (showDocDateFilter && docInputRef.current) {
      docInputRef.current.focus();
      if (docInputRef.current.showPicker) docInputRef.current.showPicker();
    }
  }, [showDocDateFilter]);
  useEffect(() => {
    if (showReceivedDateFilter && receivedInputRef.current) {
      receivedInputRef.current.focus();
      if (receivedInputRef.current.showPicker) receivedInputRef.current.showPicker();
    }
  }, [showReceivedDateFilter]);

  // Data state
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [validation, setValidation] = useState({
    isOpen: false,
    type: 'error',
    title: '',
    message: '',
  });

  // Utility function to insert newlines after every 10 words for subject and remarks, 5 words for receivedBy
  const insertNewlines = (text, isReceivedBy = false) => {
    if (!text) return '';
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const chunkSize = isReceivedBy ? 5 : 10;
    const lines = [];
    for (let i = 0; i < words.length; i += chunkSize) {
      lines.push(words.slice(i, i + chunkSize).join(' '));
    }
    return lines.join('\n');
  };

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
                  base_document_id: item.base_document_id || '', // New field
                };
              })
              .filter((item) => item !== null)
          : [];
        
        // Sort by date to ensure consistent ordering - newest first, oldest last
        const sortedData = fetchedData.sort((a, b) => {
          // Use received date first, then document date as fallback
          const dateA = new Date(a.received || a.date || '1900-01-01');
          const dateB = new Date(b.received || b.date || '1900-01-01');
          return dateB - dateA; // Descending order (newest first, oldest last)
        });
        
        setAllData(sortedData); // Latest documents will be at the top
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
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
    if (dateString.includes('-')) { // Assuming YYYY-MM-DD
        docDate = new Date(dateString);
    } else if (dateString.split('/').length === 3) { // Assuming MM/DD/YY or MM/DD/YYYY
        const parts = dateString.split('/');
        let year = parts[2];
        if (year.length === 2) {
            year = +year < 50 ? '20' + year : '19' + year; 
        }
        docDate = new Date(`${year}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`);
    } else {
        docDate = new Date(dateString); // Fallback for other formats Date constructor might handle
    }

    // Check for invalid date
    if (isNaN(docDate.getTime())) {
        console.warn(`Invalid date format for: ${dateString}`);
        return false; 
    }

    const now = new Date();
    const yearsDiff = (now - docDate) / (1000 * 60 * 60 * 24 * 365.25); // Account for leap years
    return yearsDiff >= 5;
  }

  // Archiving data: NOT archived and document date > 5 years ago
  const archivingData = allData.filter(
    (row) => row.status !== 'Archived' && isOver5Years(row.date)
  );

  // Get base data based on active tab
  const baseData = activeTab === 'all' ? allData : archivingData;

  // Filter data based on search keyword
  let data = searchKeyword
    ? baseData.filter((row) =>
        Object.values(row).some(
          (value) =>
            value && value.toString().toLowerCase().includes(searchKeyword.toLowerCase())
        )
      )
    : baseData;

  // Apply date filters if set
  if (docDateFilter) {
    data = data.filter(row => row.date && row.date.startsWith(docDateFilter));
  }
  if (receivedDateFilter) {
    data = data.filter(row => row.received && row.received.startsWith(receivedDateFilter));
  }

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
    fetchDocuments(); // Refresh the data after adding
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

  // Handler for archiving a document
  const handleArchiveDocument = async (docId) => {
    try {
      console.log(`Attempting to archive document by status change: ${docId}`);

      // Perform a PATCH request to update the document_status to 'Archived'
      await axios.patch(
        `http://127.0.0.1:8000/pdpms/manila-city-hall/documents/${docId}/`,
        {
          document_status: 'Archived', // This is the only change needed
        }
      );

      // Close modal and show success notification
      setSelectedRow(null); // Clear selected row after action
      setShowArchiveNotif(true);
      fetchDocuments(); // Re-fetch all documents to reflect the status change
      setTimeout(() => setShowArchiveNotif(false), 3000);
    } catch (error) {
      console.error('Archive error:', error);
      console.error('📥 Server response:', error.response?.data);
      setValidation({
        isOpen: true,
        type: 'error',
        title: 'Archive Error',
        message:
          error.response?.data?.detail || // Common for Django REST Framework generic errors
          error.response?.data?.message ||
          JSON.stringify(error.response?.data, null, 2) ||
          'Failed to archive document. Please try again.',
      });
    }
  };

  const handleAddFollowUp = async (formData) => {
    if (!addFollowUpDocId) return;

    const baseId = addFollowUpDocId;
    const submissionData = new FormData();

    // Format dates to YYYY-MM-DD
    const formatDate = (date) => {
      if (!date) return '';
      // Check for invalid date format
      const d = new Date(date);
      return isNaN(d) ? '' : d.toISOString().split('T')[0];
    };

    // Log formData for debugging
    console.log('FormData:', {
      base_document_id: baseId,
      reference_code: formData.referenceCode,
      subject: formData.subject,
      document_type: formData.documentType,
      document_date: formData.date,
      date_received: formData.dateReceived,
      received_by: formData.receivedBy,
      document_status: formData.status,
      remarks: formData.remarks,
      pdf_file: formData.file
    });

    submissionData.append('base_document_id', baseId);
    submissionData.append('reference_code', formData.referenceCode || '');
    submissionData.append('subject', formData.subject || '');
    submissionData.append('document_type', formData.documentType || '');
    submissionData.append('document_date', formatDate(formData.date));
    submissionData.append('date_received', formatDate(formData.dateReceived));
    submissionData.append('received_by', formData.receivedBy || '');
    submissionData.append('document_status', formData.status || '');
    submissionData.append('remarks', formData.remarks || '');
    if (formData.file) submissionData.append('pdf_file', formData.file);

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/pdpms/manila-city-hall/documents/',
        submissionData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      console.log('Created document ID:', response.data.document_id);
      setShowFollowUpNotif(true);
      fetchDocuments();
      setTimeout(() => setShowFollowUpNotif(false), 3000);
    } catch (err) {
      console.error('Follow-up creation error:', err);
      console.error('Server response:', err.response?.data);
      setValidation({
        isOpen: true,
        type: 'error',
        title: 'Follow-Up Error',
        message: err.response?.data?.message || JSON.stringify(err.response?.data) || 'Failed to add follow-up document.',
      });
    }
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
              <th>Subject/Description</th>
              <th>Document Type</th>
              <th style={{ position: 'sticky', top: 0, cursor: 'pointer', background: '#f6f8fa', zIndex: 2 }} onClick={(e) => { e.stopPropagation(); setShowDocDateFilter(prev => !prev); }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Date
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="#223354" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {showDocDateFilter && (
                  <input
                    ref={docInputRef}
                    type="date"
                    value={docDateFilter}
                    onChange={(e) => setDocDateFilter(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={() => setShowDocDateFilter(false)}
                    style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.2rem', zIndex: 5 }}
                  />
                )}
              </th>
              <th style={{ position: 'sticky', top: 0, cursor: 'pointer', background: '#f6f8fa', zIndex: 2 }} onClick={(e) => { e.stopPropagation(); setShowReceivedDateFilter(prev => !prev); }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Date Received
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="#223354" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {showReceivedDateFilter && (
                  <input
                    ref={receivedInputRef}
                    type="date"
                    value={receivedDateFilter}
                    onChange={(e) => setReceivedDateFilter(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={() => setShowReceivedDateFilter(false)}
                    style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.2rem', zIndex: 5 }}
                  />
                )}
              </th>
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
                <td className="subject-cell">{insertNewlines(row.subject)}</td>
                <td>{row.type}</td>
                <td>{row.date}</td>
                <td>{row.received}</td>
                <td className="receivedby-cell">{insertNewlines(row.receivedBy, true)}</td>
                <td>{row.status}</td>
                <td className="remarks-cell">{insertNewlines(row.remarks)}</td>
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
        {activeTab === 'all' && selectedRow && !editModalOpen && selectedRow.status !== 'Archived' && (
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
                <button className="PublicDocument-EditNotification-EditBtn" onClick={() => { const baseId = selectedRow?.id.includes('-') ? selectedRow.id.split('-').slice(0, 4).join('-'): selectedRow.id; setAddFollowUpDocId(baseId); setSelectedRow(null); setAddFollowUpModalOpen(true); }}>
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
                handleArchiveDocument(selectedRow.id);
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
        onAddFollowUp={async (data) => {
          setAddFollowUpModalOpen(false);
          await handleAddFollowUp(data);
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