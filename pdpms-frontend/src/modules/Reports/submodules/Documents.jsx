import './Documents.css';

import React, { useState } from 'react';
import './Documents.css';

const ALL_DATA = [
  {
    id: 'PDID00000303',
    ref: 'ENDR000025',
    subject: 'Assistance Survey',
    type: 'Endorsement',
    date: '06/12/23',
    received: '02/14/25',
    by: 'June Castro',
    status: 'On Going',
    remarks: 'To be pass to DOLE',
    file: 'View PDF',
  },
  // Completed samples
  {
    id: 'PDID00000459',
    ref: 'MMRM000201',
    subject: 'Intern Application',
    type: 'Memorandum',
    date: '10/06/23',
    received: '05/12/25',
    by: 'June Castro',
    status: 'Completed',
    remarks: 'Must be presented to DILG in June 30, 2026',
    file: 'View PDF',
  },
  // Archived samples
  {
    id: 'PDID00000501',
    ref: 'ARCH000101',
    subject: 'Barangay Fiesta Permit',
    type: 'Permit',
    date: '02/15/22',
    received: '02/20/22',
    by: 'Ruth Villanueva',
    status: 'Archived',
    remarks: 'Archived after event',
    file: 'View PDF',
  },
  {
    id: 'PDID00000502',
    ref: 'ARCH000102',
    subject: 'Flood Relief Report',
    type: 'Report',
    date: '08/10/21',
    received: '08/12/21',
    by: 'Jessa Lim',
    status: 'Archived',
    remarks: 'Archived for reference',
    file: 'View PDF',
  },
  {
    id: 'PDID00000503',
    ref: 'ARCH000103',
    subject: 'Barangay Election Results',
    type: 'Certification',
    date: '05/10/22',
    received: '05/11/22',
    by: 'Alvin Ramos',
    status: 'Archived',
    remarks: 'Archived after election',
    file: 'View PDF',
  },
  {
    id: 'PDID00000305',
    ref: 'ENDR000027',
    subject: 'Barangay Clearance',
    type: 'Certification',
    date: '01/04/23',
    received: '03/04/25',
    by: 'Camila Alfonso',
    status: 'Completed',
    remarks: 'For signature of Brgy. Captain',
    file: 'View PDF',
  },
  {
    id: 'PDID00000307',
    ref: 'ENDR000029',
    subject: 'Barangay ID Application',
    type: 'Application',
    date: '01/06/23',
    received: '03/06/25',
    by: 'July Mendoza',
    status: 'Completed',
    remarks: 'To be sent to Office of the Mayor',
    file: 'View PDF',
  },
  {
    id: 'PDID00000309',
    ref: 'ENDR000031',
    subject: 'Scholarship Endorsement',
    type: 'Endorsement',
    date: '01/08/23',
    received: '03/08/25',
    by: 'June Castro',
    status: 'Completed',
    remarks: 'To be distributed to residents',
    file: 'View PDF',
  },
  {
    id: 'PDID00000311',
    ref: 'ENDR000033',
    subject: 'Business Permit Request',
    type: 'Request',
    date: '01/10/23',
    received: '03/10/25',
    by: 'June Castro',
    status: 'Completed',
    remarks: 'For review by committee',
    file: 'View PDF',
  },
  {
    id: 'PDID00000313',
    ref: 'ENDR000035',
    subject: 'Barangay Residency Certification',
    type: 'Certification',
    date: '01/12/23',
    received: '03/12/25',
    by: 'June Castro',
    status: 'Completed',
    remarks: 'To be archived',
    file: 'View PDF',
  },
  {
    id: 'PDID00000315',
    ref: 'ENDR000037',
    subject: 'Solo Parent ID Application',
    type: 'Application',
    date: '01/14/23',
    received: '03/14/25',
    by: 'June Castro',
    status: 'Completed',
    remarks: 'To be checked by secretary',
    file: 'View PDF',
  },
  {
    id: 'PDID00000317',
    ref: 'ENDR000039',
    subject: 'Medical Assistance',
    type: 'Assistance',
    date: '01/16/23',
    received: '03/16/25',
    by: 'June Castro',
    status: 'Completed',
    remarks: 'To be submitted to health office',
    file: 'View PDF',
  },
  {
    id: 'PDID00000319',
    ref: 'ENDR000041',
    subject: 'Travel Clearance',
    type: 'Clearance',
    date: '01/18/23',
    received: '03/18/25',
    by: 'June Castro',
    status: 'Completed',
    remarks: 'For travel abroad',
    file: 'View PDF',
  },
  {
    id: 'PDID00000321',
    ref: 'ENDR000043',
    subject: 'Barangay Business Clearance',
    type: 'Clearance',
    date: '01/20/23',
    received: '03/20/25',
    by: 'June Castro',
    status: 'Completed',
    remarks: 'To be renewed next year',
    file: 'View PDF',
  },
  {
    id: 'PDID00000323',
    ref: 'ENDR000045',
    subject: 'Permit to Construct',
    type: 'Permit',
    date: '01/22/23',
    received: '03/22/25',
    by: 'June Castro',
    status: 'Completed',
    remarks: 'To be signed by engineer',
    file: 'View PDF',
  }
];

const TABS = ['On Going', 'Completed', 'Archived'];

export default function Documents() {
  const [activeTab, setActiveTab] = useState('On Going');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

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

  // Filter data according to active tab and search keyword
  const filteredData = ALL_DATA.filter(row => {
    const matchesTab = row.status === activeTab;
    if (!searchKeyword) return matchesTab;
    
    return matchesTab && Object.values(row).some(
      value => value.toString().toLowerCase().includes(searchKeyword.toLowerCase())
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
                  <tr key={i}>
                    <td>{row.id}</td>
                    <td>{row.ref}</td>
                    <td>{row.subject}</td>
                    <td>{row.type}</td>
                    <td>{row.date}</td>
                    <td>{row.received}</td>
                    <td>{row.by}</td>
                    <td>{row.status}</td>
                    <td>{row.remarks}</td>
                    <td><a href="#" style={{ color: '#2951a3', fontWeight: 500, textDecoration: 'underline' }}>{row.file}</a></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

