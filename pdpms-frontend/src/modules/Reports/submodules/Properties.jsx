import { useState, useEffect } from 'react';
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
        setData(mappedData);
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

  // Filter data based on active tab and search keyword
  const filteredData = data.filter(item => {
    const matchesTab = item.status === activeTab;
    if (!searchKeyword) return matchesTab;
    
    return matchesTab && Object.values(item).some(
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
                  <th>Date Acquired</th>
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
                      <td>{row.description}</td>
                      <td>{row.serialNo}</td>
                      <td>{row.dateAcquired}</td>
                      <td>{row.unitCost}</td>
                      <td>{row.endUser}</td>
                      <td>{row.estimatedLifeUse}</td>
                      <td>{row.status}</td>
                      <td>{row.remarks}</td>
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