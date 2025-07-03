import React, { useState, useEffect } from 'react';
import './Profile.css';
import Navbar from '../../Components/Navbar/Navbar';
import defaultAvatar from '../../assets/default.png';
import cover from '../../assets/cover.png';
import restaurant from '../../assets/restaurant.png';
import museum from '../../assets/museum.png';
import gallery from '../../assets/gallery.png';
import artwork from '../../assets/artwork.png';
import hotel from '../../assets/hotel.png';
import guesthouse from '../../assets/guest_house.png';
import theatre from '../../assets/theatre.png';
import { useNavigate } from 'react-router-dom';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


function csvToArray(text) {
  let delimiter = ',';
  if ((text.match(/;/g) || []).length > (text.match(/,/g) || []).length) delimiter = ';';
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter(l => l.trim().length);
  const header = lines[0].split(delimiter).map(s => s.trim());
  return lines.slice(1).map(line => {
    const arr = [];
    let inQuotes = false, field = '', i = 0;
    while (i < line.length) {
      if (line[i] === '"') inQuotes = !inQuotes;
      else if (line[i] === delimiter && !inQuotes) {
        arr.push(field); field = '';
      } else field += line[i];
      i++;
    }
    arr.push(field);
    return Object.fromEntries(arr.map((val, idx) => [header[idx], val.trim()]));
  });
}

const getFallbackImage = (type) => {
  switch (type) {
    case 'restaurant': return restaurant;
    case 'museum': return museum;
    case 'gallery': return gallery;
    case 'artwork': return artwork;
    case 'hotel': return hotel;
    case 'guest_house': return guesthouse;
    case 'theatre': return theatre;
    default: return restaurant;
  }
};

