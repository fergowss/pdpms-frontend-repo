import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Properties.css';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Date Acquired filter states
  const [dateAcquiredFilter, setDateAcquiredFilter] = useState('');
  const [showDateAcquiredFilter, setShowDateAcquiredFilter] = useState(false);
  const [datePickerPos, setDatePickerPos] = useState({ top: 0, left: 0 });
  const dateInputRef = useRef(null);

  // auto-open native picker when input appears
  useEffect(() => {
    if (showDateAcquiredFilter && dateInputRef.current) {
      dateInputRef.current.focus();
      if (dateInputRef.current.showPicker) dateInputRef.current.showPicker();
    }
  }, [showDateAcquiredFilter]);

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

  // Filter data based on active tab, date acquired filter, and search keyword
  const filteredData = data.filter(item => {
    const matchesTab = item.status === activeTab;
    const matchesDate = dateAcquiredFilter ? item.dateAcquired === dateAcquiredFilter : true;
    if (!searchKeyword) return matchesTab && matchesDate;
    
    return matchesTab && matchesDate && Object.values(item).some(
      value => value && value.toString().toLowerCase().includes(searchKeyword.toLowerCase())
    );
  });

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
                    <td colSpan={11} style={{ textAlign: 'center', color: '#888' }}>
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, i) => (
                    <tr key={i}>
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