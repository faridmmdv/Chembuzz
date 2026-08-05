import React, { useState, useEffect } from 'react';
import './Register.css';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa';
import countries from './countries';


import restaurantIcon from '../../assets/restaurant.png';
import museumIcon from '../../assets/museum.png';
import artworkIcon from '../../assets/artwork.png';
import galleryIcon from '../../assets/gallery.png';
import hotelIcon from '../../assets/hotel.png';
import guestHouseIcon from '../../assets/guest_house.png';
import theatreIcon from '../../assets/theatre.png';

const pngIconMap = {
  restaurant: restaurantIcon,
  museum: museumIcon,
  artwork: artworkIcon,
  gallery: galleryIcon,
  hotel: hotelIcon,
  'guest house': guestHouseIcon,
  theatre: theatreIcon,
};

const interestsList = [
  'museum',
  'gallery',
  'artwork',
  'hotel',
  'restaurant',
  'guest house',
  'theatre',
];

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    dob: '',
    country: '',
    profileImage: null,
  });
  const [error, setError] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);

 
  const [chemnitzPlaces, setChemnitzPlaces] = useState([]);
  const [randomPicks, setRandomPicks] = useState([]);

  useEffect(() => {
    fetch('/data/Chemnitz.geojson')
      .then(res => res.json())
      .then(json => {
        setChemnitzPlaces(json.features.filter(f => f.geometry?.type === "Point"));
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profileImage') {
      setForm({ ...form, profileImage: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    const formData = new FormData();
    formData.append('username', form.username);
    formData.append('email', form.email);
    formData.append('password', form.password);
    formData.append('gender', form.gender);
    formData.append('dob', form.dob);
    formData.append('country', form.country);
    if (form.profileImage) formData.append('profile_image', form.profileImage);

    try {
      const res = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setStep(2);
      } else {
        setError(data?.username?.[0] || data?.email?.[0] || 'Registration failed');
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else if (selectedInterests.length < 3) {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  
  const handleContinueToRandom = () => {
    const picks = [];
    selectedInterests.forEach((category) => {
      
      const candidates = chemnitzPlaces.filter(f => {
        const t = (f.properties.tourism || f.properties.amenity || '').toLowerCase();
        return (
          t === category ||
          t.replace('_', ' ') === category ||
          t.replace(' ', '_') === category
        );
      });
      if (candidates.length > 0) {
        const randomIdx = Math.floor(Math.random() * candidates.length);
        picks.push(candidates[randomIdx]);
      }
    });
    setRandomPicks(picks);
    setStep(3);
  };

  const renderStep1 = () => (
    <div className="register-white-page">
      <div className="back-arrow" onClick={() => navigate('/')}>
        <FiArrowLeft size={24} />
      </div>
      <div className="register-box">
        <h2>Create Account 📝</h2>
        <p>Sign up to get started</p>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="Full Name" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />
          <select name="gender" onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <input type="date" name="dob" onChange={handleChange} required />
          <select name="country" onChange={handleChange} required>
            <option value="">Select Country</option>
            {countries.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
          <button type="submit">Register</button>
        </form>
        <div className="register-meta">
          Already have an account? <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="register-white-page">
      <div className="register-box">
        <h2>Select Your Interests 🎯</h2>
        <p>Pick up to 3 categories</p>
        <div className="interests-grid">
          {interestsList.map((interest, i) => (
            <div
              key={i}
              className={`interest-card ${selectedInterests.includes(interest) ? 'selected' : ''}`}
              onClick={() => toggleInterest(interest)}
              style={selectedInterests.length === 3 && !selectedInterests.includes(interest)
                ? { pointerEvents: 'none', opacity: 0.44 }
                : {}}
            >
              {interest}
            </div>
          ))}
        </div>
        <button
          className="continue-btn"
          disabled={selectedInterests.length === 0}
          onClick={handleContinueToRandom}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
  <div className="register-white-page">
    <div className="register-box" style={{ boxShadow: 'none', background: 'transparent', padding: 0, maxWidth: '100%' }}>
      <h2 style={{ marginBottom: 24, marginTop: 0, fontWeight: 700, fontSize: 32, textAlign: 'center' }}>
        Discover for You <span role="img" aria-label="eyes">👀</span>
      </h2>
      <div className="random-cards-grid">
        {randomPicks.map((f, i) => {
          const props = f.properties;
          const type = (props.tourism || props.amenity || '').toLowerCase();
          const iconKey = type.replace('_', ' ');
          const img = props.image || pngIconMap[iconKey];
          return (
            <div className="random-result-card-grid" key={i} style={{ animationDelay: `${i * 0.11}s` }}>
              <img src={img} alt={props.name || "Cultural Site"} />
              <div className="random-details-grid">
                <h4>{props.name || <span style={{ opacity: 0.6 }}>[no name]</span>}</h4>
                <p>
                  {(props['addr:street'] ? props['addr:street'] + ', ' : '')}
                  {props['addr:postcode'] || ''} {props['addr:city'] || ''}
                </p>
                <span className="category-label">{selectedInterests[i]}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="explore-more-line">
        <span>Explore for more with</span>
        <span className="chembuzz-glow">CHEMBUZZ</span>
      </div>
      <button className="continue-btn" style={{ marginTop: 36 }} onClick={() => setStep(4)}>
        Next
      </button>
    </div>
  </div>
);

  const renderStep4 = () => (
    <div className="register-white-page">
      <div className="register-box">
        <h2>Follow Us for Updates 📢</h2>
        <p>Stay connected with us</p>
        <div className="social-icons">
          <a href="https://instagram.com/yourprofile" target="_blank" rel="noreferrer">
            <FaInstagram size={30} />
          </a>
          <a href="https://facebook.com/yourprofile" target="_blank" rel="noreferrer">
            <FaFacebook size={30} />
          </a>
          <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noreferrer">
            <FaLinkedin size={30} />
          </a>
        </div>
        <button className="skip-btn" onClick={() => navigate('/login')}>
          Skip
        </button>
      </div>
    </div>
  );

  return (
    <>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </>
  );
};

export default Register;
