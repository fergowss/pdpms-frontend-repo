import React from 'react';
import '../../AssetProperty/AssetProperty.css';

export default function EmployeeAddNotification({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="AssetProperty-NotificationOverlay" style={{justifyContent:'center',alignItems:'center'}}>
      <div className="AssetProperty-NotificationBox" style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:'0.7rem',padding:'1.2rem 1.8rem'}}>
        <span style={{display:'flex',alignItems:'center',height:'24px'}}>
          {/* Person Icon SVG */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="4" fill="#223354"/>
            <rect x="4" y="16" width="16" height="4" rx="2" fill="#223354"/>
          </svg>
        </span>
        <span style={{fontSize:'1.08rem',color:'#223354',fontWeight:400,display:'flex',alignItems:'center',height:'24px'}}>New Employee Has Been Added.</span>
      </div>
    </div>
  );
}
