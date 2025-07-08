import React, { useState, useRef } from 'react';
import { FiInfo, FiLogOut, FiEdit } from 'react-icons/fi';
import axios from 'axios';
import './UserProfile.css';

export default function UserProfile({ user, onLogout }) {
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [matchMsg, setMatchMsg] = useState('');

  if (!user) return null; // No user to display

  const handleSave = async () => {
    if (newPwd !== confirmPwd) {
      setMatchMsg("Password Doesn't Match!");
      return;
    }

    setMatchMsg(''); // Clear previous messages

    try {
      // This patch operation for user password would ideally be handled by a secure backend endpoint
      // that hashes the password and validates the current password.
      const res = await axios.patch(`http://127.0.0.1:8000/pdpms/manila-city-hall/users/${user.username}/`, {
        user_password: newPwd,
        current_password: currentPwd, // Backend should validate this
      });
      alert("Password changed successfully!");
      setShowChangePwd(false);
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setMatchMsg(err.response.data.detail);
      } else {
        setMatchMsg("Failed to change password. Please try again.");
      }
      console.error("Password change error:", err);
    }
  };

  const renderPasswordSection = () => {
    if (showChangePwd) {
      return (
        <div className="pwd-change-area">
          <div className="pwd-row">
            <label>Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPwd}
              onChange={e => setCurrentPwd(e.target.value)}
              autoComplete="current-password" // Helps browsers suggest current password
            />
          </div>
          <div className="pwd-row">
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              autoComplete="new-password" // Helps browsers suggest new password
            />
          </div>
          <div className="pwd-row">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPwd}
              onChange={e => {
                setConfirmPwd(e.target.value);
                if (matchMsg) setMatchMsg(''); // Clear message when typing
              }}
              autoComplete="new-password" // Helps browsers suggest new password
            />
          </div>
          {matchMsg && (
            <div className={`match-msg ${matchMsg.includes('Does') || matchMsg.includes('Failed') ? 'nomatch' : 'match'}`}>
              {matchMsg}
            </div>
          )}
          <div className="pwd-action-row">
            <button className="cancel-btn" type="button" onClick={() => {
              setShowChangePwd(false);
              setCurrentPwd('');
              setNewPwd('');
              setConfirmPwd('');
              setMatchMsg(''); // Clear message on cancel
            }}>Cancel</button>
            <button className="save-btn" type="submit" onClick={handleSave}>Save Changes</button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="pwd-static">
          <span className="profile-value">***********</span>
          <button className="change-pwd-btn" onClick={() => setShowChangePwd(true)}><FiEdit className="edit-icon" /> Change Password</button>
        </div>
      );
    }
  };

  // Function to handle avatar change (simple client-side preview for now)
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setAvatarUrl(url);
      // In a real app, you'd upload this file to your backend here
      // const formData = new FormData();
      // formData.append('avatar', e.target.files[0]);
      // axios.post('/api/upload-avatar', formData)...
    }
  };

  return (
    <div className="profile-dropdown">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-stack">
            <div className="avatar" style={avatarUrl ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
              {!avatarUrl && user.username.charAt(0).toUpperCase()}
            </div>
            <button type="button" className="add-photo-btn" onClick={() => fileInputRef.current.click()}>Add Photo</button>
            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleAvatarChange} />
          </div>
          <div className="profile-name-role">
            <h2>{user.username.charAt(0).toUpperCase() + user.username.slice(1)}</h2>
            <span className="role">{user.access_level}</span>
          </div>
        </div>

        <div className="personal-info">
          <h3 className="section-header"><FiInfo className="info-icon" /> Personal Information</h3>
          <div className="info-row"><label>Username:</label><span className="profile-value">{user.username}</span></div>
          <div className="info-row"><label>Employee ID:</label><span className="profile-value">{user.employee_id}</span></div>
          <div className="info-row"><label>Status:</label><span className="profile-value">{user.user_status}</span></div>
          <div className="info-row password-row"><label>Password:</label>{renderPasswordSection()}</div>
        </div>

        <button className="logout-section" onClick={onLogout}><FiLogOut className="logout-icon" /> Log Out</button>
      </div>
    </div>
  );
}