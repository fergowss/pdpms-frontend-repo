import React, { useState, useEffect, useMemo } from 'react';
import { normalizeRole, filterModulesByRole } from './utils/user_roles';
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
  FiFolder, FiActivity, FiUsers, FiMenu, FiX,
  FiUser, FiUserCheck, FiCircle
} from 'react-icons/fi';

const iconMap = {
  Dashboard: FiHome,
  'Masterlist': FiFileText,
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
  { id: 'Masterlist', subs: ['Documents', 'Properties'] },
  { id: 'Public Document' },
  { id: 'Asset Property' },
  { id: 'Admin', subs: ['Activity Log', 'Employee Management', 'User Management'] },
];

// Role utilities imported from ./utils/user_roles

export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [activityLogRefreshKey, setActivityLogRefreshKey] = useState(0);
  const [activeModule, setActiveModule] = useState('Dashboard');
  const [activeSub, setActiveSub] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Close profile dropdown when user clicks outside of it or the user badge
  useEffect(() => {
    if (!profileOpen) return; // Only attach listener when dropdown is open

    const handleClickOutside = (e) => {
      const dropdown = document.querySelector('.profile-dropdown');
      const badge = document.querySelector('.user-badge');
      if (dropdown && !dropdown.contains(e.target) && badge && !badge.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    // Use mousedown so it fires before focus shifts
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  // Resolve the user's role
  // Determine the raw role string from user object (checks multiple possible fields)
  const rawRoleString = user?.username === 'admin'
    ? 'admin'
    : (
        user?.user_access ||
        user?.user_access_level ||
        user?.access_level ||
        user?.role ||
        user?.access ||
        user?.access_type ||
        user?.user_type ||
        ''
      );

  const role = normalizeRole(rawRoleString);

  // Compute which modules should be shown for the current role
  const visibleModules = useMemo(() => {
    const vm = filterModulesByRole(role, modules);
    console.log('Raw role string:', rawRoleString, '→ resolved:', role, '→ visibleModules:', vm.map(m=>m.id));
    return vm;
  }, [role]);

  // Ensure the currently active module is allowed for the current role
  useEffect(() => {
    if (!visibleModules.some(m => m.id === activeModule)) {
      setActiveModule('Dashboard');
      setActiveSub(null);
    }
  }, [visibleModules]);

  useEffect(() => {
    console.log('App mounted, checking auth...');
    const storedAuth = localStorage.getItem('pdpms_auth');
    const storedUser = localStorage.getItem('pdpms_user');

    if (storedAuth === 'true' && storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        console.log('User found:', userObj.username);
        setIsAuth(true);
        setUser(userObj);

        // Load avatar URL from localStorage when component mounts
        const avatarKey = `user_${userObj.username}_avatar`;
        const savedAvatar = localStorage.getItem(avatarKey);
        console.log('Loading avatar for key:', avatarKey, 'Found:', !!savedAvatar);
        
        if (savedAvatar) {
          console.log('Setting avatar URL from localStorage');
          setAvatarUrl(savedAvatar);
        } else {
          console.log('No saved avatar found for user:', userObj.username);
        }
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('pdpms_auth');
        localStorage.removeItem('pdpms_user');
      }
    } else {
      console.log('No stored auth or user found');
    }

    // Set up global function to update avatar from child components
    window.updateUserAvatar = (url) => {
      setAvatarUrl(url);
    };

    // Clean up the global function when component unmounts
    return () => {
      window.updateUserAvatar = null;
    };
  }, []);

  // Ensure user has contact_no and status
  useEffect(() => {
    if (user && (!user.contact_no || !user.status) && user.employee_id) {
      axios.get(`http://127.0.0.1:8000/pdpms/manila-city-hall/employees/${user.employee_id}/`)
        .then(res => {
          const emp = res.data;
          const patched = {
            ...user,
            contact_no: emp.contact_no || emp.phone_number || emp.mobile || user.contact_no || '',
            status: emp.employee_status || emp.status || emp.employment_status || user.status || '',
            position: emp.position_title || emp.position || user.position || '',
            department: emp.department || emp.department_name || user.department || 'Electronic Data Processing Services',
          };
          setUser(patched);
          localStorage.setItem('pdpms_user', JSON.stringify(patched));
        })
        .catch(err => console.error('Failed to backfill user profile:', err));
    }
  }, [user]);

  const handleLogin = async (userData) => {
    // First, get the employee details to get the full name
    try {
      const employeeRes = await axios.get(`http://127.0.0.1:8000/pdpms/manila-city-hall/employees/${userData.employee_id}/`);
      const employee = employeeRes.data;
      // Create a new user object with the full name
      const userWithFullName = {
        ...userData,
        full_name: `${employee.first_name} ${employee.last_name}`.trim(),
        contact_no: employee.contact_no || employee.phone_number || employee.mobile || '',
        status: employee.employee_status || employee.status || employee.employment_status || '',
        position: employee.position_title || employee.position || '',
        department: employee.department || employee.department_name || 'Electronic Data Processing Services',
      };
      
      localStorage.setItem('pdpms_auth', 'true');
      localStorage.setItem('pdpms_user', JSON.stringify(userWithFullName));
      
      // Load avatar for the user after login
      const avatarKey = `user_${userData.username}_avatar`;
      const savedAvatar = localStorage.getItem(avatarKey);
      console.log('Login - Loading avatar for key:', avatarKey, 'Found:', !!savedAvatar);
      
      setIsAuth(true);
      setUser(userWithFullName);
      
      if (savedAvatar) {
        console.log('Login - Setting avatar URL from localStorage');
        setAvatarUrl(savedAvatar);
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
      // If we can't get employee details, use the username as fallback
      const userWithUsername = {
        ...userData,
        full_name: userData.username
      };
      localStorage.setItem('pdpms_auth', 'true');
      localStorage.setItem('pdpms_user', JSON.stringify(userWithUsername));
      setIsAuth(true);
      setUser(userWithUsername);
    }

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
    const currentUsername = user?.username;

    try {
      await axios.post('http://127.0.0.1:8000/pdpms/manila-city-hall/activity-logs/', {
        log_id: logout_log_id,
        username: currentUsername || 'unknown',
        action_log: 'Logged out',
        timestamp,
      });
      console.log('Logout activity logged!');
      setActivityLogRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Logout log error:', err.response?.data || err.message);
    }

    // Only remove auth-related items from localStorage
    const avatarKey = currentUsername ? `user_${currentUsername}_avatar` : null;
    const avatarUrl = avatarKey ? localStorage.getItem(avatarKey) : null;
    
    // Clear all localStorage items
    localStorage.clear();
    
    // Restore the avatar URL if it exists
    if (avatarKey && avatarUrl) {
      localStorage.setItem(avatarKey, avatarUrl);
    }

    setIsAuth(false);
    setUser(null);
    setProfileOpen(false);
    window.location.href = '/login';
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
        <div 
          className="user-badge-circle" 
          style={avatarUrl ? { 
            backgroundImage: `url(${avatarUrl})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            color: 'transparent'
          } : {}}
        >
          {!avatarUrl && (user?.username?.charAt(0).toUpperCase() || 'U')}
        </div>
        <span className="user-badge-name">
          {user?.full_name || (user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1).toLowerCase() : 'User')}
        </span>
      </div>

      <div className="shell">
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
          <button
            className="hamburger sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <FiMenu size={20} /> : <FiX size={20} />}
          </button>

          <nav className="main-nav">
            {visibleModules.map(m => (
              <div key={m.id}>
                <div
                  className={"nav-item" + (activeModule === m.id ? " active" : "")}
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
                'Dashboard': <Dashboard user={user} />,
                'Public Document': <PublicDocument username={user?.username} />,
                'Asset Property': <AssetProperty username={user?.username} />,
                'Masterlist': <Reports />,
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
