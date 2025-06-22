// src/pages/About/About.jsx
import React, { useEffect, useState } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import './About.css';
import img0 from '../../assets/chemnitz_city.png';
import img1 from '../../assets/chemnitz_city1.png';
import img2 from '../../assets/chemnitz_city2.png';
import img3 from '../../assets/chemnitz_city3.png';

const About = () => {
  const [showNavbar, setShowNavbar] = useState(true);
  let lastScrollY = window.scrollY;

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setShowNavbar(currentScrollY < lastScrollY || currentScrollY < 10);
    lastScrollY = currentScrollY;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="about-wrapper">
      {showNavbar && <Navbar />}

      <div className="about-container fade-in">
        {/* 1. Right Image, Left Text */}
        <section className="about-section">
          <div className="about-text">
            <h2>History of Chemnitz</h2>
            <p>
              Chemnitz, formerly known as Karl-Marx-Stadt during the GDR era, has a deep industrial heritage and a resilient spirit.
              It emerged as a hub of textile and engineering industries in the 19th century and has since undergone massive transformation.
              After German reunification, Chemnitz embraced modernization while preserving its East German character and cultural pride.
            </p>
          </div>
          <div className="about-image">
            <img src={img0} alt="History of Chemnitz" />
          </div>
        </section>

        {/* 2. Left Image, Right Text */}
        <section className="about-section reverse">
          <div className="about-image">
            <img src={img1} alt="City Identity" />
          </div>
          <div className="about-text">
            <h2>City Best Known For</h2>
            <p>
              Today, Chemnitz is renowned for its dynamic university life, strong local craftsmanship, and progressive tech community.
              The massive Karl Marx Monument remains an iconic landmark. The city offers a blend of modern art, science, and Saxon traditions.
            </p>
          </div>
        </section>

        {/* 3. Right Image, Left Text */}
        <section className="about-section">
          <div className="about-text">
            <h2>Kulturhauptstadt Europas 2025</h2>
            <p>
              Chemnitz proudly holds the title of European Capital of Culture 2025. This recognition empowers the city to showcase its cultural
              assets, support grassroots arts, and connect with European networks. A surge in festivals, exhibitions, and public projects is expected.
            </p>
          </div>
          <div className="about-image">
            <img src={img2} alt="Cultural Capital" />
          </div>
        </section>

        {/* 4. Left Image, Right Text */}
        <section className="about-section reverse">
          <div className="about-image">
            <img src={img3} alt="Community" />
          </div>
          <div className="about-text">
            <h2>Connecting People & Communities</h2>
            <p>
              Chemnitz is a city of makers, artists, and doers. Through community workshops, urban innovation, and inclusive events,
              the city continues building bridges across neighborhoods and cultures. It invites Europe to co-create its future.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