const toRad = deg => deg * (Math.PI / 180);
const calcDistance = (loc1, loc2) => {
  if (!loc1 || !loc2) return null;
  const R = 6371;
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLon = toRad(loc2.lng - loc1.lng);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

function projToLatLng(x, y) {
  const a = 6378137.0, f = 1 / 298.257223563;
  const k0 = 0.9996, e = Math.sqrt(f * (2 - f));
  const e1sq = e * e / (1 - e * e);
  const lon0 = 15;
  const x0 = 500000, y0 = 0;
  const x_ = x - x0, y_ = y - y0;
  const M = y_ / k0;
  const mu = M / (a * (1 - e * e / 4 - 3 * e ** 4 / 64 - 5 * e ** 6 / 256));
  const e1 = (1 - Math.sqrt(1 - e * e)) / (1 + Math.sqrt(1 - e * e));
  const j1 = (3 * e1 / 2 - 27 * e1 ** 3 / 32);
  const j2 = (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32);
  const j3 = (151 * e1 ** 3 / 96);
  const j4 = (1097 * e1 ** 4 / 512);
  const fp = mu + j1 * Math.sin(2 * mu) + j2 * Math.sin(4 * mu) + j3 * Math.sin(6 * mu) + j4 * Math.sin(8 * mu);
  const C1 = e1sq * Math.cos(fp) ** 2;
  const T1 = Math.tan(fp) ** 2;
  const R1 = a * (1 - e * e) / Math.pow(1 - e * e * Math.sin(fp) ** 2, 1.5);
  const N1 = a / Math.sqrt(1 - e * e * Math.sin(fp) ** 2);
  const D = x_ / (N1 * k0);
  let lat = fp - (N1 * Math.tan(fp) / R1) * (D ** 2 / 2 -
    (5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * e1sq) * D ** 4 / 24 +
    (61 + 90 * T1 + 298 * C1 + 45 * T1 ** 2 - 252 * e1sq - 3 * C1 ** 2) * D ** 6 / 720);
  let lon = lon0 + (D -
    (1 + 2 * T1 + C1) * D ** 3 / 6 +
    (5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * e1sq + 24 * T1 ** 2) * D ** 5 / 120
  ) / Math.cos(fp);
  lat = lat * 180 / Math.PI;
  lon = lon * 180 / Math.PI;
  return { lat, lng: lon };
}

const TABS = [
  { id: 'favorites', label: 'My Favourites' },
  { id: 'visited', label: 'Visited' },
  { id: 'settings', label: 'Settings' }
];

const WALK_SPEED = 5;    // km/h
const BUS_SPEED = 18;    // km/h

const Profile = () => {
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [favorites, setFavorites] = useState([]);
  const [visited, setVisited] = useState([]);
  const [userInfo, setUserInfo] = useState({
    name: '', email: '', country: '', gender: '', dob: '', profile_image: '', interests: []
  });
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [locationError, setLocationError] = useState('');
  const [distances, setDistances] = useState({});
  const [visitedDistances, setVisitedDistances] = useState({});
  const [tab, setTab] = useState('favorites');
  const navigate = useNavigate();
  const [busStops, setBusStops] = useState([]);
  const [showModal, setShowModal] = useState(false);

  
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [routeStep, setRouteStep] = useState(0); 
  const [selectedMinutes, setSelectedMinutes] = useState('');
  const [routeResults, setRouteResults] = useState([]);
  const [routeMsg, setRouteMsg] = useState('');

  // Review state
  const [reviewingPlace, setReviewingPlace] = useState(null);
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Load bus stops CSV (Parkplätze_Reisebus.csv)
  useEffect(() => {
    fetch('/data/Parkplätze_Reisebus.csv')
      .then(r => r.text())
      .then(text => {
        const arr = csvToArray(text);
        setBusStops(
          arr.map(stop => ({
            ...stop,
            latlng: projToLatLng(parseFloat(stop.X), parseFloat(stop.Y)),
            name: stop.LAGE || stop.OBJECTID
          }))
        );
      }).catch(() => setBusStops([]));
  }, []);

  // Load favorites and visited and profile
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8000/api/my-places/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setFavorites(data));
    fetch('http://localhost:8000/api/my-visited/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setVisited(data));
    fetch('http://localhost:8000/api/profile/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setUserInfo(data);
        setAvatar(data.profile_image || defaultAvatar);
      });
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setLocation(coords);
        setLocationError('');
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`)
          .then(res => res.json())
          .then(data => {
            const a = data.address;
            const parts = [
              a.road, a.house_number, a.suburb, a.city || a.town || a.village, a.postcode
            ].filter(Boolean);
            setAddress(parts.join(', ') || data.display_name || 'Unknown Location');
          }).catch(() => setAddress('Unknown Location'));
      },
      () => {
        setLocationError("Location not available. Allow location access in your browser for distance calculation.");
      }
    );
  }, []);

  useEffect(() => {
    if (!location || !favorites.length) return;
    const newDistances = {};
    favorites.forEach(place => {
      const lat = place.lat || place.latitude || (place.coordinates ? place.coordinates[1] : null);
      const lng = place.lng || place.longitude || (place.coordinates ? place.coordinates[0] : null);
      if (lat && lng) {
        newDistances[place.id] = calcDistance(location, { lat: parseFloat(lat), lng: parseFloat(lng) });
      } else {
        newDistances[place.id] = null;
      }
    });
    setDistances(newDistances);
  }, [location, favorites]);

  useEffect(() => {
    if (!location || !visited.length) return;
    const newDistances = {};
    visited.forEach(place => {
      const lat = place.lat || place.latitude || (place.coordinates ? place.coordinates[1] : null);
      const lng = place.lng || place.longitude || (place.coordinates ? place.coordinates[0] : null);
      if (lat && lng) {
        newDistances[place.id] = calcDistance(location, { lat: parseFloat(lat), lng: parseFloat(lng) });
      } else {
        newDistances[place.id] = null;
      }
    });
    setVisitedDistances(newDistances);
  }, [location, visited]);

  function findNearestStop(pos) {
    if (!busStops.length) return null;
    let minDist = Infinity, bestStop = null;
    for (let stop of busStops) {
      if (!stop.latlng || !stop.latlng.lat || !stop.latlng.lng) continue;
      const d = calcDistance(pos, stop.latlng);
      if (d < minDist) {
        minDist = d;
        bestStop = stop;
      }
    }
    return { ...bestStop, distance: minDist };
  }

  // ----- New: Excel Export with Modal Options -----
  const handleExportExcelOption = () => {
    setRouteModalOpen(true);
    setRouteStep(0);
    setRouteMsg('');
    setSelectedMinutes('');
    setRouteResults([]);
  };

  // --- New: Route Calculation (fix: allow direct walk) ---
  function getRouteETAMinutes(userLoc, place, stops) {
    const dest = {
      lat: place.lat || place.latitude || (place.coordinates ? place.coordinates[1] : null),
      lng: place.lng || place.longitude || (place.coordinates ? place.coordinates[0] : null)
    };
    if (!dest.lat || !dest.lng) return null;

    // Direct walk distance (in km and min)
    const walkDist = calcDistance(userLoc, dest);
    const walkEta = walkDist ? Math.round((walkDist / WALK_SPEED) * 60) : null;

    // Now, try via bus stops (if bus stops available)
    let viaBusEta = null;
    let walk1 = null, bus = null, walk2 = null, userStop = null, destStop = null;
    if (stops && stops.length) {
      userStop = findNearestStop(userLoc);
      destStop = findNearestStop(dest);
      walk1 = userStop ? calcDistance(userLoc, userStop.latlng) : null;
      bus = (userStop && destStop) ? calcDistance(userStop.latlng, destStop.latlng) : null;
      walk2 = destStop ? calcDistance(destStop.latlng, dest) : null;
      if (walk1 != null && bus != null && walk2 != null) {
        const etaWalk1 = Math.round((walk1 / WALK_SPEED) * 60);
        const etaBus = Math.round((bus / BUS_SPEED) * 60);
        const etaWalk2 = Math.round((walk2 / WALK_SPEED) * 60);
        viaBusEta = etaWalk1 + etaBus + etaWalk2;
      }
    }

    // Return minimal ETA and route breakdown
    if (walkEta !== null && (walkEta <= 20 || !viaBusEta || walkEta < viaBusEta)) {
      
      return { eta: walkEta, mode: 'walk', steps: [{ type: 'Walk', from: 'Your location', to: place.name, dist: walkDist, eta: walkEta }] };
    } else if (viaBusEta !== null) {
      return {
        eta: viaBusEta, mode: 'bus',
        steps: [
          { type: "Walk", from: "Your location", to: userStop?.name || "", dist: walk1, eta: walk1 ? Math.round((walk1 / WALK_SPEED) * 60) : null },
          { type: "Bus", from: userStop?.name || "", to: destStop?.name || "", dist: bus, eta: bus ? Math.round((bus / BUS_SPEED) * 60) : null },
          { type: "Walk", from: destStop?.name || "", to: place.name, dist: walk2, eta: walk2 ? Math.round((walk2 / WALK_SPEED) * 60) : null }
        ]
      };
    }
    return null;
  }

  
  const handleRouteTimeConfirm = () => {
    if (!location) {
      setRouteMsg('Enable your location to create a route!');
      return;
    }
    if (!favorites.length) {
      setRouteMsg('No favorites to create a route!');
      return;
    }
    if (!busStops.length) {
      setRouteMsg('Bus stops data not loaded!');
      return;
    }
    const userLoc = location;
    const mins = parseInt(selectedMinutes);
    if (!mins || mins <= 0) {
      setRouteMsg('Please enter a valid number of minutes!');
      return;
    }

    // Filter all favorites
    let ok = [];
    favorites.forEach(place => {
      const result = getRouteETAMinutes(userLoc, place, busStops);
      if (result && result.eta <= mins) {
        ok.push({ ...place, routeInfo: result });
      }
    });
    setRouteResults(ok);
    setRouteMsg(ok.length === 0
      ? `No favorites can be visited within ${mins} minutes!`
      : `Found ${ok.length} favorites you can visit within ${mins} minutes!`);
    setRouteStep(2);
  };

  // Excel Export for filtered places 
  const handleRouteExcelDownload = () => {
    if (!routeResults.length) {
      setRouteMsg('No favorites found!');
      return;
    }
    let allRows = [];
    routeResults.forEach(place => {
      if (!place.routeInfo) return;
      const fav = place.name;
      place.routeInfo.steps.forEach((step, idx) => {
        allRows.push({
          Favorite: fav,
          Step: `${idx + 1}: ${step.type}`,
          From: step.from,
          To: step.to,
          Distance_km: step.dist ? step.dist.toFixed(2) : '',
          ETA_min: step.eta,
          Mode: step.type
        });
      });
      allRows.push({
        Favorite: fav, Step: 'TOTAL', From: '', To: '', Distance_km: '',
        ETA_min: place.routeInfo.eta, Mode: place.routeInfo.mode
      });
    });
    const ws = XLSX.utils.json_to_sheet(allRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "QuickRoutes");
    const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "quick_routes.xlsx");
  };

  

  const handleModalBgClick = (e) => {
    if (e.target.className.includes('modal-bg')) setShowModal(false);
  };

  const handleDelete = async (placeId) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:8000/api/delete-place/${placeId}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        localStorage.removeItem('token');
        alert('Your account has been deleted.');
        navigate('/');
      } else {
        alert('Something went wrong deleting your account.');
      }
    } catch (err) {
      alert('Server error. Try again later.');
    }
  };

  
  const handleSubmitReview = async () => {
    if (!reviewStars || !reviewText.trim()) {
      setReviewError('Please provide both a star rating and a review!');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const resp = await fetch(`http://localhost:8000/api/visit-place/${reviewingPlace.id}/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error();
      await fetch(`http://localhost:8000/api/my-visited/`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json()).then(async (visitedArr) => {
        const vis = visitedArr.find(v => v.name === reviewingPlace.name);
        if (vis) {
          await fetch(`http://localhost:8000/api/review/${vis.id}/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ rating: reviewStars, text: reviewText })
          });
        }
        setReviewingPlace(null);
        setReviewStars(0);
        setReviewText('');
        setReviewError('');
        fetch('http://localhost:8000/api/my-places/', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(res => res.json())
          .then(data => setFavorites(data));
        fetch('http://localhost:8000/api/my-visited/', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(res => res.json())
          .then(data => setVisited(data));
      });
    } catch (err) {
      setReviewError('Review failed to submit. Try again.');
    }
  };

  const handleDashboardClick = () => {
    navigate('/competition');
  };

  return (
    <>
      <Navbar />

      {/* --- Route Modal --- */}
      {routeModalOpen && (
        <div className="modal-bg" onClick={e => {
          if (e.target.className.includes('modal-bg')) setRouteModalOpen(false);
        }}>
          <div className="review-modal-content" style={{ minWidth: 380, maxWidth: 500, paddingBottom: 26 }}>
            <div className="review-modal-header" style={{ margin: '-38px -34px 20px -34px' }}>
              <h3 style={{ fontSize: '1.19rem' }}>Route Planner Options</h3>
              <button className="modal-close-btn" onClick={() => setRouteModalOpen(false)}>&times;</button>
            </div>
            {routeStep === 0 && (
              <div>
                <button
                  className="submit-review-btn"
                  style={{ marginBottom: 16 }}
                  onClick={() => setRouteStep(1)}
                >⏱️ Visit in a given timeline</button>
                <div style={{ fontSize: 15, color: '#555', textAlign: 'center', marginBottom: 15 }}>
                  <b>“Visit in a given timeline”</b><br />
                  Get a list of favorites you can visit within a custom time from your location, as an Excel!
                </div>
                {/* More options in the future? */}
                <button
                  className="submit-review-btn"
                  style={{ marginTop: 6, opacity: 0.65, cursor: "not-allowed" }}
                  disabled
                >🛣️ Plan the optimal route <span style={{ color: '#888', fontSize: 13, marginLeft: 5 }}>(Coming soon)</span></button>
              </div>
            )}
            {routeStep === 1 && (
              <div>
                <div style={{ margin: "12px 0 19px 0", fontWeight: 500, fontSize: 15 }}>How many minutes do you have for sightseeing?</div>
                <input
                  type="number"
                  min={1}
                  placeholder="E.g. 45"
                  style={{
                    width: "98%", fontSize: 19, padding: "12px 14px", borderRadius: 10, border: "1.3px solid #1785b6",
                    marginBottom: 19, outline: "none"
                  }}
                  value={selectedMinutes}
                  onChange={e => setSelectedMinutes(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleRouteTimeConfirm(); }}
                />
                <button className="submit-review-btn" style={{ width: "100%" }} onClick={handleRouteTimeConfirm}>Show Results</button>
                {routeMsg && <div style={{ color: routeResults.length ? '#1785b6' : 'red', marginTop: 11, fontSize: 15 }}>{routeMsg}</div>}
              </div>
            )}
            {routeStep === 2 && (
              <div>
                <div style={{ marginBottom: 12, fontSize: 15 }}>
                  {routeMsg}
                </div>
                <div style={{
                  maxHeight: 210, overflowY: "auto", marginBottom: 10
                }}>
                  {routeResults.map((place, idx) => (
                    <div key={place.id} style={{
                      background: "#f9fafb",
                      marginBottom: 7,
                      padding: "10px 14px",
                      borderRadius: 10,
                      boxShadow: "0 1px 6px #1785b622"
                    }}>
                      <div style={{ fontWeight: 600 }}>{place.name}</div>
                      <div style={{ fontSize: 14, color: "#555" }}>ETA: {place.routeInfo.eta} min ({place.routeInfo.mode === "walk" ? "Walk" : "Bus+Walk"})</div>
                      <ul style={{ margin: "7px 0 0 12px", padding: 0, fontSize: 13, color: "#666" }}>
                        {place.routeInfo.steps.map((s, i) => (
                          <li key={i}>
                            {s.type}: {s.from} → {s.to} ({s.dist ? `${s.dist.toFixed(2)} km` : '-'}, {s.eta} min)
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <button
                  className="submit-review-btn"
                  onClick={handleRouteExcelDownload}
                  disabled={routeResults.length === 0}
                >Download Excel</button>
                <button
                  className="submit-review-btn"
                  style={{ marginTop: 7, background: "#bbb", color: "#fff" }}
                  onClick={() => setRouteStep(0)}
                >Back</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingPlace && (
        <div className="modal-bg" onClick={e => {
          if (e.target.className.includes('modal-bg')) setReviewingPlace(null);
        }}>
          <div className="review-modal-content">
            <div className="review-modal-header">
              <h3>
                Review <b>{reviewingPlace.name}</b>
              </h3>
              <button className="modal-close-btn" onClick={() => setReviewingPlace(null)}>&times;</button>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div className="star-row">
                {[1, 2, 3, 4, 5].map(n =>
                  <span
                    className={`star${reviewStars >= n ? ' filled' : ''}`}
                    key={n}
                    onClick={() => setReviewStars(n)}
                  >★</span>
                )}
              </div>
              <textarea
                className="review-textarea"
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
              />
              {reviewError && <div style={{ color: 'red', margin: '7px 0' }}>{reviewError}</div>}
              <button
                className="submit-review-btn"
                onClick={handleSubmitReview}
                disabled={!reviewStars || !reviewText.trim()}
              >Submit Review</button>
            </div>
          </div>
        </div>
      )}

      <div className="profile-header">
        <div className="cover-photo-container">
          <img src={cover} alt="Cover" className="cover-photo" />
          <div className="cover-overlay"></div>
        </div>
        <div className="profile-info-container row-layout">
          <div className="profile-picture-container left-align">
            <img
              src={avatar}
              alt={userInfo.name}
              className="profile-picture"
              onClick={() => setShowModal(true)}
              style={{ cursor: "zoom-in" }}
              title="Click to enlarge"
            />
          </div>
          <div className="profile-details left-align-details">
            <div className="profile-main-info">
              <div className="name-verification">
                <h1 className="profile-name">{userInfo.name}</h1>
              </div>
              <div className="location-info">
                <span className="location-text">
                  {userInfo.country}
                  {address && (
                    <span style={{ marginLeft: 8, fontSize: 14, color: '#666' }}>
                      | {address}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="create-route-btn-container">
            <button className="create-route-btn" onClick={handleExportExcelOption}>
              🚌 Create a Route (Excel)
            </button>
          </div>
        </div>
      </div>
      {/* --- NAV TABS --- */}
      <div className="navigation-tabs">
        <div className="tabs-container">
          {TABS.map(tabObj => (
            <button
              key={tabObj.id}
              onClick={() => setTab(tabObj.id)}
              className={`tab-button ${tab === tabObj.id ? 'tab-active' : ''}`}
            >
              {tabObj.label}
              {tabObj.id === 'favorites' && <span className="tab-count">({favorites.length})</span>}
              {tabObj.id === 'visited' && <span className="tab-count">({visited.length})</span>}
            </button>
          ))}
          <div style={{ flex: 1 }}></div>
          {/* Dashboard tab on the right */}
          <button
            className="tab-button dashboard-tab"
            style={{ marginLeft: 'auto', marginRight: 30 }}
            onClick={handleDashboardClick}
          >
            🏆 Dashboard
          </button>
        </div>
      </div>
      <div className="tab-content-container">
        {tab === 'favorites' && (
          <div className="favorites-section">
            <h2 className="section-title">My Favourites ({favorites.length})</h2>
            <div className="hotels-grid">
              {favorites.map((place, i) => (
                <div key={i} className="hotel-card">
                  <div className="hotel-image-container">
                    <img
                      src={place.image || getFallbackImage(place.tourism || place.amenity)}
                      alt={place.name}
                      className="hotel-image"
                    />
                  </div>
                  <div className="hotel-content">
                    <h3 className="hotel-name">{place.name}</h3>
                    <div className="hotel-details">
                      <div className="location-section">
                        <span>{place.street}, {place.city}, {place.postcode}</span>
                        {location ? (
                          typeof distances[place.id] === "number" ? (
                            <span style={{ marginLeft: 10, color: '#1785b6' }}>Distance: {distances[place.id].toFixed(2)} km</span>
                          ) : (
                            <span style={{ marginLeft: 10, color: '#e24a4a' }}>Distance: N/A</span>
                          )
                        ) : null}
                      </div>
                      {location && typeof distances[place.id] === "number" && (
                        <div style={{ marginTop: 2, color: "#6b7280", fontSize: 13 }}>
                          ETA: 🚶 {Math.round((distances[place.id] / 5) * 60)}min&nbsp; | &nbsp;🚌 {Math.round((distances[place.id] / 18) * 60)}min&nbsp; | &nbsp;🚗 {Math.round((distances[place.id] / 40) * 60)}min
                        </div>
                      )}
                    </div>
                    {place.website && (
                      <a href={place.website.startsWith('http') ? place.website : `https://${place.website}`} target="_blank" rel="noreferrer" style={{ marginTop: 4, display: 'inline-block' }}>Visit Website</a>
                    )}
                    <div style={{ display: 'flex', gap: 7, marginTop: 8 }}>
                      <button className="delete-btn" onClick={() => handleDelete(place.id)}>Delete</button>
                      <button className="visited-btn" title="Mark as visited"
                        onClick={() => setReviewingPlace(place)}
                        style={{
                          marginLeft: 0, background: '#10b981', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: '7px', fontSize: 14, cursor: 'pointer'
                        }}
                      >Mark as Visited</button>
                    </div>
                  </div>
                </div>
              ))}
              {favorites.length === 0 && (
                <div style={{ color: '#aaa', fontSize: 17, padding: '30px 0' }}>No favorites saved yet.</div>
              )}
            </div>
          </div>
        )}
        {tab === 'visited' && (
          <div className="favorites-section">
            <h2 className="section-title">Visited Places ({visited.length})</h2>
            <div className="hotels-grid">
              {visited.map((place, i) => (
                <div key={i} className="hotel-card">
                  <div className="visited-badge">Visited</div>
                  <div className="hotel-image-container">
                    <img
                      src={place.image || getFallbackImage(place.tourism || place.amenity)}
                      alt={place.name}
                      className="hotel-image"
                    />
                  </div>
                  <div className="hotel-content">
                    <h3 className="hotel-name">{place.name}</h3>
                    <div className="hotel-details">
                      <div className="location-section">
                        <span>{place.street}, {place.city}, {place.postcode}</span>
                        {location ? (
                          typeof visitedDistances[place.id] === "number" ? (
                            <span style={{ marginLeft: 10, color: '#1785b6' }}>Distance: {visitedDistances[place.id].toFixed(2)} km</span>
                          ) : (
                            <span style={{ marginLeft: 10, color: '#e24a4a' }}>Distance: N/A</span>
                          )
                        ) : null}
                      </div>
                      {place.review ? (
                        <>
                          <div className="star-row" style={{ pointerEvents: 'none', fontSize: 20, marginBottom: 5 }}>
                            {[1, 2, 3, 4, 5].map(n =>
                              <span key={n} className={`star${place.review.rating >= n ? ' filled' : ''}`}
                                style={{ color: place.review.rating >= n ? '#f97316' : '#e5e7eb' }}>★</span>
                            )}
                          </div>
                          <div className="review-text" style={{ marginTop: 4, fontSize: 14 }}>{place.review.text}</div>
                        </>
                      ) : (
                        <div style={{ color: '#888', fontSize: 14, marginTop: 5 }}>No review submitted.</div>
                      )}
                      {place.website && (
                        <a href={place.website.startsWith('http') ? place.website : `https://${place.website}`} target="_blank" rel="noreferrer" style={{ marginTop: 4, display: 'inline-block' }}>Visit Website</a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {visited.length === 0 && (
                <div style={{ color: '#aaa', fontSize: 17, padding: '30px 0' }}>No visited places yet.</div>
              )}
            </div>
          </div>
        )}
        {tab === 'settings' && (
          <div className="tab-content">
            <h2 className="section-title">Account Settings</h2>
            <div style={{
              background: "#f9fafb",
              padding: "24px 32px",
              borderRadius: "18px",
              maxWidth: "500px",
              margin: "0 auto",
              boxShadow: "0 1px 6px rgba(23,133,182,0.08)"
            }}>
              <div style={{ marginBottom: 10 }}><b>Name:</b> {userInfo.name}</div>
              <div style={{ marginBottom: 10 }}><b>Email:</b> {userInfo.email}</div>
              <div style={{ marginBottom: 10 }}><b>Country:</b> {userInfo.country}</div>
              <div style={{ marginBottom: 10 }}><b>Gender:</b> {userInfo.gender}</div>
              <div style={{ marginBottom: 10 }}><b>Date of Birth:</b> {userInfo.dob}</div>
              <div className="action-buttons" style={{ marginTop: 24 }}>
                <button className="update-btn" onClick={() => navigate('/update')}>Update Profile</button>
                <button className="delete-account-btn" onClick={handleAccountDelete}>Delete Account</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Profile image modal */}
      {showModal && (
        <div className="modal-bg" onClick={handleModalBgClick}>
          <div className="modal-img-content">
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>&times;</button>
            <img src={avatar} alt={userInfo.name} className="modal-profile-img" />
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
