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

  // Utility function to insert newlines after every 10 words
  const insertNewlines = (text) => {
    if (!text) return '';
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const lines = [];
    for (let i = 0; i < words.length; i += 10) {
      lines.push(words.slice(i, i + 10).join(' '));
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

  // Fetch data for all tabs on mount
  useEffect(() => {
    setIsLoading(true);
    Promise.all(
      TABS.map(tab => axios.get(API_ENDPOINTS[tab]))
    )
      .then(([ongoingRes, completedRes, archivedRes]) => {
        setData({
          'On Going': Array.isArray(ongoingRes.data) ? ongoingRes.data.map(processDocumentItem).filter(Boolean) : [],
          'Completed': Array.isArray(completedRes.data) ? completedRes.data.map(processDocumentItem).filter(Boolean) : [],
          'Archived': Array.isArray(archivedRes.data) ? archivedRes.data.map(processDocumentItem).filter(Boolean) : [],
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
  const filteredData = (data[activeTab] || []).filter(row => {
    const matchesTab = row.status === activeTab; 
    
    if (!searchKeyword) return true;

    return Object.values(row).some(
      value => value && value.toString().toLowerCase().includes(searchKeyword.toLowerCase())
    );
  });

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
                  <th>Date</th>
                  <th>Date Received</th>
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
                    <tr key={row.id || i}> {/* Use row.id for key after processing */}
                      <td>{row.id}</td>
                      <td>{row.ref}</td>
                      <td className="subject-cell">{insertNewlines(row.subject)}</td>
                      <td>{row.type}</td>
                      <td>{row.date}</td>
                      <td>{row.received}</td>
                      <td>{row.receivedBy}</td>
                      <td>{row.status}</td>
                      <td className="remarks-cell">{insertNewlines(row.remarks)}</td>
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
