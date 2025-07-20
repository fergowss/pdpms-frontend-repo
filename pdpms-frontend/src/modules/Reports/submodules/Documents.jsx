import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Documents.css';
import './Documents_pagination.css';

const TABS = ['On Going', 'Completed', 'Archived'];
const API_ENDPOINTS = {
  'On Going': 'http://127.0.0.1:8000/pdpms/manila-city-hall/ongoing-documents/',
  'Completed': 'http://127.0.0.1:8000/pdpms/manila-city-hall/completed-documents/',
  'Archived': 'http://127.0.0.1:8000/pdpms/manila-city-hall/archived-documents/',
};

export default function Documents() {
  const [activeTab, setActiveTab] = useState('On Going');
  const [data, setData] = useState({
    'On Going': [],
    'Completed': [],
    'Archived': [],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllPages, setShowAllPages] = useState(false);
  const itemsPerPage = 100;

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

  // Extract unique document types for dropdown
  const documentTypes = React.useMemo(() => {
    // Flatten all tabs data for full list or use current tab only
    const all = Object.values(data).flat();
    return [...new Set(all.map((d) => d.type).filter((t) => t && t.trim() !== ''))];
  }, [data]);

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

  // Helper function to process fetched document items
  const processDocumentItem = (item) => {
    if (!item || typeof item !== 'object') return null;

    // Use document_id as primary key if available, fallback to id if the view returns it differently
    const id = item.document_id || item.id || ''; 
    if (!id) return null; // Ensure there's an ID

    // Construct the full PDF file URL similarly to PublicDocument
    let fileUrl = '#';
    if (item.pdf_file) {
      if (item.pdf_file.startsWith('http')) {
        fileUrl = item.pdf_file; // Use absolute URL as-is
      } else {
        fileUrl = `http://127.0.0.1:8000${item.pdf_file}`; // Prepend for relative URLs
      }
    }

    return {
      id: id,
      ref: item.reference_code || item.ref || '-',
      subject: item.subject || '',
      type: item.document_type || item.type || '',
      date: item.document_date || item.date || '',
      received: item.date_received || item.received || '',
      receivedBy: item.received_by || item.by || '',
      status: item.document_status || item.status || '',
      remarks: item.remarks || '',
      file: fileUrl, // This will be the prepared URL for the PDF
    };
  };

  // Helper function to sort data by date in descending order
  const sortByDateDescending = (dataArray) => {
    return dataArray.sort((a, b) => {
      const dateA = new Date(a.date || '1900-01-01');
      const dateB = new Date(b.date || '1900-01-01');
      return dateB - dateA;
    });
  };

  // Fetch data for all tabs on mount
  useEffect(() => {
    setIsLoading(true);
    Promise.all(
      TABS.map(tab => axios.get(API_ENDPOINTS[tab]))
    )
      .then(([ongoingRes, completedRes, archivedRes]) => {
        const ongoingData = Array.isArray(ongoingRes.data) ? ongoingRes.data.map(processDocumentItem).filter(Boolean) : [];
        const completedData = Array.isArray(completedRes.data) ? completedRes.data.map(processDocumentItem).filter(Boolean) : [];
        const archivedData = Array.isArray(archivedRes.data) ? archivedRes.data.map(processDocumentItem).filter(Boolean) : [];
        
        setData({
          'On Going': sortByDateDescending(ongoingData),
          'Completed': sortByDateDescending(completedData),
          'Archived': sortByDateDescending(archivedData),
        });
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching documents for Documents component:", error);
        setIsLoading(false);
        // Optionally add a user-facing error message here
      });
  }, []);

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
    const { grouped } = groupDocuments(filteredData);
    return grouped[baseId]?.followUps || [];
  };

  // Filter data according to active tab and search keyword
  let filteredData = data[activeTab] || [];
  
  if (searchKeyword) {
    filteredData = filteredData.filter(row => 
      Object.values(row).some(
        value => value && value.toString().toLowerCase().includes(searchKeyword.toLowerCase())
      )
    );
  }

  // Apply date filters if set
  if (docDateFilter) {
    console.log('Applying Document Date Filter:', docDateFilter);
    filteredData = filteredData.filter(row => {
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
    filteredData = filteredData.filter(row => {
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
    filteredData = filteredData.filter((row) => row.type === documentTypeFilter);
  }

  // ---------------- Pagination Logic ----------------
  const motherDocumentsAll = filteredData.filter(doc => {
    const extension = getDocumentExtension(doc.id);
    return !extension || extension === '0000';
  });

  const totalPages = Math.max(1, Math.ceil(motherDocumentsAll.length / itemsPerPage));
  const paginatedMotherDocuments = showAllPages
    ? motherDocumentsAll
    : motherDocumentsAll.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, docDateFilter, receivedDateFilter, documentTypeFilter, activeTab]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setExpandedRows(new Set()); // collapse any expanded rows
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= 10; i++) {
      pages.push({ pageNum: i, isDisabled: i > totalPages });
    }
    return pages;
  };
  // --------------------------------------------------

  return (
    <div className="Documents-Container">
      <div className="Documents">
        <div className="Documents-TopRow">
          <div className="Documents-Tabs">
            {TABS.map(tab => (
              <div
                key={tab}
                className={`Documents-Tab${activeTab === tab ? ' Documents-Tab--active' : ''}`}
                onClick={() => handleTabChange(tab)}
              >
                {tab}
              </div>
            ))}
          </div>
          <div className="Documents-SearchBarRow">
            <input 
              className="Documents-SearchBar" 
              placeholder="Enter Keyword"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="Documents-TableWrapper">
          {isLoading ? (
            <div style={{textAlign: 'center', padding: '2rem', color: '#888'}}>Loading...</div>
          ) : (
            <table className="Documents-Table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}></th>
                  <th>Document ID</th>
                  <th>Reference Code</th>
                  <th>Subject</th>
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
                  <th style={{ position: 'sticky', top: 0, cursor: 'pointer', background: '#f6f8fa', zIndex: 2 }} onClick={(e) => { e.stopPropagation(); setShowDocDateFilter(prev => !prev); }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      Date
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="#223354" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    {showDocDateFilter && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 9999, backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', width: 'max-content', minWidth: '160px', borderRadius: '4px' }}>
                        <input
                          ref={docInputRef}
                          type="date"
                          value={docDateFilter}
                          onChange={(e) => setDocDateFilter(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onBlur={() => setShowDocDateFilter(false)}
                          style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                        />
                      </div>
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
                      <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 9999, backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', width: 'max-content', minWidth: '160px', borderRadius: '4px' }}>
                        <input
                          ref={receivedInputRef}
                          type="date"
                          value={receivedDateFilter}
                          onChange={(e) => setReceivedDateFilter(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onBlur={() => setShowReceivedDateFilter(false)}
                          style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
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
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', color: '#888' }}>No records found.</td>
                  </tr>
                ) : (
                  (() => {
                    const { grouped } = groupDocuments(filteredData);
                    const motherDocuments = paginatedMotherDocuments;

                    return motherDocuments.map((row, i) => {
                      const followUps = getFollowUpDocuments(row.id);
                      const isExpanded = expandedRows.has(row.id);
                      const rows = [
                        <tr key={row.id || i}>
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
                          <td className="subject-cell" style={{ textAlign: 'justify' }}>{insertNewlines(row.subject)}</td>
                          <td>{row.type}</td>
                          <td>{row.date}</td>
                          <td>{row.received}</td>
                          <td className="receivedby-cell">{insertNewlines(row.receivedBy, true)}</td>
                          <td>{row.status}</td>
                          <td className="remarks-cell" style={{ textAlign: 'justify' }}>{insertNewlines(row.remarks)}</td>
                          <td>
                            {row.file === '#' ? (
                              <span style={{ color: '#888' }}>No file</span>
                            ) : (
                              <a
                                href={row.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#2a5db0', textDecoration: 'underline', fontWeight: 500 }}
                              >
                                View PDF
                              </a>
                            )}
                          </td>
                        </tr>,
                      ];

                      if (isExpanded && followUps.length > 0) {
                        followUps.forEach((followUp, followUpIndex) => {
                          rows.push(
                            <tr
                              key={`${row.id}-followup-${followUpIndex}`}
                              style={{ backgroundColor: '#f8f9fa' }}
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
                                {followUp.file === '#' ? (
                                  <span style={{ color: '#888' }}>No file</span>
                                ) : (
                                  <a
                                    href={followUp.file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#666', textDecoration: 'underline' }}
                                  >
                                    View PDF
                                  </a>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      }

                      return rows;
                    }).flat();
                  })()
                )}
              </tbody>
            </table>
          )}
        </div>
        {/* Custom Pagination */}
        <div className="Documents-PaginationContainer">
          <div className="Documents-PaginationWrapper">
            <div className="Documents-PaginationRow">
              {/* Back Button */}
              <button
                className="Documents-PaginationBackBtn"
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
                  className={`Documents-PaginationNumBtn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => !isDisabled && handlePageChange(pageNum)}
                  disabled={isDisabled}
                >
                  {pageNum}
                </button>
              ))}

              {/* Next Button */}
              <button
                className="Documents-PaginationNextBtn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
            </div>
            <div className="Documents-PaginationInfo">
              Showing page {currentPage} of {totalPages} ({motherDocumentsAll.length} total documents)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}