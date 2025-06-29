import React, { useState, useRef } from 'react';
import { FiInfo, FiLogOut, FiEdit } from 'react-icons/fi';
import './UserProfile.css';

export default function UserProfile({ username='User', onLogout }) {
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [avatarUrl,setAvatarUrl]=useState(null);
  const fileInputRef=useRef(null);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [matchMsg, setMatchMsg] = useState('');

  const handleSave = () => {
    if (newPwd !== confirmPwd) {
      setMatchMsg("Password Doesn't Match!");
      return;
    }
    setMatchMsg('Password Match');
    // Here you would submit password change.
    setShowChangePwd(false);
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
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
            />
          </div>
          <div className="pwd-row">
            <label>New Password</label>
            <input 
              type="password" 
              placeholder="Enter new password"
              value={newPwd} 
              onChange={e => setNewPwd(e.target.value)} 
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
                if (matchMsg) setMatchMsg('');
              }} 
            />
          </div>
          {matchMsg && (
            <div className={`match-msg ${matchMsg.includes('Does') ? 'nomatch' : 'match'}`}>
              {matchMsg}
            </div>
          )}
          <div className="pwd-action-row">
            <button className="cancel-btn" type="button" onClick={() => setShowChangePwd(false)}>Cancel</button>
            <button className="save-btn" type="submit" onClick={handleSave}>Save Changes</button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="pwd-static">
          <span className="profile-value">***********</span>
          <button className="change-pwd-btn" onClick={() => setShowChangePwd(true)}><FiEdit className="edit-icon"/> Change Password</button>
        </div>
      );
    }
  };

  return (
    <div className="profile-dropdown">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-stack">
              <div className="avatar" style={avatarUrl?{backgroundImage:`url(${avatarUrl})`,backgroundSize:'cover',backgroundPosition:'center'}:{}}>
                {!avatarUrl && username.charAt(0).toUpperCase()}
              </div>
              <button type="button" className="add-photo-btn" onClick={()=>fileInputRef.current.click()}>Add Photo</button>
              <input type="file" accept="image/*" ref={fileInputRef} style={{display:'none'}} onChange={e=>{
                if(e.target.files && e.target.files[0]){
                  const url = URL.createObjectURL(e.target.files[0]);
                  setAvatarUrl(url);
                }
              }} />
            </div>
          <div className="profile-name-role">
            <h2>{username.charAt(0).toUpperCase() + username.slice(1).toLowerCase()}</h2>
            <span className="role">Administrator</span>
          </div>
        </div>

        <div className="personal-info">
          <h3 className="section-header"><FiInfo className="info-icon"/> Personal Information</h3>
          <div className="info-row"><label>Username:</label><span className="profile-value">admin</span></div>
          <div className="info-row"><label>Employee ID:</label><span className="profile-value">ADM0000001</span></div>
          <div className="info-row password-row"><label>Password:</label>{renderPasswordSection()}</div>
        </div>

        <button className="logout-section" onClick={onLogout}><FiLogOut className="logout-icon"/> Log Out</button>
      </div>
    </div>
  );
}
