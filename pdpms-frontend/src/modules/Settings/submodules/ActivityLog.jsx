import './ActivityLog.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ActivityLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch activity logs from API
  useEffect(() => {
    setIsLoading(true);
    axios.get('http://127.0.0.1:8000/pdpms/manila-city-hall/activity-logs/')
      .then(res => {
        // Transform API data to match table structure
        const data = Array.isArray(res.data) ? res.data : [res.data];
        const transformed = data.map(log => ({
          user: log.username,
          action: log.action_log,
          details: log.action_log, // Adjust if you have a separate details field
          date: log.timestamp ? log.timestamp.slice(0, 10).split('-').reverse().join('/') : '',
          time: log.timestamp ? log.timestamp.slice(11, 19) : '',
        }));
        setRows(transformed);
        setIsLoading(false);
      })
      .catch(() => {
        setRows([]);
        setIsLoading(false);
      });
  }, []);

  // Handle search on input change
  const handleSearch = (value) => {
    setSearchTerm(value);
    setSearchKeyword(value);
  };

  const filtered = searchKeyword ? rows.filter(row =>
    Object.values(row).some(
      value => value && value.toString().toLowerCase().includes(searchKeyword.toLowerCase())
    )
  ) : rows;

  return (
    <div className="Activity-Log-Container">
      {/* Search Row */}
      <div className="ActivityLog-TopRow">
        <div className="ActivityLog-SearchBarRow">
          <input
            type="text"
            className="ActivityLog-SearchBar"
            placeholder="Enter Keyword"
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="ActivityLog-TableWrapper">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Loading...</div>
        ) : (
          <table className="ActivityLog-Table">
            <thead>
              <tr>
                <th>User Info</th>
                <th>Action</th>
                <th>Details</th>
                <th>Date</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.user}</td>
                  <td>{row.action}</td>
                  <td>{row.details}</td>
                  <td>{row.date}</td>
                  <td>{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
