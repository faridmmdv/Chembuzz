import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Info, ShoppingBag, Compass, LogIn, UserPlus, User } from 'lucide-react';
import logo from '../../assets/chemnitz.png';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsMenuOpen(false);
    navigate('/');
  };

  // Close menu on link click (mobile)
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className={`navbar${isMenuOpen ? ' menu-open' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="logo-link" onClick={closeMenu}>
          <img src={logo} alt="Chemnitz Logo" className="navbar-logo-img" />
        </Link>

        {/* Desktop Nav */}
        <div className="desktop-nav">
          <div className="nav-links">
            <Link to="/" className={`nav-link${location.pathname === '/' ? ' active' : ''}`}> <Home size={18}/> Home </Link>
            <Link to="/about" className={`nav-link${location.pathname === '/about' ? ' active' : ''}`}> <Info size={18}/> About </Link>
            <Link to="/shop" className={`nav-link${location.pathname === '/shop' ? ' active' : ''}`}> <ShoppingBag size={18}/> Shop </Link>
            <Link to="/explore" className={`nav-link${location.pathname === '/explore' ? ' active' : ''}`}> <Compass size={18}/> Explore </Link>
            {token ? (
              <>
                <Link to="/profile" className={`nav-link${location.pathname === '/profile' ? ' active' : ''}`}> <User size={18}/> Profile </Link>
                <button className="nav-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className={`nav-link${location.pathname === '/login' ? ' active' : ''}`}> <LogIn size={18}/> Login </Link>
                <Link to="/register" className="nav-button"> <UserPlus size={18}/> Register </Link>
              </>
            )}
          </div>
        </div>

        {/* Hamburger */}
        <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu" tabIndex={0}>
          {isMenuOpen ? <X size={27}/> : <Menu size={27}/>}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu${isMenuOpen ? ' show' : ''}`}>
        <div className="mobile-nav-links">
          <Link to="/" className={`mobile-nav-link${location.pathname === '/' ? ' active' : ''}`} onClick={closeMenu}><Home size={18}/> Home</Link>
          <Link to="/about" className={`mobile-nav-link${location.pathname === '/about' ? ' active' : ''}`} onClick={closeMenu}><Info size={18}/> About</Link>
          <Link to="/shop" className={`mobile-nav-link${location.pathname === '/shop' ? ' active' : ''}`} onClick={closeMenu}><ShoppingBag size={18}/> Shop</Link>
          <Link to="/explore" className={`mobile-nav-link${location.pathname === '/explore' ? ' active' : ''}`} onClick={closeMenu}><Compass size={18}/> Explore</Link>
          {token ? (
            <>
              <Link to="/profile" className={`mobile-nav-link${location.pathname === '/profile' ? ' active' : ''}`} onClick={closeMenu}><User size={18}/> Profile</Link>
              <button className="mobile-nav-link" style={{ background: "none", border: "none", textAlign: "left" }} onClick={() => {handleLogout(); closeMenu();}}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={`mobile-nav-link${location.pathname === '/login' ? ' active' : ''}`} onClick={closeMenu}><LogIn size={18}/> Login</Link>
              <Link to="/register" className="mobile-nav-link" onClick={closeMenu}><UserPlus size={18}/> Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
