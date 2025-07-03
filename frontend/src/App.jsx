// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingAnimation from './Components/LoadingAnimation';
import Navbar from './Components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Explore from './pages/Explore/Explore';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Profile from './pages/Profile/Profile'
import About from  './pages/About/About'
import Update from './pages/Update/UpdateProfile'
import Competition from './pages/Competition/Competition';
import Shop from './pages/Shop/Shop';

const App = () => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <LoadingAnimation onComplete={() => setLoading(false)} />}
      {!loading && (
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/update" element={<Update />} />
            <Route path="/competition" element={<Competition />} />
            <Route path="/shop" element={<Shop />} />
          </Routes>
        </Router>
      )}
    </>
  );
};

export default App;
