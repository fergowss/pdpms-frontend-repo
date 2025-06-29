import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './Login.css';
import logo from '../images/pdpms_long.png';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Both Username and Password are required.');
      return;
    }
    if (username.trim() !== 'admin' || password !== 'admin123') {
      setError('Invalid Credentials! Please enter valid username and password.');
      return;
    }
    if (onLogin) onLogin({ username });
  };

  return (
    <div className="login-page">
      <img src={logo} alt="PDPMS Logo" className="login-logo" />
      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <label className="login-label">Username</label>
        <input
          type="text"
          className="login-input"
          placeholder="admin"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label className="login-label">Password</label>
        <div className="login-password-wrapper">
          <input
            type={showPwd ? 'text' : 'password'}
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="login-eye" onClick={() => setShowPwd((prev) => !prev)}>
            {showPwd ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>
        {error && <div className="login-error">{error}</div>}
        <a href="#" className="login-forgot">Forgot Password? <span>Contact Admin.</span></a>
        <button type="submit" className="login-btn">Sign In</button>
      </form>
    </div>
  );
}
