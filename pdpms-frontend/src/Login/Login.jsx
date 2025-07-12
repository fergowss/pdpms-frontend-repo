import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';
import './Login.css';
import logo from '../images/pdpms_long.png';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!username.trim() || !password.trim()) {
      setError('Both Username and Password are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Fetch users from backend (this approach assumes user_password is sent back for client-side comparison,
      // which is NOT recommended for production. Ideally, you'd send username/password to a /login endpoint
      // and the backend would authenticate and return a token/user data).
      const res = await axios.get('http://127.0.0.1:8000/pdpms/manila-city-hall/users/');
      const users = res.data;

      // Find matching user
      const user = users.find(
        u => u.username === username && u.user_password === password
      );

      if (!user) {
        setError('Invalid Credentials! Please enter a valid username and password.');
        setIsSubmitting(false);
        return;
      }

      // Check if user is deactivated
      if (user.user_status && user.user_status.toLowerCase() !== 'active') {
        setError("This user's account has been deactivated. Please contact the admin.");
        setIsSubmitting(false);
        return;
      }

      // Pass user info to parent (App.jsx)
      if (onLogin) onLogin(user);

    } catch (err) {
      setError('Failed to connect to server or retrieve user data.');
      console.error(err);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="login-page">
      <img src={logo} alt="PDPMS Logo" className="login-logo" />
      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <label className="login-label">Username</label>
        <input
          type="text"
          className="login-input"
          placeholder="Enter your username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />

        <label className="login-label">Password</label>
        <div className="login-password-wrapper">
          <input
            type={showPwd ? 'text' : 'password'}
            className="login-input"
            placeholder='Enter your password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <span className="login-eye" onClick={() => setShowPwd(prev => !prev)}>
            {showPwd ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>
        {error && <div className="login-error">{error}</div>}
        <a href="#" className="login-forgot" onClick={() => window.open('https://mail.google.com/mail/?view=cm&fs=1&to=vansondepano@gmail.com', '_blank', 'noopener,noreferrer')}>Forgot Password? <span>Contact Admin.</span></a>
        <button type="submit" className="login-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}