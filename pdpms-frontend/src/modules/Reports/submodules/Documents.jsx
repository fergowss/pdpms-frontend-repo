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

  // Fetch data for all tabs on mount
  useEffect(() => {
    setIsLoading(true);
    Promise.all(
      TABS.map(tab => axios.get(API_ENDPOINTS[tab]))
    )
      .then(([ongoingRes, completedRes, archivedRes]) => {
        setData({
          'On Going': ongoingRes.data || [],
          'Completed': completedRes.data || [],
          'Archived': archivedRes.data || [],
        });
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
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
                    <tr key={row.id || row.document_id || i}>
                      <td>{row.id || row.document_id}</td>
                      <td>{row.ref || row.reference_code}</td>
                      <td>{row.subject}</td>
                      <td>{row.type || row.document_type}</td>
                      <td>{row.date || row.document_date}</td>
                      <td>{row.received || row.date_received}</td>
                      <td>{row.by || row.received_by}</td>
                      <td>{row.status || row.document_status}</td>
                      <td>{row.remarks}</td>
                      <td><a href={row.file_url || "#"} style={{ color: '#2951a3', fontWeight: 500, textDecoration: 'underline' }}>{row.file || "View PDF"}</a></td>
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

