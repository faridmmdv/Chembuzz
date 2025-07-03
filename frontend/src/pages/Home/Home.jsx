import React, { useEffect, useState } from 'react';
import Hero from '../../Components/Hero/Hero';
import Footer from '../../Components/Footer/Footer';
import Navbar from '../../Components/Navbar/Navbar';
import './Home.css';

const Home = () => {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  useEffect(() => {
    
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll && currentScroll > 60) {
        
        setShowNavbar(false);
      } else {
        
        setShowNavbar(true);
      }
      setLastScroll(currentScroll);
    };
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScroll]);

  return (
    <div className="home-page">
      <div style={{ position: 'fixed', width: '100vw', zIndex: 99, top: 0, left: 0, transition: 'transform .4s cubic-bezier(.44,0,.18,1)', transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)' }}>
        <Navbar />
      </div>
      <Hero />
      <Footer />
    </div>
  );
};

export default Home;
