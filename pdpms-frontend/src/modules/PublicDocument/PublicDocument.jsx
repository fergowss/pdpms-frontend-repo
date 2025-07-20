import React, { useState, useEffect } from 'react';
import AddDocumentModal from './AddDocumentModal';
import EditDocumentModal from './EditDocumentModal';
import AddFollowUpModal from './AddFollowUpModal';
import './PublicDocument.css';
import axios from 'axios';

export default function PublicDocument({ username }) {
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
  const [expandedRows, setExpandedRows] = useState(new Set());
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllPages, setShowAllPages] = useState(false);
  const itemsPerPage = 100;
  // Date filter states
  const [docDateFilter, setDocDateFilter] = useState('');
  const [receivedDateFilter, setReceivedDateFilter] = useState('');
  const [showDocDateFilter, setShowDocDateFilter] = useState(false);
  const [showReceivedDateFilter, setShowReceivedDateFilter] = useState(false);
  const docInputRef = React.useRef(null);
  const receivedInputRef = React.useRef(null);
  // Document type filter state
  const [documentTypeFilter, setDocumentTypeFilter] = useState('');
  const [showTypeFilter, setShowTypeFilter] = useState(false);

  // Auto-open native picker when input appears
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

  // Extract unique document types for filter dropdown
  const documentTypes = React.useMemo(
    () => [...new Set(allData.map((d) => d.type).filter((t) => t && t.trim() !== ''))],
    [allData]
  );

  // Utility function to insert newlines after every 10 words for subject and remarks, 5 words for receivedBy
  const insertNewlines = (text, isReceivedBy = false) => {
    if (!text) return '';
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const chunkSize = isReceivedBy ? 5 : 10;
    const lines = [];
    for (let i = 0; i < words.length; i += chunkSize) {
      lines.push(words.slice(i, i + chunkSize).join(' '));
    }
    return lines.map((line, idx) => (
      idx === 0 ? line : [<br key={idx} />, line]
    ));
  };

  // Fetch documents from the API
  const fetchDocuments = () => {
    setIsLoading(true);
    axios
      .get('http://127.0.0.1:8000/pdpms/manila-city-hall/documents/')
      .then((response) => {
        console.log('API response:', response.data);
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
                  file: item.pdf_file
                    ? item.pdf_file.startsWith('http')
                      ? item.pdf_file
                      : `http://127.0.0.1:8000${item.pdf_file}`
                    : '#',
                  base_document_id: item.base_document_id || '',
                };
              })
              .filter((item) => item !== null)
          : [];

        const sortedData = fetchedData.sort((a, b) => {
          const dateA = new Date(a.received || a.date || '1900-01-01');
          const dateB = new Date(b.received || b.date || '1900-01-01');
          return dateB - dateA;
        });

        setAllData(sortedData);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error('Fetch error:', error);
      });
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Helper: check if date is more than 5 years old
  function isOver5Years(dateString) {
    if (!dateString) return false;
    let docDate;
    if (dateString.includes('-')) {
      docDate = new Date(dateString);
    } else if (dateString.split('/').length === 3) {
      const parts = dateString.split('/');
      let year = parts[2];
      if (year.length === 2) {
        year = +year < 50 ? '20' + year : '19' + year;
      }
      docDate = new Date(`${year}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`);
    } else {
      docDate = new Date(dateString);
    }

    if (isNaN(docDate.getTime())) {
      console.warn(`Invalid date format for: ${dateString}`);
      return false;
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
    console.log('Applying Document Date Filter:', docDateFilter);
    data = data.filter((row) => {
      if (!row.date) {
        console.log('No date for row:', row.id);
        return false;
      }
      const normalizedDate = new Date(row.date);
      if (isNaN(normalizedDate.getTime())) {
        console.log('Invalid date for row:', row.id, 'Date:', row.date);
        return false;
      }
      const formattedDate = normalizedDate.toISOString().split('T')[0];
      console.log('Comparing:', formattedDate, 'with filter:', docDateFilter, 'for row:', row.id);
      return formattedDate === docDateFilter;
    });
  }
  if (receivedDateFilter) {
    console.log('Applying Received Date Filter:', receivedDateFilter);
    data = data.filter((row) => {
      if (!row.received) {
        console.log('No received date for row:', row.id);
        return false;
      }
      const normalizedDate = new Date(row.received);
      if (isNaN(normalizedDate.getTime())) {
        console.log('Invalid received date for row:', row.id, 'Date:', row.received);
        return false;
      }
      const formattedDate = normalizedDate.toISOString().split('T')[0];
      console.log('Comparing:', formattedDate, 'with filter:', receivedDateFilter, 'for row:', row.id);
      return formattedDate === receivedDateFilter;
    });
  }



  // Apply document type filter if set
  if (documentTypeFilter) {
    data = data.filter((row) => row.type === documentTypeFilter);
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
    fetchDocuments();
    setTimeout(() => setShowAddNotif(false), 3000);
  };

  // Utility: extract base (mother) document ID
  function getBaseDocumentIdInternal(docId) {
    if (!docId) return '';
    const parts = docId.split('-');
    // If last part is 4-digit numeric extension, remove it
    if (parts.length && /^\d{4}$/.test(parts[parts.length - 1])) {
      return parts.slice(0, -1).join('-');
    }
    return docId;
  }

  // Auto-archive related documents based on new rules
  const autoArchiveRelated = async (updatedDoc, updatedFields) => {
    try {
      if (!updatedDoc) return;
      const baseId = getBaseDocumentIdInternal(updatedDoc.id);
      const isMother = updatedDoc.id === baseId;

      // Helper to patch a doc to Archived
      const archiveDoc = (doc) => axios.patch(`http://127.0.0.1:8000/pdpms/manila-city-hall/documents/${doc.id}/`, { document_status: 'Archived' });

      if (!isMother) {
        // Follow-up archived: if mother exists, completed, and over 5 yrs, archive mother as well
        const mother = allData.find((d) => d.id === baseId);
        if (mother && mother.status === 'Completed' && isOver5Years(mother.date)) {
          await archiveDoc(mother);
        }
      } else {
        // Mother archived: archive eligible follow-ups (Completed & >5 yrs)
        const followUps = allData.filter((d) => getBaseDocumentIdInternal(d.id) === baseId && d.id !== baseId);

        const patches = followUps
          .filter((fu) => fu.status === 'Completed' && isOver5Years(fu.date))
          .map((fu) => archiveDoc(fu));
        if (patches.length) await Promise.all(patches);
      }
    } catch (err) {
      console.error('Auto-archive related docs failed:', err);
    }
  };

  // Handler for when a document is updated
  const handleUpdateDocument = (updatedFields) => {
    axios
      .patch(
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
        // Auto-archive related docs when status changed to Archived
        if (updatedFields.status === 'Archived') {
          autoArchiveRelated(selectedRow, updatedFields).then(() => fetchDocuments());
        } else {
          fetchDocuments();
        }
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
      await axios.patch(
        `http://127.0.0.1:8000/pdpms/manila-city-hall/documents/${docId}/`,
        {
          document_status: 'Archived',
        }
      );
      setSelectedRow(null);
      setShowArchiveNotif(true);
      fetchDocuments();
      setTimeout(() => setShowArchiveNotif(false), 3000);
    } catch (error) {
      console.error('Archive error:', error);
      console.error('📥 Server response:', error.response?.data);
      setValidation({
        isOpen: true,
        type: 'error',
        title: 'Archive Error',
        message:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          JSON.stringify(error.response?.data, null, 2) ||
          'Failed to archive document. Please try again.',
      });
    }
  };

  const handleAddFollowUp = async (formData) => {
    if (!addFollowUpDocId) {
      console.error('No document ID provided for follow-up');
      setValidation({
        isOpen: true,
        type: 'error',
        title: 'Follow-Up Error',
        message: 'No document ID provided. Please select a document and try again.',
      });
      return;
    }

    const updateId = addFollowUpDocId;
    const baseId = updateId.includes('-') ? updateId.split('-').slice(0, 4).join('-') : updateId;
    console.log('Document ID to update status:', updateId);
    console.log('Base document ID for follow-up:', baseId);

    const submissionData = new FormData();

    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return isNaN(d) ? '' : d.toISOString().split('T')[0];
    };

    console.log('FormData for follow-up:', {
      base_document_id: baseId,
      reference_code: formData.referenceCode,
      subject: formData.subject,
      document_type: formData.documentType,
      document_date: formData.date,
      date_received: formData.dateReceived,
      received_by: formData.receivedBy,
      document_status: formData.status,
      remarks: formData.remarks,
      pdf_file: formData.file,
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
      console.log('Sending POST request to create follow-up document');
      const response = await axios.post(
        'http://127.0.0.1:8000/pdpms/manila-city-hall/documents/',
        submissionData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      console.log('Created follow-up document ID:', response.data.document_id);

      // First, mark the document that was followed-up (could be mother or an earlier follow-up)
      console.log(`Attempting to update document ${updateId} to Completed`);
      try {
        const updateResponse = await axios.patch(
          `http://127.0.0.1:8000/pdpms/manila-city-hall/documents/${updateId}/`,
          {
            document_status: 'Completed',
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
        console.log(`Document ${updateId} status updated successfully:`, updateResponse.data);
      } catch (updateError) {
        console.error('Failed to update document status:', updateError);
        console.error('Update error response:', updateError.response?.data || updateError.message);
        setValidation({
          isOpen: true,
          type: 'warning',
          title: 'Partial Success',
          message: `Follow-up document created, but failed to update document status: ${
            updateError.response?.data?.detail || updateError.response?.data?.message || updateError.message
          }`,
        });
      }

      // -----------------------------------------------------------------------
      // NEW LOGIC: Auto-complete ALL existing documents under the same mother
      // -----------------------------------------------------------------------
      try {
        // Identify documents that share the same base ID and are NOT the newly
        // created follow-up document. These include the mother document and any
        // earlier follow-ups.
        const docsToAutoComplete = allData.filter(
          (doc) => getBaseDocumentId(doc.id) === baseId &&
            doc.id !== response.data.document_id &&
            doc.status !== 'Completed'
        );

        if (docsToAutoComplete.length > 0) {
          console.log('Auto-completing related documents:', docsToAutoComplete.map(d => d.id));

          await Promise.all(
            docsToAutoComplete.map((doc) =>
              axios.patch(
                `http://127.0.0.1:8000/pdpms/manila-city-hall/documents/${doc.id}/`,
                { document_status: 'Completed' },
                { headers: { 'Content-Type': 'application/json' } }
              )
            )
          );
        }
      } catch (autoCompleteErr) {
        console.error('Error auto-completing related documents:', autoCompleteErr);
        // Do not block user flow; just log warning.
      }

      setTimeout(() => {
        console.log('Refreshing documents after follow-up creation');
        fetchDocuments();
      }, 1000);

      setShowFollowUpNotif(true);
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
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  // Handle dropdown toggle for follow-up documents
  const toggleRowExpansion = (rowId, event) => {
    event.stopPropagation();
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  // Extract base document ID (without extension)
  const getBaseDocumentId = (documentId) => {
    if (!documentId) return '';
    const parts = documentId.split('-');
    if (parts.length >= 5) {
      return parts.slice(0, 4).join('-');
    }
    return documentId;
  };

  // Extract extension from document ID
  const getDocumentExtension = (documentId) => {
    if (!documentId) return '';
    const parts = documentId.split('-');
    return parts.length >= 5 ? parts[parts.length - 1] : '';
  };

  // Group documents by base ID and separate mother documents from follow-ups
  const groupDocuments = (documents) => {
    const grouped = {};
    const motherDocuments = [];

    documents.forEach((doc) => {
      const baseId = getBaseDocumentId(doc.id);
      const extension = getDocumentExtension(doc.id);

      if (!grouped[baseId]) {
        grouped[baseId] = {
          mother: null,
          followUps: [],
        };
      }

      if (!extension || extension === '0000') {
        grouped[baseId].mother = doc;
        motherDocuments.push(doc);
      } else {
        grouped[baseId].followUps.push(doc);
      }
    });

    Object.keys(grouped).forEach((baseId) => {
      grouped[baseId].followUps.sort((a, b) => {
        const extA = getDocumentExtension(a.id);
        const extB = getDocumentExtension(b.id);
        return extA.localeCompare(extB);
      });
    });

    return { grouped, motherDocuments };
  };

  // Get follow-up documents for a specific document
  const getFollowUpDocuments = (documentId) => {
    const baseId = getBaseDocumentId(documentId);
    const { grouped } = groupDocuments(data);
    return grouped[baseId]?.followUps || [];
  };

  // Get mother documents for pagination (only count mother documents, not follow-ups)
  const { motherDocuments } = groupDocuments(data);
  const totalPages = Math.ceil(motherDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMotherDocuments = motherDocuments.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setExpandedRows(new Set()); // Clear expanded rows when changing pages
  };

  // Generate page numbers - always show 1-10, disable non-existent pages
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 10;
    
    // Always show pages 1-10
    for (let i = 1; i <= maxVisiblePages; i++) {
      pages.push({
        pageNum: i,
        isDisabled: i > totalPages
      });
    }
    
    return pages;
  };

  return (
    <div className="Public-Document-Container">
      <AddDocumentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddDocument}
        username={username}
      />
      {showAddNotif && (
        <div className="PublicDocument-EditNotificationOverlay">
          <div
            className="PublicDocument-EditNotification"
            style={{ flexDirection: 'row', gap: '0.6rem', alignItems: 'center', padding: '1rem 1.5rem' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', marginRight: '0.4rem' }}>
              <svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="20" rx="2" stroke="#000000" strokeWidth="2" fill="none" />
                <rect x="7" y="8" width="10" height="2" rx="1" fill="#000000" />
                <rect x="7" y="13" width="7" height="2" rx="1" fill="#000000" />
                <rect x="7" y="18" width="5" height="2" rx="1" fill="#000000" />
              </svg>
            </span>
            <span style={{ fontSize: '0.97rem', color: '#000000', fontWeight: 500 }}>
              New Public Document Has Been Added.
            </span>
          </div>
        </div>
      )}

      {showUpdateNotif && (
        <div className="PublicDocument-EditNotificationOverlay">
          <div
            className="PublicDocument-EditNotification"
            style={{ flexDirection: 'row', gap: '0.6rem', alignItems: 'center', padding: '1rem 1.5rem' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', marginRight: '0.4rem' }}>
              <svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="20" rx="2" stroke="#000000" strokeWidth="2" fill="none" />
                <rect x="7" y="8" width="10" height="2" rx="1" fill="#000000" />
                <rect x="7" y="13" width="7" height="2" rx="1" fill="#000000" />
                <rect x="7" y="18" width="5" height="2" rx="1" fill="#000000" />
              </svg>
            </span>
            <span style={{ fontSize: '0.97rem', color: '#000000', fontWeight: 500 }}>
              Public Document Has Been Updated.
            </span>
          </div>
        </div>
      )}

      {showArchiveNotif && (
        <div className="PublicDocument-EditNotificationOverlay">
          <div
            className="PublicDocument-EditNotification"
            style={{ flexDirection: 'row', gap: '0.6rem', alignItems: 'center', padding: '1rem 1.5rem' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', marginRight: '0.4rem' }}>
              <svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="20" rx="2" stroke="#000000" strokeWidth="2" fill="none" />
                <rect x="7" y="8" width="10" height="2" rx="1" fill="#000000" />
                <rect x="7" y="13" width="7" height="2" rx="1" fill="#000000" />
                <rect x="7" y="18" width="5" height="2" rx="1" fill="#000000" />
              </svg>
            </span>
            <span style={{ fontSize: '0.97rem', color: '#000000', fontWeight: 500 }}>
              Document Has Been Moved to Archived.
            </span>
          </div>
        </div>
      )}

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
      <div className="PublicDocument-TableContainer" style={{ position: 'relative' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Loading...</div>
        ) : (
          <table className="PublicDocument-Table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}></th>
                <th>Document ID</th>
                <th>Reference Code</th>
                <th>Subject/Description</th>
                <th
                   style={{ position: 'sticky', top: 0, cursor: 'pointer', background: '#f6f8fa', zIndex: 2 }}
                   onClick={(e) => {
                     e.stopPropagation();
                     setShowTypeFilter((prev) => !prev);
                   }}
                 >
                   <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                     Document Type
                     <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <path d="M1 1L5 5L9 1" stroke="#223354" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                     </svg>
                   </span>
                   {showTypeFilter && (
                     <div
                       style={{
                         position: 'absolute',
                         top: '100%',
                         left: 0,
                         zIndex: 9999,
                         backgroundColor: 'white',
                         boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                         width: 'max-content',
                         minWidth: '160px',
                         borderRadius: '4px',
                         maxHeight: '200px',
                         overflowY: 'auto',
                       }}
                       onClick={(e) => e.stopPropagation()}
                     >
                       <div
                         style={{
                           padding: '8px 12px',
                           cursor: 'pointer',
                           background: documentTypeFilter === '' ? '#e8e8e8' : 'transparent',
                         }}
                         onClick={() => {
                           setDocumentTypeFilter('');
                           setShowTypeFilter(false);
                         }}
                       >
                         All Types
                       </div>
                       {documentTypes.map((type) => (
                         <div
                           key={type}
                           style={{
                             padding: '8px 12px',
                             cursor: 'pointer',
                             background: documentTypeFilter === type ? '#e8e8e8' : 'transparent',
                           }}
                           onClick={() => {
                             setDocumentTypeFilter(type);
                             setShowTypeFilter(false);
                           }}
                         >
                           {type}
                         </div>
                       ))}
                     </div>
                   )}
                 </th>
                <th
                  style={{ position: 'sticky', top: 0, cursor: 'pointer', background: '#f6f8fa', zIndex: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDocDateFilter((prev) => !prev);
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Date
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="#223354" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {showDocDateFilter && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        zIndex: 9999,
                        backgroundColor: 'white',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        width: 'max-content',
                        minWidth: '160px',
                        borderRadius: '4px',
                      }}
                    >
                      <input
                        ref={docInputRef}
                        type="date"
                        value={docDateFilter}
                        onChange={(e) => setDocDateFilter(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={() => setShowDocDateFilter(false)}
                        style={{ position: 'absolute', opacity: 0, width: '0', height: '0', pointerEvents: 'none' }}
                      />
                    </div>
                  )}
                </th>
                <th
                  style={{ position: 'sticky', top: 0, cursor: 'pointer', background: '#f6f8fa', zIndex: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReceivedDateFilter((prev) => !prev);
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Date Received
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="#223354" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {showReceivedDateFilter && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        zIndex: 9999,
                        backgroundColor: 'white',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        width: 'max-content',
                        minWidth: '160px',
                        borderRadius: '4px',
                      }}
                    >
                      <input
                        ref={receivedInputRef}
                        type="date"
                        value={receivedDateFilter}
                        onChange={(e) => setReceivedDateFilter(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={() => setShowReceivedDateFilter(false)}
                        style={{ position: 'absolute', opacity: 0, width: '0', height: '0', pointerEvents: 'none' }}
                      />
                    </div>
                  )}
                </th>
                <th>Received By</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                return paginatedMotherDocuments.map((row, i) => {
                  const followUps = getFollowUpDocuments(row.id);
                  const isExpanded = expandedRows.has(row.id);
                  const rows = [
                  <tr
                    key={row.id + i}
                    onClick={
                      activeTab === 'all'
                        ? () => setSelectedRow(row)
                        : activeTab === 'archiving'
                        ? () => setSelectedRow(row)
                        : undefined
                    }
                  >
                    <td style={{ width: '40px', textAlign: 'center', padding: '8px' }}>
                      <button
                        onClick={(e) => toggleRowExpansion(row.id, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '3px',
                          transition: 'background-color 0.2s',
                          opacity: followUps.length > 0 ? 1 : 0.3,
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = '#f0f0f0')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                        title={followUps.length > 0 ? `View ${followUps.length} follow-up document(s)` : 'No follow-up documents'}
                        disabled={followUps.length === 0}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                          }}
                        >
                          <path
                            d="M4 2L8 6L4 10"
                            stroke={followUps.length > 0 ? '#666' : '#ccc'}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </td>
                    <td>{row.id}</td>
                    <td>{row.ref}</td>
                    <td className="subject-cell" style={{ textAlign: 'justify' }}>
                      {insertNewlines(row.subject)}
                    </td>
                    <td>{row.type}</td>
                    <td>{row.date}</td>
                    <td>{row.received}</td>
                    <td className="receivedby-cell">{insertNewlines(row.receivedBy, true)}</td>
                    <td>{row.status}</td>
                    <td className="remarks-cell" style={{ textAlign: 'justify' }}>
                      {insertNewlines(row.remarks)}
                    </td>
                    <td>
                      {row.file && row.file !== '#' ? (
                        <>
                          {console.log('Rendering link for:', row.id, row.file)}
                          <button
                            className="PublicDocument-PDFLink"
                            onClick={(e) => {
                              e.stopPropagation();
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
                  ];

                  if (isExpanded && followUps.length > 0) {
                    followUps.forEach((followUp, followUpIndex) => {
                      rows.push(
                    <tr
                      key={`${row.id}-followup-${followUpIndex}`}
                      style={{ backgroundColor: '#f8f9fa' }}
                      onClick={
                        activeTab === 'all'
                          ? () => setSelectedRow(followUp)
                          : activeTab === 'archiving'
                          ? () => setSelectedRow(followUp)
                          : undefined
                      }
                    >
                      <td style={{ width: '40px', textAlign: 'center', padding: '8px' }}>
                        <div
                          style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: '#666',
                            borderRadius: '50%',
                            margin: '0 auto',
                            position: 'relative',
                          }}
                        ></div>
                      </td>
                      <td style={{ paddingLeft: '20px', fontStyle: 'italic', color: '#666' }}>
                        {followUp.id}
                      </td>
                      <td style={{ color: '#666' }}>{followUp.ref}</td>
                      <td className="subject-cell" style={{ textAlign: 'justify', color: '#666' }}>
                        {insertNewlines(followUp.subject)}
                      </td>
                      <td style={{ color: '#666' }}>{followUp.type}</td>
                      <td style={{ color: '#666' }}>{followUp.date}</td>
                      <td style={{ color: '#666' }}>{followUp.received}</td>
                      <td className="receivedby-cell" style={{ color: '#666' }}>
                        {insertNewlines(followUp.receivedBy, true)}
                      </td>
                      <td style={{ color: '#666' }}>{followUp.status}</td>
                      <td className="remarks-cell" style={{ textAlign: 'justify', color: '#666' }}>
                        {insertNewlines(followUp.remarks)}
                      </td>
                      <td>
                        {followUp.file && followUp.file !== '#' ? (
                          <>
                            <button
                              className="PublicDocument-PDFLink"
                              onClick={(e) => {
                                e.stopPropagation();
                                try {
                                  window.open(followUp.file, '_blank', 'noopener,noreferrer');
                                } catch (e) {
                                  console.error('Failed to open PDF:', e, followUp.file);
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
                      );
                    });
                  }

                  return rows;
                }).flat();
              })()}
            </tbody>
          </table>
        )}
        {activeTab === 'all' && selectedRow && !editModalOpen && selectedRow.status !== 'Archived' && (
          <div className="PublicDocument-EditNotificationOverlay" style={{ zIndex: 2100 }}>
            <div className="PublicDocument-EditNotification">
              <button
                className="PublicDocument-EditNotification-Close"
                onClick={() => setSelectedRow(null)}
                title="Close"
              >
                ×
              </button>
              <div
                className="PublicDocument-EditNotification-Title"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem' }}
              >
                <span>Manage Document</span>
                <b style={{ color: '#000000', fontWeight: 500 }}>{selectedRow.id}?</b>
              </div>
              <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center' }}>
                <button
                  className="PublicDocument-EditNotification-EditBtn"
                  onClick={() => {
                    setEditModalOpen(true);
                    setSelectedRow(selectedRow);
                    setShowAddNotif(false);
                    setShowUpdateNotif(false);
                  }}
                >
                  EDIT
                </button>
                <button
                  className="PublicDocument-EditNotification-EditBtn"
                  onClick={() => {
                    const docId = selectedRow.id;
                    console.log('Setting docId for follow-up:', docId);
                    setAddFollowUpDocId(docId);
                    setSelectedRow(null);
                    setAddFollowUpModalOpen(true);
                  }}
                >
                  ADD FOLLOW-UP
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'all' && editModalOpen && (
          <EditDocumentModal
            open={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedRow(null);
            }}
            doc={selectedRow}
            onUpdate={handleUpdateDocument}
            username={username}
          />
        )}
        {activeTab === 'archiving' && selectedRow && (
          <div className="PublicDocument-EditNotificationOverlay">
            <div className="PublicDocument-EditNotification">
              <button
                className="PublicDocument-EditNotification-Close"
                onClick={() => setSelectedRow(null)}
                title="Close"
              >
                ×
              </button>
              <div className="PublicDocument-EditNotification-Title">
                Archive Document<br />
                <b style={{ color: '#000000', fontWeight: 500 }}>{selectedRow.id}</b>?
              </div>
              <button
                className="PublicDocument-ArchiveBtn"
                onClick={() => {
                  handleArchiveDocument(selectedRow.id);
                }}
              >
                ARCHIVE
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Add Document Button */}
      <div className="PublicDocument-AddBtnContainer">
        <button
          className="PublicDocument-AddBtn"
          onClick={() => {
            closeAll();
            setModalOpen(true);
          }}
        >
          ADD DOCUMENT
        </button>
      </div>
      
      {/* Custom Pagination */}
      {(
        <div className="PublicDocument-PaginationContainer">
          <div className="PublicDocument-PaginationWrapper">
            {/* Horizontal pagination row: Back → Pages 1-10 → Next */}
            <div className="PublicDocument-PaginationRow">
              {/* Back Button */}
              <button
                className="PublicDocument-PaginationBackBtn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
                Back
              </button>
              
              
              {/* Page Numbers 1-10 */}
              {getPageNumbers().map(({ pageNum, isDisabled }) => (
                <button
                  key={pageNum}
                  className={`PublicDocument-PaginationNumBtn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => !isDisabled && handlePageChange(pageNum)}
                  disabled={isDisabled}
                >
                  {pageNum}
                </button>
              ))}
              
              {/* Next Button */}
              <button
                className="PublicDocument-PaginationNextBtn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
            </div>
            
            {/* Page info below pagination */}
            <div className="PublicDocument-PaginationInfo">
              Showing page {currentPage} of {totalPages} ({motherDocuments.length} total documents)
            </div>
          </div>
        </div>
      )}
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
        username={username}
      />

      {showFollowUpNotif && (
        <div className="PublicDocument-EditNotificationOverlay">
          <div
            className="PublicDocument-EditNotification"
            style={{ flexDirection: 'row', gap: '0.6rem', alignItems: 'center', padding: '1rem 1.5rem' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', marginRight: '0.4rem' }}>
              <svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="20" rx="2" stroke="#000000" strokeWidth="2" fill="none" />
                <rect x="7" y="8" width="10" height="2" rx="1" fill="#000000" />
                <rect x="7" y="13" width="7" height="2" rx="1" fill="#000000" />
                <rect x="7" y="18" width="5" height="2" rx="1" fill="#000000" />
              </svg>
            </span>
            <span style={{ fontSize: '0.97rem', color: '#000000', fontWeight: 500 }}>
              Follow-Up Document Has Been Added.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}