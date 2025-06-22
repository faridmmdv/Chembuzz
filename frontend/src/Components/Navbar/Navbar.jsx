import React, { useState } from 'react';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/chemnitz.png';

const Navbar = ({ className = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleToggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className={`navbar ${className}`}>
      <Link to="/" onClick={closeMenu}>
        <img src={logo} alt="ChemBuzz Logo" />
      </Link>

      <div className="hamburger" onClick={handleToggleMenu}>
        <div className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></div>
        <div className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></div>
        <div className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></div>
      </div>

      <ul className={`nav-links ${isMobileMenuOpen ? 'show' : ''}`}>
        <li><Link to="/" onClick={closeMenu}>Home</Link></li>
        <li><Link to="/about" onClick={closeMenu}>About</Link></li>
        <li><Link to="/explore" onClick={closeMenu}>Explore</Link></li>

        {token ? (
          <>
            <li><Link to="/profile" onClick={closeMenu}>Profile</Link></li>
            <li>
              <button
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
                className="logout-button"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login" onClick={closeMenu}>Login</Link></li>
            <li><Link to="/register" onClick={closeMenu}>Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
