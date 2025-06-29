import './UserManagement.css';


import React, { useState } from 'react';
import './UserManagement.css';

export default function UserManagement() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const users = [
    { id: 'ADM00001', name: 'Maria Santos', role: 'Administrator', status: 'Activated' },
    { id: 'DCM00002', name: 'Juan Dela Cruz', role: 'Document Manager', status: 'Activated' },
    { id: 'IA00003', name: 'Andrea Reyes', role: 'Information Access Officer', status: 'Activated' },
    { id: 'DCM00004', name: 'Miguel Tan', role: 'Document Manager', status: 'Deactivated' },
    { id: 'IA00005', name: 'Sofia Lim', role: 'Information Access Officer', status: 'Activated' },
    { id: 'ADM00006', name: 'Gabriel Reyes', role: 'Administrator', status: 'Activated' },
    { id: 'IA00007', name: 'Isabella Ong', role: 'Information Access Officer', status: 'Deactivated' },
    { id: 'DCM00008', name: 'Luis Garcia', role: 'Document Manager', status: 'Activated' },
    { id: 'IA00009', name: 'Carmen Sy', role: 'Information Access Officer', status: 'Activated' },
    { id: 'IA00010', name: 'Rafael Ocampo', role: 'Information Access Officer', status: 'Activated' },
    { id: 'DCM00011', name: 'Patricia Chua', role: 'Document Manager', status: 'Activated' },
    { id: 'IA00012', name: 'Eduardo Lim', role: 'Information Access Officer', status: 'Deactivated' },
    { id: 'ADM00013', name: 'Monica Tan', role: 'Administrator', status: 'Activated' },
    { id: 'IA00014', name: 'Ricardo Santos', role: 'Information Access Officer', status: 'Activated' },
    { id: 'DCM00015', name: 'Veronica Cruz', role: 'Document Manager', status: 'Deactivated' },
    { id: 'IA00016', name: 'Fernando Reyes', role: 'Information Access Officer', status: 'Activated' },
    { id: 'IA00017', name: 'Maricel Tan', role: 'Information Access Officer', status: 'Activated' },
    { id: 'DCM00018', name: 'Roberto Sy', role: 'Document Manager', status: 'Activated' },
    { id: 'IA00019', name: 'Lourdes Lim', role: 'Information Access Officer', status: 'Deactivated' },
    { id: 'ADM00020', name: 'Antonio Ocampo', role: 'Administrator', status: 'Activated' }
  ];

  return (
    <div className="User-Management-Container">
      <AddUserModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
      <div className="UserManagement-TopRow">
        <div className="UserManagement-SearchBarRow">
          <input
            className="UserManagement-SearchBar"
            type="text"
            placeholder="Enter Keyword"
            disabled
          />
          <button className="UserManagement-SearchButton" disabled>SEARCH</button>
        </div>
      </div>
      <div className="UserManagement-TableOuter">
        <div className="UserManagement-TableWrapper">
          <table className="UserManagement-Table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Reactivate/Deactivate</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={idx} onClick={() => { setSelectedUser(user); setManageModalOpen(true); }} style={{ cursor: 'pointer' }}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`UserManagement-Status-${user.status === 'Activated' ? 'Activated' : 'Deactivated'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button className={`UserManagement-${user.status === 'Activated' ? 'Deactivate' : 'Reactivate'}`} onClick={e => e.stopPropagation()}>
                      {user.status === 'Activated' ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="UserManagement-AddUserRow">
          <button className="UserManagement-AddUser" onClick={() => setAddModalOpen(true)}>ADD USER</button>
        </div>
      </div>
    <ManageUserModal
      open={manageModalOpen}
      onClose={() => setManageModalOpen(false)}
      onEdit={() => {
        setEditModalOpen(true);
        setManageModalOpen(false);
      }}
      onDelete={() => {
        setUserToDelete(selectedUser);
        setManageModalOpen(false);
        setDeleteModalOpen(true);
      }}
    />
    <EditUserModal
      open={editModalOpen}
      onClose={() => setEditModalOpen(false)}
      user={selectedUser}
    />
    <DeleteUserModal
      open={deleteModalOpen}
      onClose={() => setDeleteModalOpen(false)}
      user={userToDelete}
      onConfirm={() => {
        // Implement delete logic here (e.g., remove user from list)
        setDeleteModalOpen(false);
        setUserToDelete(null);
      }}
    />
    </div>
  );
}

