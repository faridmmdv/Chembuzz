import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import './Hero.css';

const bgImage = "https://bilder.deutschlandfunk.de/88/5f/40/26/885f4026-446b-4018-9802-b67edf2c6deb/chemnitz-110-1920x1080.jpg";

const Hero = () => {
  const navigate = useNavigate(); 

  return (
    <section className="hero">
      <div className="hero-background">
        <img src={bgImage} alt="Chemnitz" className="hero-image" />
        <div className="hero-overlay"></div>
        <div className="hero-gradient"></div>
      </div>
      {/* Animated particles */}
      <div className="hero-particles">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
      <div className="hero-content">
        <div className="hero-icon">
          <Sparkles className="sparkles-icon" />
        </div>
        <h1 className="hero-title">
          <span className="hero-title-main">Explore</span>
          <span className="hero-title-sub">Chemnitz 2025</span>
          <span className="hero-title-caption">European Capital of Culture</span>
        </h1>
        <p className="hero-description">
          Discover the vibrant cultural heart of Europe. Experience art, history, and innovation in Chemnitz – where tradition meets modernity in 2025.
        </p>
        <div className="hero-buttons">
          <a
            href="https://www.chemnitz2025.de"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-button-primary"
          >
            <span>Explore Culture</span>
            <ArrowRight className="button-arrow" />
            <div className="button-glow"></div>
          </a>
          <button
            className="hero-button-secondary"
            onClick={() => navigate('/about')}
          >
            Learn More
          </button>
        </div>
      </div>
      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="scroll-mouse">
          <div className="scroll-wheel"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
