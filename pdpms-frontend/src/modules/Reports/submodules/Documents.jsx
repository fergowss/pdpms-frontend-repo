import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Documents.css';

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
                  <th>Document ID</th>
                  <th>Reference Code</th>
                  <th>Subject</th>
                  <th>Document Type</th>
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
                    <td colSpan={10} style={{ textAlign: 'center', color: '#888' }}>No records found.</td>
                  </tr>
                ) : (
                  filteredData.map((row, i) => (
                    <tr key={row.id || i}>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}