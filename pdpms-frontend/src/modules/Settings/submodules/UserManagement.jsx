import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.css';

// SVG for user icon
const UserIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" fill="#223354"/>
    <path d="M20 19C20 15.13 16.41 12 12 12C7.59 12 4 15.13 4 19" stroke="#223354" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users from API
  useEffect(() => {
    setIsLoading(true);
    axios.get('http://127.0.0.1:8000/pdpms/manila-city-hall/users/')
      .then(res => {
        const data = res.data;
        // Transform API data to match table structure
        const transformed = Array.isArray(data) ? data.map(u => ({
          id: u.employee_id,
          username: u.username,
          name: u.username,
          role: u.access_level,
          status: u.user_status === 'Active' ? 'Activated' : 'Deactivated',
        })) : [];
        setUsers(transformed);
        setFilteredUsers(transformed);
        setIsLoading(false);
      })
      .catch(err => {
        setIsLoading(false);
        setUsers([]);
        setFilteredUsers([]);
      });
  }, []);

  const fetchUsers = () => {
    setIsLoading(true);
    axios.get('http://127.0.0.1:8000/pdpms/manila-city-hall/users/')
      .then(res => {
        const data = res.data;
        const transformed = Array.isArray(data) ? data.map(u => ({
          id: u.employee_id,
          username: u.username, // <-- add this
          name: u.username,
          role: u.access_level,
          status: u.user_status === 'Active' ? 'Activated' : 'Deactivated',
        })) : [];
        setUsers(transformed);
        setFilteredUsers(transformed);
        setIsLoading(false);
      })
      .catch(err => {
        setIsLoading(false);
        setUsers([]);
        setFilteredUsers([]);
      });
  };

  const handleSearch = () => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      setFilteredUsers(users);
      return;
    }
    setFilteredUsers(
      users.filter(
        (user) =>
          user.name.toLowerCase().includes(keyword) ||
          user.id.toLowerCase().includes(keyword) ||
          user.role.toLowerCase().includes(keyword) ||
          user.status.toLowerCase().includes(keyword)
      )
    );
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [showAddNotif, setShowAddNotif] = useState(false);
  const [showUpdateNotif, setShowUpdateNotif] = useState(false);
  const [showDeleteNotif, setShowDeleteNotif] = useState(false);
  const [showDeactivateNotif, setShowDeactivateNotif] = useState(false);
  const [deactivateNotifMessage, setDeactivateNotifMessage] = useState('');
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState(null);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Handler for when a user is added
  const handleAddUser = async (form) => {
    try {
      await axios.post('http://127.0.0.1:8000/pdpms/manila-city-hall/users/', {
        employee_id: form.employeeId,
        username: form.username,
        user_password: form.password, 
        access_level: form.role,
        user_status: "Active"
      });
      setAddModalOpen(false);
      setShowAddNotif(true);
      fetchUsers(); 
      setTimeout(() => setShowAddNotif(false), 3000);
    } catch (error) {
      console.error('Add user error:', error.response ? error.response.data : error.message);
      alert('Failed to add user. Please try again.');
    }
  };

  // Handler for when a user is updated
  const handleUpdateUser = async (form) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/pdpms/manila-city-hall/users/${form.username}/`,
        {
          username: form.username,
          employee_id: form.employeeId,
          current_password: form.currentPassword, // <-- send this
          user_password: form.newPassword,
          access_level: form.role,
          user_status: 'Active'
        }
      );
      setEditModalOpen(false);
      setShowUpdateNotif(true);
      fetchUsers();
      setTimeout(() => setShowUpdateNotif(false), 3000);
    } catch (error) {
      console.error('Update user error:', error.response ? error.response.data : error.message);
      alert('Failed to update user. ' + (error.response?.data?.detail || 'Please check your input and try again.'));
    }
  };

  // Handler for when a user is deleted
  const handleDeleteUser = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
    setShowDeleteNotif(true);
    setTimeout(() => setShowDeleteNotif(false), 3000);
  };

  // Handler for when a user is deactivated/reactivated
  const handleDeactivateUser = (user) => {
    setUserToDeactivate(user);
    setDeactivateModalOpen(true);
  };

  const confirmDeactivate = () => {
    if (userToDeactivate) {
      handleToggleUserStatus(userToDeactivate);
    }
  };

  const handleToggleUserStatus = async (user) => {
    const newStatus = user.status === 'Activated' ? 'Deactivated' : 'Activated';
    try {
      await axios.patch(
        `http://127.0.0.1:8000/pdpms/manila-city-hall/users/${user.username}/`,
        {
          user_status: newStatus === 'Activated' ? 'Active' : 'Deactivated'
        }
      );
      setDeactivateModalOpen(false);
      setDeactivateNotifMessage(
        newStatus === 'Activated'
          ? 'User Has Been Reactivated.'
          : 'User Has Been Deactivated.'
      );
      setShowDeactivateNotif(true);
      fetchUsers();
      setTimeout(() => setShowDeactivateNotif(false), 3000);
    } catch (error) {
      alert('Failed to update user status.');
    }
  };

  return (
    <div className="User-Management-Container">
      {showAddNotif && (
  <div className="AssetProperty-NotificationOverlay" style={{ justifyContent: 'center', alignItems: 'center' }}>
    <div className="AssetProperty-NotificationBox" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.7rem', padding: '1.2rem 1.8rem' }}>
      <span style={{ display: 'flex', alignItems: 'center', height: '24px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="4" fill="#223354" />
          <rect x="4" y="16" width="16" height="4" rx="2" fill="#223354" />
        </svg>
      </span>
      <span style={{ fontSize: '1.08rem', color: '#223354', fontWeight: 400, display: 'flex', alignItems: 'center', height: '24px' }}>
        New User Has Been Added.
      </span>
    </div>
  </div>
)}
      {showUpdateNotif && (
        <div className="AssetProperty-NotificationOverlay" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div className="AssetProperty-NotificationBox" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.7rem', padding: '1.2rem 1.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', height: '24px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" fill="#223354" />
                <rect x="4" y="16" width="16" height="4" rx="2" fill="#223354" />
              </svg>
            </span>
            <span style={{ fontSize: '1.08rem', color: '#223354', fontWeight: 400, display: 'flex', alignItems: 'center', height: '24px' }}>
              User Info Has Been Updated.
            </span>
          </div>
        </div>
      )}
      {showDeleteNotif && (
        <div className="AssetProperty-EditNotification" style={{
          background: '#e8eef7',
          border: '1.7px solid #bfc7d1',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 16px rgba(34, 51, 84, 0.13)',
          padding: '0.7rem 1.1rem',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '0.6rem',
          zIndex: 2000,
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: '260px',
          maxWidth: '90%'
        }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            flexShrink: 0
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="#223354" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span style={{
            fontSize: '0.97rem',
            color: '#223354',
            fontWeight: 400,
            textAlign: 'left',
            whiteSpace: 'nowrap'
          }}>
            User Info Has Been Successfully Deleted.
          </span>
        </div>
      )}
      {showDeactivateNotif && (
        <div className="AssetProperty-NotificationOverlay" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div className="AssetProperty-NotificationBox" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.7rem', padding: '1.2rem 1.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', height: '24px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" fill="#223354"/>
                <path d="M20 19C20 15.13 16.41 12 12 12C7.59 12 4 15.13 4 19" stroke="#223354" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            <span style={{ fontSize: '1.08rem', color: '#223354', fontWeight: 400, display: 'flex', alignItems: 'center', height: '24px' }}>
              {deactivateNotifMessage}
            </span>
          </div>
        </div>
      )}
      <AddUserModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onAdd={handleAddUser} />
      <div className="UserManagement-TopRow">
        <div className="UserManagement-SearchBarRow">
          <input
            className="UserManagement-SearchBar"
            type="text"
            placeholder="Enter Keyword"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
      </div>
      <div className="UserManagement-TableOuter">
        <div className="UserManagement-TableWrapper">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Loading...</div>
          ) : (
            <table className="UserManagement-Table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Username</th>
                  <th>User Access</th>
                  <th>Status</th>
                  <th>Reactivate/Deactivate</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#888' }}>No records found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <tr key={idx} onClick={() => { setSelectedUser(user); setEditModalOpen(true); }} style={{ cursor: 'pointer' }}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.role}</td>
                      <td>
                        <span className={`UserManagement-Status-${user.status === 'Activated' ? 'Activated' : 'Deactivated'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`UserManagement-${user.status === 'Activated' ? 'Deactivate' : 'Reactivate'}`} 
                          onClick={e => {
                            e.stopPropagation();
                            handleDeactivateUser(user);
                          }}
                        >
                          {user.status === 'Activated' ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="UserManagement-AddUserRow">
          <button className="UserManagement-AddUser" onClick={() => setAddModalOpen(true)}>ADD USER</button>
        </div>
      </div>
    
    <EditUserModal
      open={editModalOpen}
      onClose={() => setEditModalOpen(false)}
      onUpdate={handleUpdateUser}
      user={selectedUser}
    />
    <DeleteUserModal
      open={deleteModalOpen}
      onClose={() => setDeleteModalOpen(false)}
      user={userToDelete}
      onConfirm={handleDeleteUser}
    />
    
    {/* Deactivate Confirmation Modal */}
    {deactivateModalOpen && userToDeactivate && (
      <div className="UserManagement-ModalOverlay" onClick={() => setDeactivateModalOpen(false)}>
        <div className="UserManagement-DeactivateModalBox" onClick={e => e.stopPropagation()}>
          <button 
            className="UserManagement-DeactivateModalClose" 
            onClick={() => setDeactivateModalOpen(false)}
            aria-label="Close"
          >
            ×
          </button>
          <div className="UserManagement-DeactivateModalContent">
            <div 
              className="UserManagement-DeactivateModalSubtext"
              dangerouslySetInnerHTML={{
                __html: userToDeactivate.status === 'Activated'
                  ? `Are you sure you want to deactivate <strong>${userToDeactivate.name} (${userToDeactivate.id})</strong>?`
                  : `Are you sure you want to reactivate <strong>${userToDeactivate.name} (${userToDeactivate.id})</strong>?`
              }}
            />
          </div>
          <div className="UserManagement-DeactivateModalActions">
            <button 
              className={`UserManagement-DeactivateModalBtn UserManagement-DeactivateModalBtn--${userToDeactivate.status === 'Activated' ? 'deactivate' : 'reactivate'}`}
              onClick={confirmDeactivate}
            >
              {userToDeactivate.status === 'Activated' ? 'DEACTIVATE' : 'REACTIVATE'}
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

function ManageUserModal({ open, onClose, onEdit }) {
  if (!open) return null;
  
  return (
    <div className="UserManagement-ModalOverlay">
      <div className="UserManagement-ManageModalBox">
        <button className="UserManagement-ManageModalClose" onClick={onClose} aria-label="Close">X</button>
        <div className="UserManagement-ManageModalTitle">Edit User Info?</div>
        <div className="UserManagement-ManageModalActions" style={{ justifyContent: 'center' }}>
          <button 
            className="UserManagement-ManageModalBtn UserManagement-ManageModalBtn--edit" 
            onClick={onEdit}
            style={{ margin: '0' }}
          >
            EDIT
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteUserModal({ open, onClose, user, onConfirm }) {
  if (!open) return null;
  return (
    <div className="UserManagement-ModalOverlay" onClick={onClose}>
      <div className="UserManagement-DeleteModalBox" onClick={e => e.stopPropagation()}>
        <button className="UserManagement-DeleteModalClose" onClick={onClose} aria-label="Close">×</button>
        <div className="UserManagement-DeleteModalContent">
          <span className="UserManagement-DeleteModalText">
            {user && user.id ? (
              <>
                Are you sure you want to delete<br />
                <b>user {user.id}</b>?
              </>
            ) : (
              'Are you sure you want to delete this user?'
            )}
          </span>
        </div>
        <div className="UserManagement-DeleteModalActions UserManagement-DeleteModalActions--centered">
          <button className="UserManagement-DeleteModalBtn UserManagement-DeleteModalBtn--secondary" onClick={onConfirm}>CONFIRM DELETION</button>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({ open, onClose, onUpdate, user }) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [form, setForm] = useState({
    employeeId: '',
    username: '',
    currentPassword: '',
    newPassword: '',
    role: ''
  });

  React.useEffect(() => {
    if (user && open) {
      setForm({
        employeeId: user.id || '',
        username: user.name || '',
        currentPassword: '',
        newPassword: '',
        role: user.role || ''
      });
    }
  }, [user, open]);

  if (!open) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (onUpdate) onUpdate(form);
    onClose();
  };

  return (
    <div className="UserManagement-ModalOverlay">
      <div className="UserManagement-ModalBox">
        <form 
          className="UserManagement-ModalForm UserManagement-EditUserForm" 
          onSubmit={handleSubmit} 
          autoComplete="off" 
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: '1.2rem'
          }}>
          <div className="UserManagement-ModalGrid" style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: '1.2rem'
          }}>
            {/* First Row - Employee ID and Username */}
            <div className="UserManagement-FormRow" style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              gap: '1rem'
            }}>
              <div className="UserManagement-FormGroup">
                <label className="UserManagement-ModalLabel">Employee ID</label>
                <input
                  className="UserManagement-ModalInput"
                  type="text"
                  name="employeeId"
                  value={form.employeeId}
                  readOnly
                  disabled
                />
              </div>
              <div className="UserManagement-FormGroup">
                <label className="UserManagement-ModalLabel">Username</label>
                <input
                  className="UserManagement-ModalInput"
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  autoFocus
                />
              </div>
            </div>

            {/* Current Password */}
            <div className="UserManagement-FormGroup">
              <label className="UserManagement-ModalLabel">Current Password</label>
              <div className="UserManagement-PasswordWrapper">
                <input
                  className="UserManagement-ModalInput UserManagement-ModalInput--password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="UserManagement-ModalPasswordToggle"
                  onClick={() => setShowCurrentPassword(v => !v)}
                  tabIndex={-1}
                  aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? (
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#223354" strokeWidth="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3.5" stroke="#223354" strokeWidth="2"/></svg>
                  ) : (
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#223354" strokeWidth="2" d="M17.94 17.94C16.11 19.24 14.13 20 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.06m3.22-1.64A11.93 11.93 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-4.18 5.38M1 1l22 22"/><circle cx="12" cy="12" r="3.5" stroke="#223354" strokeWidth="2"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="UserManagement-FormGroup">
              <label className="UserManagement-ModalLabel">New Password</label>
              <div className="UserManagement-PasswordWrapper">
                <input
                  className="UserManagement-ModalInput UserManagement-ModalInput--password"
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="UserManagement-ModalPasswordToggle"
                  onClick={() => setShowNewPassword(v => !v)}
                  tabIndex={-1}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? (
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#223354" strokeWidth="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3.5" stroke="#223354" strokeWidth="2"/></svg>
                  ) : (
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#223354" strokeWidth="2" d="M17.94 17.94C16.11 19.24 14.13 20 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.06m3.22-1.64A11.93 11.93 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-4.18 5.38M1 1l22 22"/><circle cx="12" cy="12" r="3.5" stroke="#223354" strokeWidth="2"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* User Role */}
            <div className="UserManagement-FormGroup" style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <label className="UserManagement-ModalLabel">User Access</label>
              <select
                className="UserManagement-ModalSelect"
                name="role"
                value={form.role}
                onChange={handleChange}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  margin: 0,
                  padding: '0.48rem 0.9rem',
                  border: '1.5px solid #2B3E63',
                  borderRadius: '0.35rem',
                  fontSize: '0.98rem',
                  backgroundColor: '#f6fcff',
                  color: '#223354',
                  outline: 'none',
                  transition: 'border 0.2s',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D"292.4"%20height%3D"292.4"%3E%3Cpath%20fill%3D"%23223354"%20d%3D"M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z"%2F%3E%3C%2Fsvg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.7rem top 50%',
                  backgroundSize: '0.65em auto'
                }}
              >
                <option value="">User Access</option>
                <option value="Administrator">Administrator</option>
                <option value="Document Manager">Document Manager</option>
                <option value="Information Access Officer">Information Access Officer</option>
              </select>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="UserManagement-ModalActions">
            <button 
              type="submit" 
              className="UserManagement-ModalBtn UserManagement-ModalBtn--primary"
            >
              UPDATE
            </button>
            <button 
              type="button" 
              className="UserManagement-ModalBtn UserManagement-ModalBtn--secondary"
              onClick={onClose}
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddUserModal({ open, onClose, onAdd }) {
  const [showPassword, setShowPassword] = useState(false);
  const initialForm = { employeeId: '', username: '', password: '', role: '' };
  const [form, setForm] = useState(initialForm);

  React.useEffect(() => {
    if (open) {
      setForm(initialForm);
      setShowPassword(false);
    }
  }, [open]);

  if (!open) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (onAdd) onAdd(form);
    onClose();
  };

  return (
    <div className="UserManagement-ModalOverlay">
      <div className="UserManagement-ModalBox">
      <form className="UserManagement-ModalForm UserManagement-AddUserForm" onSubmit={handleSubmit} autoComplete="off" style={{          display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: '1.2rem'
          }}>
          <div className="UserManagement-ModalGrid" style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: '1.2rem'
          }}>
            {/* First Row - Employee ID and Username */}
            <div className="UserManagement-FormRow" style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              gap: '1rem'
            }}>
              <div className="UserManagement-FormGroup">
                <label className="UserManagement-ModalLabel">Employee ID</label>
                <input
                  className="UserManagement-ModalInput"
                  type="text"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  autoFocus
                  required
                />
              </div>
              <div className="UserManagement-FormGroup">
                <label className="UserManagement-ModalLabel">Username</label>
                <input
                  className="UserManagement-ModalInput"
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="UserManagement-FormGroup">
              <label className="UserManagement-ModalLabel">Set Password</label>
              <div className="UserManagement-PasswordWrapper">
                <input
                  className="UserManagement-ModalInput UserManagement-ModalInput--password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="UserManagement-ModalPasswordToggle"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#223354" strokeWidth="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3.5" stroke="#223354" strokeWidth="2"/></svg>
                  ) : (
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#223354" strokeWidth="2" d="M17.94 17.94C16.11 19.24 14.13 20 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.06m3.22-1.64A11.93 11.93 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-4.18 5.38M1 1l22 22"/><circle cx="12" cy="12" r="3.5" stroke="#223354" strokeWidth="2"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* User Role */}
            <div className="UserManagement-FormGroup" style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <label className="UserManagement-ModalLabel">User Access</label>
              <select
                className="UserManagement-ModalSelect"
                name="role"
                value={form.role}
                onChange={handleChange}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  margin: 0,
                  padding: '0.48rem 0.9rem',
                  border: '1.5px solid #2B3E63',
                  borderRadius: '0.35rem',
                  fontSize: '0.98rem',
                  backgroundColor: '#f6fcff',
                  color: '#223354',
                  outline: 'none',
                  transition: 'border 0.2s',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D"292.4"%20height%3D"292.4"%3E%3Cpath%20fill%3D"%23223354"%20d%3D"M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z"%2F%3E%3C%2Fsvg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.7rem top 50%',
                  backgroundSize: '0.65em auto'
                }}
              >
                <option value="">Select User Access</option>
                <option value="Administrator">Administrator</option>
                <option value="Document Manager">Document Manager</option>
                <option value="Information Access Officer">Information Access Officer</option>
              </select>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="UserManagement-ModalActions">
            <button 
               type="submit" 
               className="UserManagement-ModalBtn UserManagement-ModalBtn--primary"
               disabled={!form.employeeId || !form.username || !form.password || !form.role}
             >
               ADD
             </button>
            <button 
              type="button" 
              className="UserManagement-ModalBtn UserManagement-ModalBtn--secondary"
              onClick={onClose}
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
