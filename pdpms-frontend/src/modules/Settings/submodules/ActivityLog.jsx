import './ActivityLog.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ActivityLog({ refreshTrigger }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Format timestamp to 12-hour format in PH time
  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    const options = {
      timeZone: 'Asia/Manila',
      hour12: true,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const formatted = new Intl.DateTimeFormat('en-US', options).format(date);
    const [month, day, year, time] = formatted.match(/\d+/g);
    const fullDate = `${month}/${day}/${year}`;
    const formattedTime = formatted.split(', ')[1];
    return { fullDate, formattedTime };
  };

  useEffect(() => {
    const fetchActivityLogs = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get('http://127.0.0.1:8000/pdpms/manila-city-hall/activity-logs/');
        const data = Array.isArray(res.data) ? res.data : [res.data].filter(Boolean);

        const transformed = data.map((log) => {
          const { fullDate, formattedTime } = formatTimestamp(log.timestamp);
          return {
            log_id: log.log_id,
            user: log.username,
            action: log.action_log,
            details: log.action_log,
            date: fullDate,
            time: formattedTime,
            timestamp: log.timestamp // Keep original timestamp for sorting
          };
        });

        // Sort logs by timestamp in descending order (newest first)
        const sorted = transformed.sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          return dateB - dateA; // Descending order
        });

        setRows(sorted);
      } catch (error) {
        console.error('Error fetching activity logs:', error);
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivityLogs();
  }, [refreshTrigger]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setSearchKeyword(value);
  };

  const filtered = searchKeyword
    ? rows.filter((row) =>
        Object.values(row).some(
          (value) => value && value.toString().toLowerCase().includes(searchKeyword.toLowerCase())
        )
      )
    : rows;

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
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="ActivityLog-TableWrapper">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            Loading activity logs...
          </div>
        ) : (
          <table className="ActivityLog-Table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>User Info</th>
                <th>Action</th>
                <th>Details</th>
                <th>Date</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((row) => (
                  <tr key={row.log_id}>
                    <td>{row.log_id}</td>
                    <td>{row.user}</td>
                    <td>{row.action}</td>
                    <td>{row.details}</td>
                    <td>{row.date}</td>
                    <td>{row.time}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    No activities found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
