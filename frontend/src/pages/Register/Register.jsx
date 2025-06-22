import React, { useState } from 'react';
import './Register.css';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import countries from './countries'; // ✅ your countries.js

const Register = () => {
  const navigate = useNavigate();
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
    if (form.profileImage) {
      formData.append('profile_image', form.profileImage);
    }

    try {
      const res = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        navigate('/login');
      } else {
        setError(data?.username?.[0] || data?.email?.[0] || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    }
  };

  return (
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
            {countries.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>

          

          <button type="submit">Register</button>
        </form>

        <div className="register-meta">
          Already have an account? <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
