import React from 'react';
import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../utils/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-brand">
          <Link to="/" className="logo">
            <img src="/ace-rem-logo.png" alt="ACE-REM Logo" className="logo-image" />
          </Link>
        </div>

        {user && (
          <nav className="header-nav">
            <div className="nav-user-info">
              <span className="user-role">{user.role}</span>
              <span className="user-name">{user.name}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
