import './ActivityLog.css';

import { useState } from 'react';

export default function ActivityLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // sample rows (would come from props or API)
  const rows = [
    { user: 'June Castro', action: 'Login', details: 'User logged in.', date: '06/25/25', time: '23:00:05' },
    { user: 'Jonathan Rasgo', action: 'Deactivate', details: 'Account deactivated.', date: '05/08/25', time: '11:08:23' },
    { user: 'Herson Alibin', action: 'Logout', details: 'User logged out.', date: '06/25/25', time: '08:45:54' },
    { user: 'Camila Alfonso', action: 'Update', details: 'Profile updated.', date: '06/24/25', time: '12:30:15' },
    { user: 'July Mendoza', action: 'Login', details: 'User logged in.', date: '06/24/25', time: '09:10:42' },
    { user: 'Alvin Ramos', action: 'Upload', details: 'Uploaded document.', date: '06/23/25', time: '14:05:01' },
    { user: 'Jessa Lim', action: 'Download', details: 'Downloaded report.', date: '06/23/25', time: '16:45:22' },
    { user: 'Ian Cruz', action: 'Login', details: 'User logged in.', date: '06/22/25', time: '07:55:19' },
    { user: 'Marie Gomez', action: 'Share', details: 'Shared a file.', date: '06/22/25', time: '10:12:35' },
    { user: 'Paulo Diaz', action: 'Logout', details: 'User logged out.', date: '06/22/25', time: '17:20:48' },
    { user: 'Liza Reyes', action: 'Reset Password', details: 'Password reset requested.', date: '06/21/25', time: '11:33:27' },
    { user: 'Carlos Santos', action: 'Deactivate', details: 'Account deactivated.', date: '06/21/25', time: '19:03:56' },
    { user: 'Diana Lee', action: 'Activate', details: 'Account activated.', date: '06/20/25', time: '08:22:10' },
    { user: 'Mark Tan', action: 'Upload', details: 'Uploaded new avatar.', date: '06/20/25', time: '14:44:59' },
    { user: 'Rose Ann', action: 'Login', details: 'User logged in.', date: '06/20/25', time: '06:18:05' },
  ];

  // Handle search on input change
  const handleSearch = (value) => {
    setSearchTerm(value);
    setSearchKeyword(value);
  };

  const filtered = searchKeyword ? rows.filter(row =>
    Object.values(row).some(
      value => value.toString().toLowerCase().includes(searchKeyword.toLowerCase())
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
      </div>
    </div>
  );
}
