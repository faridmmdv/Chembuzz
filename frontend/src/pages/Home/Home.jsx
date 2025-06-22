import React from 'react';
import Hero from '../../components/Hero/Hero';
import Footer from '../../Components/Footer/Footer';
import Navbar from '../../Components/Navbar/Navbar';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <Navbar className="home-navbar" />
      <Hero />
      <Footer />
    </div>
  );
};

export default Home;