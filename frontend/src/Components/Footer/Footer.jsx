import React from 'react';
import { Heart, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      {/* Brand Section */}
      <div className="footer-brand">
        <div className="brand-header">
          <MapPin className="brand-icon" />
          <h3 className="brand-title">ChemBuzz</h3>
        </div>
        <p className="brand-subtitle">Chemnitz 2025 - European Capital of Culture</p>
        <p className="brand-description">
          Discover the cultural renaissance of Chemnitz. Experience art, innovation, and heritage.
        </p>
      </div>
      {/* Bottom Section */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="copyright">
            © 2025 ChemBuzz - Chemnitz European Capital of Culture. All rights reserved.
          </p>
          <p className="made-with">
            Made with <Heart size={16} className="heart-icon" /> for Chemnitz 2025
          </p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
