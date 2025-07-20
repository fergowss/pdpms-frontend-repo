import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Properties.css';
import './Properties_pagination.css';

const TABS = ['Serviceable', 'Unserviceable', 'For Repair', 'Condemned'];
const API_URLS = {
  Serviceable: 'http://127.0.0.1:8000/pdpms/manila-city-hall/serviceable-properties/',
  Unserviceable: 'http://127.0.0.1:8000/pdpms/manila-city-hall/unserviceable-properties/',
  'For Repair': 'http://127.0.0.1:8000/pdpms/manila-city-hall/for-repair-properties/',
  Condemned: 'http://127.0.0.1:8000/pdpms/manila-city-hall/condemned-properties/',
};

export default function Properties() {
  const [activeTab, setActiveTab] = useState('Serviceable');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [data, setData] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllPages, setShowAllPages] = useState(false);
  const itemsPerPage = 100;
  const [error, setError] = useState(null);
  // Date Acquired filter states
  const [dateAcquiredFilter, setDateAcquiredFilter] = useState('');
  const [showDateAcquiredFilter, setShowDateAcquiredFilter] = useState(false);
  const [datePickerPos, setDatePickerPos] = useState({ top: 0, left: 0 });
  const dateInputRef = useRef(null);



  // Dropdown functionality from AssetProperty
  const [employees, setEmployees] = useState([]);
  const [documents, setDocuments] = useState([]);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // auto-open native picker when input appears
  useEffect(() => {
    if (showDateAcquiredFilter && dateInputRef.current) {
      dateInputRef.current.focus();
      if (dateInputRef.current.showPicker) dateInputRef.current.showPicker();
    }
  }, [showDateAcquiredFilter]);

  // Fetch employees and documents for dropdown functionality
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/pdpms/manila-city-hall/employees/');
        const employeeData = Array.isArray(response.data) ? response.data : [];
        const normalizedEmployees = employeeData.reduce((acc, emp) => {
          const employee = {
            id: emp.employee_id,
            name: `${emp.first_name} ${emp.last_name}`,
            department: emp.department || ''
          };
          if (!acc.some(e => e.id === employee.id)) {
            acc.push(employee);
          }
          return acc;
        }, []);
        setEmployees(normalizedEmployees);
      } catch (err) {
        console.error('Failed to fetch employees:', err);
      }
    };

    const fetchDocuments = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/pdpms/manila-city-hall/documents/');
        const docData = Array.isArray(response.data) ? response.data : [];
        const propertyDocs = docData
          .filter(doc => doc.document_type === 'Property Records')
          .map(doc => doc.document_id)
          .filter((id, index, arr) => arr.indexOf(id) === index);
        setDocuments(propertyDocs);
      } catch (err) {
        console.error('Failed to fetch documents:', err);
      }
    };

    fetchEmployees();
    fetchDocuments();
  }, []);

  // Utility: insert newlines after every `wordsPerLine` words (default 10)
  const insertNewlines = (text, wordsPerLine = 10) => {
    if (!text) return '';
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const lines = [];
    for (let i = 0; i < words.length; i += wordsPerLine) {
      lines.push(words.slice(i, i + wordsPerLine).join(' '));
    }
    return lines.join('\n');
  };

  // Helper function to sort data by date acquired in descending order
  const sortByDateDescending = (dataArray) => {
    return dataArray.sort((a, b) => {
      const dateA = new Date(a.dateAcquired || '1900-01-01');
      const dateB = new Date(b.dateAcquired || '1900-01-01');
      return dateB - dateA;
    });
  };

  // Fetch data when activeTab changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(API_URLS[activeTab]);
        const result = response.data;
        // Map API data to match component's expected field names
        const mappedData = result.map(item => ({
          propertyNo: item.property_no,
          documentNo: item.document_id,
          parNo: item.par_no,
          description: item.description,
          serialNo: item.serial_no,
          dateAcquired: item.date_acquired,
          unitCost: item.unit_cost,
          endUser: item.end_user,
          estimatedLifeUse: item.estimated_life_use,
          status: item.property_status,
          remarks: item.remarks,
        }));
        setData(sortByDateDescending(mappedData));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

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

  // Handle dropdown toggle for follow-up documents
  const toggleRowExpansion = (rowId, event) => {
    event.stopPropagation(); // Prevent any other row interactions
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  // Document grouping functionality from AssetProperty
  const isMotherDocument = (docId) => {
    if (!docId) return false;
    const parts = docId.split('-');
    // Mother document: no increment suffix (last part is not a number)
    return parts.length >= 4 ? !/^\d+$/.test(parts[parts.length - 1]) : true;
  };

  const getMotherDocumentId = (docId) => {
    if (!docId) return '';
    const parts = docId.split('-');
    // If it has increment suffix, remove it to get mother document
    if (parts.length >= 4 && /^\d+$/.test(parts[parts.length - 1])) {
      return parts.slice(0, -1).join('-');
    }
    return docId; // Already a mother document
  };

  const getFollowUpDocuments = (motherDocId) => {
    if (!motherDocId) return [];
    // Find all documents that start with the mother document ID and have extensions
    return data.filter(item => {
      if (!item.documentNo) return false;
      const itemMotherDoc = getMotherDocumentId(item.documentNo);
      return itemMotherDoc === motherDocId && !isMotherDocument(item.documentNo);
    });
  };

  // Filter data based on active tab, date acquired filter, and search keyword
  const filteredData = data.filter(item => {
    const matchesTab = item.status === activeTab;
    const matchesDate = dateAcquiredFilter ? item.dateAcquired === dateAcquiredFilter : true;
    if (!searchKeyword) return matchesTab && matchesDate;

    return matchesTab && matchesDate && Object.values(item).some(
      value => value && value.toString().toLowerCase().includes(searchKeyword.toLowerCase())
    );
  });



  // Group data by mother documents
  const groupedData = filteredData.reduce((acc, item) => {
    const motherDocId = getMotherDocumentId(item.documentNo);
    if (isMotherDocument(item.documentNo)) {
      // This is a mother document
      if (!acc[motherDocId]) {
        acc[motherDocId] = {
          mother: item,
          followUps: []
        };
      } else {
        acc[motherDocId].mother = item;
      }
    } else {
      // This is a follow-up document
      if (!acc[motherDocId]) {
        acc[motherDocId] = {
          mother: null,
          followUps: []
        };
      }
      acc[motherDocId].followUps.push(item);
    }
    return acc;
  }, {});

  // Convert grouped data to array for rendering
  const displayData = Object.values(groupedData).filter(group => group.mother).map(group => ({
    ...group.mother,
    hasFollowUps: group.followUps.length > 0,
    followUpCount: group.followUps.length
  }));

  // ---------------- Pagination Logic ----------------
  const motherDocumentsAll = displayData;
  const totalPages = Math.max(1, Math.ceil(motherDocumentsAll.length / itemsPerPage));
  const paginatedMotherDocuments = showAllPages
    ? motherDocumentsAll
    : motherDocumentsAll.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 when filters or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, dateAcquiredFilter, activeTab]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setExpandedRows(new Set());
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= 10; i++) {
      pages.push({ pageNum: i, isDisabled: i > totalPages });
    }
    return pages;
  };
  // --------------------------------------------------



  const getFollowUpDocumentsForRow = (documentNo) => {
    const motherDocId = getMotherDocumentId(documentNo);
    const group = groupedData[motherDocId];
    return group ? group.followUps : [];
  };

  return (
    <div className="Properties-Container">
      <div className="Properties">
        <div className="Properties-TopRow">
          <div className="Properties-Tabs">
            {TABS.map(tab => (
              <div
                key={tab}
                className={`Properties-Tab${activeTab === tab ? ' Properties-Tab--active' : ''}`}
                onClick={() => handleTabChange(tab)}
              >
                {tab}
              </div>
            ))}
          </div>
          <div className="Properties-SearchBarRow">
            <input 
              className="Properties-SearchBar" 
              placeholder="Enter Keyword" 
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="Properties-TableWrapper">
          {isLoading ? (
            <div style={{textAlign: 'center', padding: '2rem', color: '#888'}}>Loading...</div>
          ) : (
            <table className="Properties-Table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}></th>
                  <th>Property No.</th>
                  <th>Document No.</th>
                  <th>PAR No.</th>
                  <th>Description</th>
                  <th>Serial No.</th>
                  <th style={{ position: 'sticky', top: 0, cursor: 'pointer', background: '#f6f8fa', zIndex: 2 }} onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setDatePickerPos({ top: rect.bottom + 2, left: rect.left });
                      setShowDateAcquiredFilter(prev => !prev);
                    }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      Date Acquired
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="#223354" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    {showDateAcquiredFilter && (
                      <div style={{ position: 'fixed', top: datePickerPos.top, left: datePickerPos.left, zIndex: 9999, backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: 'max-content', minWidth: '160px', borderRadius: '4px' }}>
                        <input
                          ref={dateInputRef}
                          type="date"
                          value={dateAcquiredFilter}
                          onChange={(e) => setDateAcquiredFilter(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onBlur={() => setShowDateAcquiredFilter(false)}
                          style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                        />
                      </div>
                    )}
                  </th>
                  <th>Unit Cost</th>
                  <th>End User</th>
                  <th>Estimated Life Use</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={12} style={{ textAlign: 'center', color: '#888' }}>
                      No records found.
                    </td>
                  </tr>
                ) : (
                  paginatedMotherDocuments.map((row, i) => (
                    <React.Fragment key={i}>
                      <tr>
                        <td style={{ width: '40px', textAlign: 'center', padding: '8px' }}>
                          <button
                            onClick={(e) => toggleRowExpansion(row.propertyNo, e)}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            title={row.hasFollowUps ? `View ${row.followUpCount} follow-up document(s)` : "No follow-up documents"}
                            disabled={!row.hasFollowUps}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: row.hasFollowUps ? 'pointer' : 'not-allowed',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '3px',
                              transition: 'background-color 0.2s',
                              opacity: row.hasFollowUps ? 1 : 0.3
                            }}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              style={{
                                transform: expandedRows.has(row.propertyNo) ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease'
                              }}
                            >
                              <path
                                d="M4 2L8 6L4 10"
                                stroke="#666"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </td>
                        <td>{row.propertyNo}</td>
                        <td>{row.documentNo}</td>
                        <td>{row.parNo}</td>
                        <td className="description-cell" style={{ textAlign: 'justify' }}>{insertNewlines(row.description)}</td>
                        <td className="serial-no-cell" style={{ textAlign: 'justify' }}>{insertNewlines(row.serialNo, 7)}</td>
                        <td>{row.dateAcquired}</td>
                        <td>{row.unitCost}</td>
                        <td>{row.endUser}</td>
                        <td>{row.estimatedLifeUse}</td>
                        <td>{row.status}</td>
                        <td className="remarks-cell" style={{ textAlign: 'justify' }}>{insertNewlines(row.remarks)}</td>
                      </tr>
                      {/* Show follow-up/transferred documents when expanded */}
                      {expandedRows.has(row.propertyNo) && getFollowUpDocumentsForRow(row.documentNo).map((followUpDoc, followUpIndex) => (
                        <tr key={`${i}-followup-${followUpIndex}`} style={{ backgroundColor: '#f8f9fa' }}>
                          <td style={{ width: '40px', textAlign: 'center', padding: '8px' }}>
                            <div style={{
                              width: '6px',
                              height: '6px',
                              backgroundColor: '#666',
                              borderRadius: '50%',
                              margin: '0 auto',
                              position: 'relative'
                            }}></div>
                          </td>
                          <td style={{ paddingLeft: '20px', fontStyle: 'italic', color: '#666' }}>{followUpDoc.propertyNo}</td>
                          <td style={{ color: '#666' }}>{followUpDoc.documentNo}</td>
                          <td style={{ color: '#666' }}>{followUpDoc.parNo}</td>
                          <td className="description-cell" style={{ textAlign: 'justify', color: '#666' }}>{insertNewlines(followUpDoc.description)}</td>
                          <td className="serial-no-cell" style={{ textAlign: 'justify', color: '#666' }}>{insertNewlines(followUpDoc.serialNo, 7)}</td>
                          <td style={{ color: '#666' }}>{followUpDoc.dateAcquired}</td>
                          <td style={{ color: '#666' }}>{followUpDoc.unitCost}</td>
                          <td style={{ color: '#666' }}>{followUpDoc.endUser}</td>
                          <td style={{ color: '#666' }}>{followUpDoc.estimatedLifeUse}</td>
                          <td style={{ color: '#666' }}>{followUpDoc.status}</td>
                          <td className="remarks-cell" style={{ textAlign: 'justify', color: '#666' }}>{insertNewlines(followUpDoc.remarks)}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        {/* Custom Pagination */}
        <div className="Properties-PaginationContainer">
          <div className="Properties-PaginationWrapper">
            <div className="Properties-PaginationRow">
              {/* Back Button */}
              <button
                className="Properties-PaginationBackBtn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
                Back
              </button>
              {getPageNumbers().map(({ pageNum, isDisabled }) => (
                <button
                  key={pageNum}
                  className={`Properties-PaginationNumBtn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => !isDisabled && handlePageChange(pageNum)}
                  disabled={isDisabled}
                >
                  {pageNum}
                </button>
              ))}
              <button
                className="Properties-PaginationNextBtn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
            </div>
            <div className="Properties-PaginationInfo">
              Showing page {currentPage} of {totalPages} ({motherDocumentsAll.length} total properties)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}