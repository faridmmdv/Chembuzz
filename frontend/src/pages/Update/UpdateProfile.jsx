import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './profileUpdate.css';
import defaultAvatar from '../../assets/default.png';

const UpdateProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    gender: '',
    dob: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(defaultAvatar);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8000/api/profile/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          name: data.name || '',
          email: data.email || '',
          country: data.country || '',
          gender: data.gender || '',
          dob: data.dob || '',
        });
        setAvatarPreview(data.profile_image || defaultAvatar);
      });
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const form = new FormData();
    form.append('name', formData.name);
    form.append('email', formData.email);
    form.append('country', formData.country);
    form.append('gender', formData.gender);
    form.append('dob', formData.dob);
    if (avatarFile) form.append('profile_image', avatarFile);

    try {
      const res = await fetch('http://localhost:8000/api/profile/update/', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!res.ok) throw new Error('Update failed');
      navigate('/profile');
    } catch (err) {
      console.error(err);
      setError('Something went wrong while updating your profile.');
    }
  };

  return (
    <div className="profileUpdate">
      <div className="formContainer">
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <h1>Update Profile</h1>
          <div className="item">
            <label htmlFor="name">Full Name:</label>
            <input name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="item">
            <label htmlFor="email">Email:</label>
            <input name="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="item">
            <label htmlFor="country">Country:</label>
            <input name="country" value={formData.country} onChange={handleChange} />
          </div>
          <div className="item">
            <label htmlFor="gender">Gender:</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="item">
            <label htmlFor="dob">Date of Birth:</label>
            <input name="dob" type="date" value={formData.dob} onChange={handleChange} />
          </div>
          <div className="item">
            <label htmlFor="avatar-upload">Profile Image:</label>
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <button type="submit">Update</button>
          {error && <span className="error">{error}</span>}
        </form>
      </div>
      <div className="sideContainer">
        <img src={avatarPreview} alt="Avatar Preview" className="avatar" />
      </div>
    </div>
  );
};

export default UpdateProfile;