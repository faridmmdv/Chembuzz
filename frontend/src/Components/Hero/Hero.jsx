import React from 'react';
import './Hero.css';
import dark_arrow from '../../assets/dark_arrow.png';

const Hero = () => {
  return (
    <div className='hero'>
      <div className="hero-text">
        <h1>_C_THE <br /> _UNSEEN</h1>
        <p>kulturhauptstadt 2025</p>
        <button className='btn' onClick={() => window.open("https://chemnitz2025.de", "_blank")}>Explore more <img src={dark_arrow} alt="arrow" /></button>
      </div>
    </div>
  );
};

export default Hero;
