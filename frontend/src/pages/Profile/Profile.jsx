import React, { useState, useEffect } from 'react';
import './Profile.css';
import Navbar from '../../Components/Navbar/Navbar';
import defaultAvatar from '../../assets/default.png';
import background from '../../assets/background.png';
import restaurant from '../../assets/restaurant.png';
import museum from '../../assets/museum.png';
import gallery from '../../assets/gallery.png';
import artwork from '../../assets/artwork.png';
import hotel from '../../assets/hotel.png';
import guesthouse from '../../assets/guest_house.png';
import theatre from '../../assets/theatre.png';
import { useNavigate } from 'react-router-dom';

const getFallbackImage = (type) => {
  switch (type) {
    case 'restaurant': return restaurant;
    case 'museum': return museum;
    case 'gallery': return gallery;
    case 'artwork': return artwork;
    case 'hotel': return hotel;
    case 'guest_house': return guesthouse;
    case 'theatre': return theatre;
    default: return background;
  }
};

const Profile = () => {
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [favorites, setFavorites] = useState([]);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    country: '',
    gender: '',
    dob: '',
    profile_image: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('http://localhost:8000/api/my-places/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setFavorites(data));

    fetch('http://localhost:8000/api/profile/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setUserInfo(data);
        setAvatar(data.profile_image || defaultAvatar);
      });
  }, []);

  const handleDelete = async (placeId) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:8000/api/delete-place/${placeId}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setFavorites(favorites.filter(p => p.id !== placeId));
  };

  const handleAccountDelete = async () => {
    const confirm = window.confirm('⚠️ Are you sure you want to delete your account? This action is irreversible.');
    if (!confirm) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/delete-account/', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        localStorage.removeItem('token');
        alert('Your account has been deleted.');
        navigate('/');
      } else {
        alert('Something went wrong deleting your account.');
      }
    } catch (err) {
      console.error(err);
      alert('Server error. Try again later.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <div className="left-panel">
          <div className="info-box">
            <div className="avatar-section">
              <img src={avatar} alt="Avatar" className="profile-avatar" />
              <div>
                <h2>{userInfo.name}</h2>
                <p><b>📧 Email:</b> {userInfo.email}</p>
                <p><b>🌍 Country:</b> {userInfo.country}</p>
                <p><b>🚻 Gender:</b> {userInfo.gender}</p>
                <p><b>🎂 Date of Birth:</b> {userInfo.dob}</p>
              </div>
            </div>
            <div className="action-buttons">
              <button className="update-btn" onClick={() => navigate('/update')}>Update Profile</button>
              <button className="delete-account-btn" onClick={handleAccountDelete}>Delete Account</button>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <h3 className="favorites-title">My Favourites ({favorites.length})</h3>
          <div className="favorites-grid">
            {favorites.map((place, i) => (
              <div key={i} className="fav-card">
                <img src={place.image || getFallbackImage(place.tourism || place.amenity)} alt={place.name} />
                <div className="fav-details">
                  <h4>{place.name}</h4>
                  <p>{place.street}, {place.city}, {place.postcode}</p>
                  {place.phone && <p>📞 {place.phone}</p>}
                  {place.website && (
                    <a href={place.website.startsWith('http') ? place.website : `https://${place.website}`} target="_blank" rel="noreferrer">Visit Website</a>
                  )}
                  <button className="delete-btn" onClick={() => handleDelete(place.id)}>❌ Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
