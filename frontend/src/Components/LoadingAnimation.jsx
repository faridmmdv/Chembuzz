import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Award, Users } from 'lucide-react';
import './LoadingAnimation.css';

const LoadingAnimation = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [showText, setShowText] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 900); 
          return 100;
        }
        return prev + 2;
      });
    }, 38);

    setTimeout(() => setShowText(true), 700);
    setTimeout(() => setPhase(1), 1700);
    setTimeout(() => setPhase(2), 3200);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="loading-root">
      {/* Cultural Particles */}
      <div className="loading-bg-particles">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="loading-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            <div className="particle-icon">C</div>
          </div>
        ))}
      </div>
      {/* Connections */}
      <div className="loading-bg-connections">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="loading-connection"
            style={{
              left: `${Math.random() * 80}%`,
              top: `${Math.random() * 80}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>
      {/* Centered Content */}
      <div className="loading-center">
        {/* Spinning Logo */}
        <div className="loading-logo-wrap">
          <div className="loading-ring ring-outer"></div>
          <div className="loading-ring ring-middle"></div>
          <div className="loading-ring ring-inner"></div>
          <div className="loading-logo-center">
            <MapPin className="loading-main-pin" />
          </div>
          <div className="loading-ring-icon icon-calendar">
            <Calendar size={14} />
          </div>
          <div className="loading-ring-icon icon-award">
            <Award size={14} />
          </div>
          <div className="loading-ring-icon icon-users">
            <Users size={14} />
          </div>
          <div className="loading-ring-icon icon-star">
            <span style={{fontSize: 12, color: '#fff'}}>★</span>
          </div>
        </div>
        {/* Text Phases */}
        <div className={`loading-phrase ${showText ? 'show' : ''}`}>
          {phase === 0 && (
            <div>
              <h1 className="loading-title">
                {['C','H','E','M','B','U','Z','Z'].map((l, i) => (
                  <span key={i} style={{
                    animationDelay: `${i*0.09}s`
                  }} className="loading-title-letter">{l}</span>
                ))}
              </h1>
              <p className="loading-desc">
                <MapPin size={20} className="loading-desc-icon" />
                Discovering Chemnitz Culture...
              </p>
            </div>
          )}
          {phase === 1 && (
            <div>
              <h1 className="loading-title phase">
                <span className="gradient-pulse">CHEMNITZ</span>
                <br />
                <span className="phase-date">2025</span>
              </h1>
              <p className="loading-desc">
                <Award size={20} className="loading-desc-icon" />
                European Capital of Culture
              </p>
            </div>
          )}
          {phase === 2 && (
            <div>
              <h1 className="loading-title phase">
                <span className="gradient-pulse-green">WELCOME</span>
              </h1>
              <p className="loading-desc">
                <Users size={20} className="loading-desc-icon" />
                Explore Cultural Heritage!
              </p>
            </div>
          )}
        </div>
        {/* Progress Bar */}
        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{width: `${progress}%`}}></div>
          </div>
          <div className="progress-info">
            <span>{progress.toFixed(0)}%</span>
            <span>ChemBuzz Chemnitz 2025</span>
          </div>
        </div>
        {/* Status Dots */}
        <div className="loading-status">
          <div className={`status-dot${progress > 22 ? ' ready' : ''}`}>Culture</div>
          <div className={`status-dot${progress > 56 ? ' ready' : ''}`}>Heritage</div>
          <div className={`status-dot${progress > 85 ? ' ready' : ''}`}>Experience</div>
        </div>
      </div>
      {/* Confetti effect at 100% */}
      {progress === 100 && (
        <div className="loading-complete-burst">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="loading-burst-dot"
              style={{
                left: `${45 + Math.random() * 10}%`,
                top: `${45 + Math.random() * 10}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: '1.1s'
              }}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoadingAnimation;
