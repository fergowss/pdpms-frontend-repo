import React, { useState } from 'react';
import './App.css';
import bottomLogo from './images/pdpms_long.png';
import shortLogo from './images/pdpms_p_logo.png';
import AssetProperty from './modules/AssetProperty/AssetProperty.jsx';
import Dashboard from './modules/Dashboard/Dashboard.jsx';
import PublicDocument from './modules/PublicDocument/PublicDocument.jsx';
import Reports from './modules/Reports/Reports.jsx';
import Settings from './modules/Settings/Settings.jsx';
import Documents from './modules/Reports/submodules/Documents.jsx';
import Properties from './modules/Reports/submodules/Properties.jsx';
import ActivityLog from './modules/Settings/submodules/ActivityLog.jsx';
import UserManagement from './modules/Settings/submodules/UserManagement.jsx';
import { FiHome, FiFileText, FiBook, FiLayers, FiSettings, FiFolder, FiActivity, FiUsers, FiCircle } from 'react-icons/fi';

const iconMap = {
  Dashboard: FiHome,
  Reports: FiFileText,
  'Public Document': FiBook,
  'Asset Property': FiLayers,
  Settings: FiSettings,
  Documents: FiFolder,
  Properties: FiLayers,
  'Activity Log': FiActivity,
  'User Management': FiUsers,
};

const modules = [
  { id: 'Dashboard' },
  { id: 'Reports', subs: ['Documents', 'Properties'] },
  { id: 'Public Document' },
  { id: 'Asset Property' },
  { id: 'Settings', subs: ['Activity Log', 'User Management'] },
];

export default function App() {
  // helper to open sidebar if collapsed on item click
  const openSidebarIfCollapsed = () => {
    if (collapsed) setCollapsed(false);
  }
  // track module state
  const [activeModule, setActiveModule] = useState('Dashboard');
  const [activeSub, setActiveSub] = useState(null);
  // sidebar collapse toggle
  const [collapsed, setCollapsed] = useState(false);
  // track which module & submodule are active so we can highlight the sidebar and
  // update the main content area
  return (
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
          {modules.map((m) => (
            <div key={m.id}>
              <div
                className={
                  'nav-item' + (activeModule === m.id ? ' active' : '')
                }
                onClick={() => {
                  openSidebarIfCollapsed();
                  setActiveModule(m.id);
                  setActiveSub(null);
                }}
              >
                {React.createElement(iconMap[m.id] || FiCircle, { className: 'nav-icon' })}
                <span className={`label ${collapsed ? 'hidden' : ''}`}>{m.id}</span>
              </div>

              {m.subs && activeModule === m.id && (
                <div className="sub-nav">
                  {m.subs.map((s) => (
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

        <div className="logo">
          <img src={bottomLogo} alt="PDPMS logo" />
        </div>
        <div className="logo2">
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
          <div className="user-badge">U</div>
        </header>

        <main className="content">
          {activeSub ? (
            {
              'Documents': <Documents />,
              'Properties': <Properties />,
              'Activity Log': <ActivityLog />,
              'User Management': <UserManagement />,
            }[activeSub] || (
              <div>
                <h2>{activeModule}</h2>
                <h3>{activeSub}</h3>
                <p>Start implementing {activeSub} module content here.</p>
              </div>
            )
          ) : (
            {
              'Dashboard': <Dashboard />,
              'Public Document': <PublicDocument />,
              'Asset Property': <AssetProperty />,
              'Reports': <Reports />,
              'Settings': <Settings />,
            }[activeModule] || <p>Select a module.</p>
          )}
        </main>
      </div>
    </div>
  );
}
