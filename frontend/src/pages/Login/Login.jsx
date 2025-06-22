import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.access);
        navigate('/profile');
      } else {
        setError('Invalid credentials');
      }
    } catch {
      setError('Server error');
    }
  };

  return (
    <div className="login-white-page">
      <div className="back-arrow" onClick={() => navigate('/')}>
        <FiArrowLeft size={24} />
      </div>

      <div className="login-box">
        <h2>Welcome Back 👋</h2>
        <p>Please login to continue</p>
        <form onSubmit={handleLogin}>
          <input name="username" onChange={handleChange} placeholder="Username or Email" required />
          <input name="password" type="password" onChange={handleChange} placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="login-meta">
          <a href="#">Forgot Password?</a>
          <span> | </span>
          <a href="/register">Create Account</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
