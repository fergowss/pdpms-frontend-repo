import React, { useState, useRef } from 'react';
import { FiInfo, FiLogOut, FiEdit } from 'react-icons/fi';
import axios from 'axios';
import './UserProfile.css';

export default function UserProfile({ user, onLogout }) {
  const [avatarUrl, setAvatarUrl] = useState(() => {
    // Load avatar URL from localStorage when component mounts
    return localStorage.getItem(`user_${user?.username}_avatar`) || null;
  });
  const fileInputRef = useRef(null);

  if (!user) return null; // No user to display



  // Function to handle avatar change (simple client-side preview for now)
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const url = reader.result;
        console.log('Avatar selected, URL generated');
        setAvatarUrl(url);
        
        // Save the data URL to localStorage
        const avatarKey = `user_${user.username}_avatar`;
        console.log('Saving avatar to localStorage with key:', avatarKey);
        localStorage.setItem(avatarKey, url);
        
        // Verify it was saved
        const savedAvatar = localStorage.getItem(avatarKey);
        console.log('Avatar saved successfully:', !!savedAvatar);
        
        // Notify parent component to update the avatar in the user badge
        if (window.updateUserAvatar) {
          console.log('Notifying parent component of avatar update');
          window.updateUserAvatar(url);
        } else {
          console.warn('updateUserAvatar function not available on window');
        }
      };
      
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };
      
      reader.readAsDataURL(file);
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
          <div className="info-row"><label>Name</label><div className="profile-value">{user.name}</div></div>
          <div className="info-row"><label>Username</label><div className="profile-value">{user.username}</div></div>
          <div className="info-row"><label>Employee ID</label><div className="profile-value">{user.employee_id}</div></div>
          <div className="info-row"><label>Contact No.</label><div className="profile-value">{user.contact_no}</div></div>
          <div className="info-row"><label>Status</label><div className="profile-value">{user.status}</div></div>
        </div>

        <button className="logout-section" onClick={onLogout}><FiLogOut className="logout-icon" /> Log Out</button>
      </div>
    </div>
  );
}