function ManageUserModal({ open, onClose, onEdit, onDelete }) {
  if (!open) return null;
  return (
    <div className="UserManagement-ModalOverlay">
      <div className="UserManagement-ManageModalBox">
        <button className="UserManagement-ManageModalClose" onClick={onClose} aria-label="Close">X</button>
        <div className="UserManagement-ManageModalTitle">Manage User</div>
        <div className="UserManagement-ManageModalActions">
          <button className="UserManagement-ManageModalBtn UserManagement-ManageModalBtn--edit" onClick={onEdit}>EDIT</button>
          <button className="UserManagement-ManageModalBtn UserManagement-ManageModalBtn--delete" onClick={onDelete}>DELETE</button>
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

function EditUserModal({ open, onClose, user }) {
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
    // TODO: handle update logic
    onClose();
  };

  return (
    <div className="UserManagement-ModalOverlay">
      <div className="UserManagement-ModalBox">
        <form className="UserManagement-ModalForm" onSubmit={handleSubmit} autoComplete="off">
          <div className="UserManagement-ModalGrid">
            <div>
              <label className="UserManagement-ModalLabel">Employee ID</label>
              <input
                className="UserManagement-ModalInput"
                type="text"
                name="employeeId"
                value={form.employeeId}
                readOnly
                disabled
              />
              <label className="UserManagement-ModalLabel">Username</label>
              <input
                className="UserManagement-ModalInput"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                autoFocus
              />
              <label className="UserManagement-ModalLabel">Current Password</label>
              <div style={{ position: 'relative' }}>
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
              <label className="UserManagement-ModalLabel">New Password</label>
              <div style={{ position: 'relative' }}>
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
              <label className="UserManagement-ModalLabel">Employee Role</label>
              <select
                className="UserManagement-ModalSelect"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="">Select Employee Role</option>
                <option value="Administrator">Administrator</option>
                <option value="Document Manager">Document Manager</option>
                <option value="Information Access Officer">Information Access Officer</option>
              </select>
            </div>
          </div>
          <div className="UserManagement-ModalActions">
            <button type="submit" className="UserManagement-ModalBtn UserManagement-ModalBtn--primary">UPDATE</button>
            <button type="button" className="UserManagement-ModalBtn UserManagement-ModalBtn--secondary" onClick={onClose}>CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddUserModal({ open, onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    employeeId: '',
    username: '',
    password: '',
    role: ''
  });

  if (!open) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    // TODO: handle add user logic
    onClose();
  };

  return (
    <div className="UserManagement-ModalOverlay">
      <div className="UserManagement-ModalBox">
        <form className="UserManagement-ModalForm" onSubmit={handleSubmit} autoComplete="off">
          <div className="UserManagement-ModalGrid">
            <div>
              <label className="UserManagement-ModalLabel">Employee ID</label>
              <input
                className="UserManagement-ModalInput"
                type="text"
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                autoFocus
              />
              <label className="UserManagement-ModalLabel">Username</label>
              <input
                className="UserManagement-ModalInput"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
              />
              <label className="UserManagement-ModalLabel">Set Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="UserManagement-ModalInput UserManagement-ModalInput--password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
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
              <label className="UserManagement-ModalLabel">Employee Role</label>
              <select
                className="UserManagement-ModalSelect"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="">Select Employee Role</option>
                <option value="Administrator">Administrator</option>
                <option value="Document Manager">Document Manager</option>
                <option value="Information Access Officer">Information Access Officer</option>
              </select>
            </div>
          </div>
          <div className="UserManagement-ModalActions">
            <button type="submit" className="UserManagement-ModalBtn UserManagement-ModalBtn--primary">ADD</button>
            <button type="button" className="UserManagement-ModalBtn UserManagement-ModalBtn--secondary" onClick={onClose}>CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
}




