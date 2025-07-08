import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import bottomLogo from './images/pdpms_long.png';
import shortLogo from './images/pdpms_p_logo.png';

import AssetProperty from './modules/AssetProperty/AssetProperty.jsx';
import Dashboard from './modules/Dashboard/Dashboard.jsx';
import PublicDocument from './modules/PublicDocument/PublicDocument.jsx';
import Reports from './modules/Reports/Reports.jsx';
import Settings from './modules/Settings/Settings.jsx';
import Login from './Login/Login.jsx';
import UserProfile from './UserProfile/UserProfile.jsx';
import Documents from './modules/Reports/submodules/Documents.jsx';
import Properties from './modules/Reports/submodules/Properties.jsx';
import ActivityLog from './modules/Settings/submodules/ActivityLog.jsx';
import UserManagement from './modules/Settings/submodules/UserManagement.jsx';
import EmployeeManagement from './modules/Settings/submodules/EmployeeManagement.jsx';

import {
  FiHome, FiFileText, FiBook, FiLayers,
  FiFolder, FiActivity, FiUsers,
  FiUser, FiUserCheck, FiCircle
} from 'react-icons/fi';

const iconMap = {
  Dashboard: FiHome,
  Reports: FiFileText,
  'Public Document': FiBook,
  'Asset Property': FiLayers,
  Admin: FiUsers,
  Documents: FiFolder,
  Properties: FiLayers,
  'Activity Log': FiActivity,
  'User Management': FiUser,
  'Employee Management': FiUserCheck,
};

const modules = [
  { id: 'Dashboard' },
  { id: 'Reports', subs: ['Documents', 'Properties'] },
  { id: 'Public Document' },
  { id: 'Asset Property' },
  { id: 'Admin', subs: ['Activity Log', 'Employee Management', 'User Management'] },
];

export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [activityLogRefreshKey, setActivityLogRefreshKey] = useState(0);
  const [activeModule, setActiveModule] = useState('Dashboard');
  const [activeSub, setActiveSub] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem('pdpms_auth');
    const storedUser = localStorage.getItem('pdpms_user');

    if (storedAuth === 'true' && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuth(true);
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('pdpms_auth');
        localStorage.removeItem('pdpms_user');
      }
    }
  }, []);

  const handleLogin = async (userData) => {
    localStorage.setItem('pdpms_auth', 'true');
    localStorage.setItem('pdpms_user', JSON.stringify(userData));
    setIsAuth(true);
    setUser(userData);

    const login_log_id = `LOG-USER-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    try {
      await axios.post('http://127.0.0.1:8000/pdpms/manila-city-hall/activity-logs/', {
        log_id: login_log_id,
        username: userData.username,
        action_log: 'Logged in',
        timestamp,
      });
      console.log('Login activity logged!');
      setActivityLogRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Login log error:', err.response?.data || err.message);
    }
  };

  const handleLogout = async () => {
    const logout_log_id = `LOG-USER-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    try {
      await axios.post('http://127.0.0.1:8000/pdpms/manila-city-hall/activity-logs/', {
        log_id: logout_log_id,
        username: user?.username || 'unknown',
        action_log: 'Logged out',
        timestamp,
      });
      console.log('Logout activity logged!');
      setActivityLogRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Logout log error:', err.response?.data || err.message);
    }

    localStorage.removeItem('pdpms_auth');
    localStorage.removeItem('pdpms_user');
    setIsAuth(false);
    setUser(null);
    setProfileOpen(false);
    window.location.reload();
  };

  const openSidebarIfCollapsed = () => {
    if (collapsed) setCollapsed(false);
  };

  if (!isAuth) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      {profileOpen && <UserProfile user={user} onLogout={handleLogout} />}
      <div className="user-badge" onClick={() => setProfileOpen(prev => !prev)}>
        <div className="user-badge-circle">{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
        <span className="user-badge-name">
          {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1).toLowerCase() : 'User'}
        </span>
      </div>

      <div className="shell">
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
          <button
            className="hamburger sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <nav className="main-nav">
            {modules.map(m => (
              <div key={m.id}>
                <div
                  className={'nav-item' + (activeModule === m.id ? ' active' : '')}
                  onClick={() => {
                    openSidebarIfCollapsed();
                    setActiveModule(m.id);
                    setActiveSub(m.subs ? m.subs[0] : null);
                  }}
                >
                  {React.createElement(iconMap[m.id] || FiCircle, { className: 'nav-icon' })}
                  <span className={`label ${collapsed ? 'hidden' : ''}`}>{m.id}</span>
                </div>

                {m.subs && activeModule === m.id && (
                  <div className="sub-nav">
                    {m.subs.map(s => (
                      <div
                        key={s}
                        className={'sub-item' + (activeSub === s ? ' active' : '')}
                        onClick={() => {
                          openSidebarIfCollapsed();
                          setActiveSub(s);
                        }}
                      >
                        {React.createElement(iconMap[s] || FiCircle, { className: 'nav-icon' })}
                        <span className={`label ${collapsed ? 'hidden' : ''}`}>{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="sidebar-divider" />
          <div className="logo" onClick={() => setActiveModule('Dashboard')}>
            <img src={bottomLogo} alt="PDPMS logo" />
          </div>
          <div className="logo2" onClick={() => setActiveModule('Dashboard')}>
            <img src={shortLogo} alt="PDPMS logo 2" />
          </div>
        </aside>

        <div className="main-area">
          <header className="header-nav">
            <div className="module-path">
              {React.createElement(iconMap[activeModule] || FiCircle, { className: 'nav-icon' })}
              <span className="module-name">{activeModule}</span>
              {activeSub && (
                <>
                  <span className="sep"> &gt; </span>
                  <span className="sub-name">{activeSub}</span>
                </>
              )}
            </div>
          </header>

          <main className="content">
            {activeSub ? (
              {
                'Documents': <Documents />,
                'Properties': <Properties />,
                'Activity Log': <ActivityLog key={activityLogRefreshKey} />,
                'User Management': <UserManagement />,
                'Employee Management': <EmployeeManagement />,
              }[activeSub] || <p>Start building {activeSub} module.</p>
            ) : (
              {
                'Dashboard': <Dashboard />,
                'Public Document': <PublicDocument />,
                'Asset Property': <AssetProperty />,
                'Reports': <Reports />,
                'Admin': <ActivityLog key={activityLogRefreshKey} />,
                'Settings': <Settings />,
              }[activeModule] || <p>Select a module.</p>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
