import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© 2025 ChemBuzz | Made with ❤️ in Chemnitz</p>
        <ul className="footer-links">
          <li><a href="/about">About</a></li>
          <li><a href="/explore">Explore</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;