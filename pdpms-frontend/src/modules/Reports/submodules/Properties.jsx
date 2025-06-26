import { useState } from 'react';
import './Properties.css';

const TABS = ['Serviceable', 'Unserviceable', 'For Repair', 'Condemned'];

export default function Properties() {
  const [activeTab, setActiveTab] = useState('Serviceable');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data
  const sampleData = [
    {
      propertyNo: 'EDP000905',
      documentNo: 'PDID00000303',
      parNo: 'PR0032045',
      description: 'Lenovo Laptop Version 1B',
      serialNo: 'SRLN0002991230000212',
      dateAcquired: '10/23/22',
      unitCost: '65,000.00',
      endUser: 'Camila Alonzo',
      estimatedLifeUse: '5 years',
      status: 'Serviceable',
      remarks: 'Good condition'
    }
  ];

  // This would be replaced with actual data fetching
  const filteredData = sampleData;

  return (
    <div className="Properties-Container">
      <div className="Properties">
        <div className="Properties-TopRow">
          <div className="Properties-Tabs">
            {TABS.map(tab => (
              <div
                key={tab}
                className={`Properties-Tab${activeTab === tab ? ' Properties-Tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </div>
            ))}
          </div>
          <div className="Properties-SearchBarRow">
            <input 
              className="Properties-SearchBar" 
              placeholder="Enter Keyword" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="Properties-SearchButton">SEARCH</button>
          </div>
        </div>
        <div className="Properties-TableWrapper">
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
                  <td colSpan={11} style={{ textAlign: 'center', color: '#888' }}>No records found.</td>
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
        </div>
      </div>
    </div>
  );
}
