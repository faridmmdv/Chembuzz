import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Explore.css';
import { FaRegBookmark, FaBookmark, FaSearch, FaAngleDown, FaAngleUp, FaMapMarkerAlt, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  guest_house: guestHouseIcon,
  theatre: theatreIcon,
};

const pinColors = {
  museum: '#2196f3',
  restaurant: '#ff7043',
  gallery: '#9c27b0',
  hotel: '#4caf50',
  guest_house: '#8bc34a',
  theatre: '#ffca28',
  artwork: '#607d8b',
  default: '#007bff'
};

const getPinIcon = (type) => {
  const color = pinColors[type] || pinColors.default;
  const svg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">
      <path d="M16 0C7.2 0 0 7.2 0 16c0 10.5 12.6 28 14.1 29.7a2 2 0 0 0 2.9 0C19.4 44 32 26.5 32 16 32 7.2 24.8 0 16 0zm0 22a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" fill="${color}"/>
    </svg>`
  );
  return L.icon({
    iconUrl: `data:image/svg+xml,${svg}`,
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -36],
  });
};

const toRadians = (degrees) => degrees * (Math.PI / 180);
const haversineDistance = (coord1, coord2) => {
  const R = 6371;
  const lat1 = toRadians(coord1.lat);
  const lon1 = toRadians(coord1.lng);
  const lat2 = toRadians(coord2.lat);
  const lon2 = toRadians(coord2.lng);
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const renderStars = (rating) => {
  let stars = [];
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  for (let i = 0; i < full; i++) stars.push(<FaStar key={i} color="#fdba2c" />);
  if (hasHalf) stars.push(<FaStarHalfAlt key="half" color="#fdba2c" />);
  for (let i = full + (hasHalf ? 1 : 0); i < 5; i++) stars.push(<FaRegStar key={i + "empty"} color="#ccc" />);
  return stars;
};


const FIELD_LABELS = {
  name: "Name",
  tourism: "Category",
  amenity: "Category",
  "addr:city": "City",
  "addr:postcode": "ZIP",
  "addr:street": "Street",
  "addr:housenumber": "House Number",
  suburb: "District",
  "addr:suburb": "District",
  website: "Website",
  phone: "Phone",
  email: "Email",
  image: "Image",
  opening_hours: "Opening Hours",
  description: "Description",
  architect: "Architect",
  year_of_construction: "Year Built",
  fee: "Entrance Fee",
  cuisine: "Cuisine",
  "contact:facebook": "Facebook",
  "contact:twitter": "Twitter",
  "contact:pinterest": "Pinterest",
  "theatre:genre": "Theatre Genre",
  "diet:vegan": "Vegan",
  "diet:vegetarian": "Vegetarian"
};

const Explore = () => {
  
  const [chemnitzFeatures, setChemnitzFeatures] = useState([]);
  const [sachsenFeatures, setSachsenFeatures] = useState([]);
  const [stadtteileFeatures, setStadtteileFeatures] = useState([]);
  const [geoData, setGeoData] = useState([]);
  const [chemnitzData, setChemnitzData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('all');
  const [zipFilter, setZipFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('Chemnitz');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allZips, setAllZips] = useState([]);
  const [allNames, setAllNames] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [visitedPlaces, setVisitedPlaces] = useState([]);
  const [searchClicked, setSearchClicked] = useState(false);
  const [placeReviews, setPlaceReviews] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [modalReviews, setModalReviews] = useState([]);
  const [modalPlace, setModalPlace] = useState('');
  const mapRef = useRef();
  const markerRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [distanceExpanded, setDistanceExpanded] = useState(false);
  const [fromOption, setFromOption] = useState('');
  const [fromInput, setFromInput] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [fromCoord, setFromCoord] = useState(null);
  const [distances, setDistances] = useState([]);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [distanceError, setDistanceError] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsData, setDetailsData] = useState(null);

  useEffect(() => {
    const loadGeoData = async () => {
      const [chemnitz, sachsen, stadtteile] = await Promise.all([
        fetch('/data/Chemnitz.geojson').then(res => res.json()),
        fetch('/data/Sachsen.geojson').then(res => res.json()),
        fetch('/data/Stadtteile.geojson').then(res => res.json())
      ]);
      // Chemnitz
      const chemnitzList = [];
      const seenChemnitz = new Set();
      chemnitz.features.forEach(f => {
        const name = f.properties.name;
        if (f.geometry?.type === 'Point' && name && !seenChemnitz.has(name)) {
          seenChemnitz.add(name);
          chemnitzList.push(f);
        }
      });
      setChemnitzFeatures(chemnitzList);

      // Sachsen
      const chemnitzNames = new Set(chemnitzList.map(f => f.properties?.name));
      const sachsenList = sachsen.features.filter(f =>
        f.geometry?.type === 'Point' && f.properties?.name && !chemnitzNames.has(f.properties.name)
      );
      setSachsenFeatures(sachsenList);

      // Stadtteile
      const stadtList = [];
      const seenStadt = new Set();
      stadtteile.features.forEach(f => {
        const name = f.properties?.name;
        if (f.geometry?.type === 'Point' && name && !seenStadt.has(name)) {
          seenStadt.add(name);
          stadtList.push(f);
        }
      });
      setStadtteileFeatures(stadtList);

      
      const all = [...chemnitzList, ...sachsenList, ...stadtList];
      setGeoData(all);
      setChemnitzData(chemnitzList);

      
      const chemnitzDistricts = new Set();
      const chemnitzZips = new Set();
      chemnitzList.forEach(f => {
        const props = f.properties;
        if (props.suburb) chemnitzDistricts.add(props.suburb);
        if (props['addr:suburb']) chemnitzDistricts.add(props['addr:suburb']);
        if (props['addr:postcode']) chemnitzZips.add(props['addr:postcode']);
      });
      const allDistricts = new Set();
      const allZips = new Set();
      all.forEach(f => {
        const props = f.properties;
        if (props.suburb) allDistricts.add(props.suburb);
        if (props['addr:suburb']) allDistricts.add(props['addr:suburb']);
        if (props['addr:postcode']) allZips.add(props['addr:postcode']);
      });
      const allCities = new Set();
      all.forEach(f => {
        const c = f.properties['addr:city'];
        if (c) allCities.add(c);
      });
      setAllCities(["Chemnitz", ...Array.from(allCities).filter(x => x !== "Chemnitz")]);
      setAllNames(Array.from(new Set(all.map(f => f.properties.name))).sort());
      setAllDistricts(cityFilter === "Chemnitz" ? Array.from(chemnitzDistricts).sort() : Array.from(allDistricts).sort());
      setAllZips(cityFilter === "Chemnitz" ? Array.from(chemnitzZips).sort() : Array.from(allZips).sort());
    };

    loadGeoData();

    
    const fetchUserPlaces = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        // Saved
        const resSaved = await fetch('http://localhost:8000/api/my-places/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataSaved = await resSaved.json();
        setSavedPlaces(dataSaved.map(p => p.name));
        // Visited
        const resVisited = await fetch('http://localhost:8000/api/my-visited/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataVisited = await resVisited.json();
        setVisitedPlaces(dataVisited.map(p => p.name));
      } catch (e) { /* Ignore error */ }
    };
    fetchUserPlaces();
  }, [cityFilter]);
  const filterData = async () => {
    let results = cityFilter === "Chemnitz" ? chemnitzFeatures : geoData;
    if (category !== 'all') {
      results = results.filter(f =>
        f.properties.tourism?.toLowerCase() === category ||
        f.properties.amenity?.toLowerCase() === category
      );
    }
    if (zipFilter !== 'all') results = results.filter(f => f.properties['addr:postcode'] === zipFilter);
    if (cityFilter !== 'all') results = results.filter(f => (f.properties['addr:city'] || "Chemnitz") === cityFilter);
    if (districtFilter !== 'all') {
      results = results.filter(
        f =>
          f.properties.suburb === districtFilter ||
          f.properties['addr:suburb'] === districtFilter
      );
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        f =>
          f.properties.name?.toLowerCase().includes(term) ||
          f.properties['addr:postcode']?.includes(term)
      );
    }
    
    const seen = new Set();
    const uniqueResults = [];
    results.forEach(f => {
      const name = f.properties.name;
      if (name && !seen.has(name)) {
        seen.add(name);
        uniqueResults.push(f);
      }
    });
    setFiltered(uniqueResults);
    setSearchClicked(true);

    // Fetch reviews
    const fetchAllPlaceReviews = async () => {
      let pr = {};
      for (let f of uniqueResults) {
        const props = f.properties;
        if (!props.name) continue;
        const url = `http://localhost:8000/api/all-reviews/?name=${encodeURIComponent(props.name)}`
          + (props['addr:city'] ? `&city=${encodeURIComponent(props['addr:city'])}` : '')
          + (props['addr:postcode'] ? `&postcode=${encodeURIComponent(props['addr:postcode'])}` : '');
        try {
          const resp = await fetch(url);
          if (resp.ok) {
            const data = await resp.json();
            pr[props.name] = {
              average: data.average || 0,
              reviews: data.reviews || [],
              count: data.reviews?.length || 0
            };
          }
        } catch (e) {}
      }
      setPlaceReviews(pr);
    };
    fetchAllPlaceReviews();

    setTimeout(() => {
      if (uniqueResults.length && mapRef.current) {
        const bounds = L.latLngBounds(
          uniqueResults.map(f => [f.geometry.coordinates[1], f.geometry.coordinates[0]])
        );
        mapRef.current.flyToBounds(bounds, { padding: [50, 50], animate: true, duration: 1.2 });
      }
    }, 100);
  };

  // Chemnitz "from" list for Distance Filter
  const chemnitzNames = chemnitzData.map(f => f.properties.name);

  // GPS or Nominatim for "My Location"
  const fetchMyLocation = () =>
    new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user) return reject("User address not found in local storage.");
            const address = user.street + " " + user.plz;
            fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(address))
              .then(res => res.json())
              .then(data => {
                if (data.length > 0) resolve({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
                else reject("No results found for your address.");
              })
              .catch(() => reject("An error occurred while fetching your location."));
          }
        );
      } else {
        reject("Geolocation not supported.");
      }
    });

  // Distance filter logic (only Chemnitz)
  const handleDistanceSearch = async () => {
    setDistanceError('');
    setDistances([]);
    setDistanceLoading(true);
    let fromCoordVal = null;
    if (fromOption === 'My Location' || fromInput === 'My Location') {
      try {
        fromCoordVal = await fetchMyLocation();
      } catch (e) {
        setDistanceError(typeof e === 'string' ? e : "Couldn't get your location.");
        setDistanceLoading(false);
        return;
      }
    } else if (fromOption) {
      const found = chemnitzData.find(f => f.properties.name === fromOption);
      if (found) fromCoordVal = { lat: found.geometry.coordinates[1], lng: found.geometry.coordinates[0] };
      else {
        setDistanceError("Selected FROM place not found.");
        setDistanceLoading(false);
        return;
      }
    } else if (fromInput) {
      const found = chemnitzData.find(f => f.properties.name.toLowerCase() === fromInput.toLowerCase());
      if (found) fromCoordVal = { lat: found.geometry.coordinates[1], lng: found.geometry.coordinates[0] };
      else {
        setDistanceError("No Chemnitz place found by that name.");
        setDistanceLoading(false);
        return;
      }
    } else {
      setDistanceError("Select or type a FROM location.");
      setDistanceLoading(false);
      return;
    }
    setFromCoord(fromCoordVal);

    const dists = chemnitzData.map((f, idx) => {
      const coords = { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] };
      return {
        idx,
        name: f.properties.name,
        distance: haversineDistance(fromCoordVal, coords),
        f
      };
    });
    const seen = new Set();
    const sorted = dists.filter(d => d.name && !seen.has(d.name) && seen.add(d.name))
      .sort((a, b) => a.distance - b.distance);
    setDistances(sorted);
    setDistanceLoading(false);
  };

  const handleAddToRoute = async (props) => {
    if (savedPlaces.includes(props.name)) {
      toast.info('You have already saved this place!');
      return;
    }
    if (visitedPlaces.includes(props.name)) {
      toast.info('You have already visited this place!');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return toast.warning('Please login to save places');
    const payload = {
      name: props.name,
      tourism: props.tourism,
      amenity: props.amenity,
      city: props['addr:city'],
      postcode: props['addr:postcode'],
      street: props['addr:street'],
      district: props.suburb || props['addr:suburb'],
      website: props.website,
      image: props.image,
      phone: props.phone,
      lat: props.geometry?.coordinates ? props.geometry.coordinates[1] : null,
      lng: props.geometry?.coordinates ? props.geometry.coordinates[0] : null,
    };
    await fetch('http://localhost:8000/api/save-place/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    setSavedPlaces(prev => [...prev, props.name]);
    toast.success('✅ Saved to favorites!');
  };

  const openPopupForIndex = (i, f) => {
    setActiveIndex(i);
    if (markerRefs.current[i]) markerRefs.current[i].openPopup();
    if (mapRef.current) {
      mapRef.current.setView([
        f.geometry.coordinates[1],
        f.geometry.coordinates[0]
      ], 15, { animate: true });
    }
  };

  
  const getFallbackImage = (type) => pngIconMap[type] || pngIconMap['museum'];

  
  const handleShowDetailsModal = (props) => {
    setDetailsData(props);
    setShowDetailsModal(true);
  };
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setDetailsData(null);
  };
  const renderModalFields = (props) => {
    if (!props) return null;
    
    const ignore = new Set(['geometry']);
    const result = [];
    Object.keys(props).forEach(key => {
      const value = props[key];
      
      if (
        ignore.has(key) ||
        value === undefined || value === null ||
        (typeof value === 'string' && value.trim() === '') ||
        Array.isArray(value) || typeof value === 'object'
      ) return;
      if (key === "image") return; // We'll show image at top
      let label = FIELD_LABELS[key] || key.replace(/^addr:/, '').replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
      
      if (key === "website") {
        result.push(
          <div key={key} style={{ margin: "9px 0" }}>
            <b>{label}:</b>{" "}
            <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer" style={{ color: "#1785b6" }}>{value}</a>
          </div>
        );
        return;
      }
      result.push(
        <div key={key} style={{ margin: "9px 0" }}>
          <b>{label}:</b> {value}
        </div>
      );
    });
    return result;
  };

  return (
    <>
      <Navbar className="explore-navbar" />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* === REVIEWS MODAL === */}
      {showReviewModal && (
        <div className="modal-bg" onClick={e => { if (e.target.className.includes('modal-bg')) setShowReviewModal(false); }}>
          <div className="reviews-modal-content">
            <button className="modal-close-btn" onClick={() => setShowReviewModal(false)}>&times;</button>
            <h3 style={{ marginBottom: 18, fontWeight: 700, fontSize: 22 }}>Reviews for <span style={{ color: "#1785b6" }}>{modalPlace}</span></h3>
            {modalReviews.length === 0 ? (
              <div style={{ color: "#888", fontSize: 15, textAlign: "center", padding: 12 }}>No reviews yet.</div>
            ) : (
              <div className="reviews-list">
                {modalReviews.map((r, i) => (
                  <div className="single-review" key={i}>
                    <div className="review-header">
                      <span className="review-username">
                        {r.user?.name || r.username || "User"}
                      </span>
                      <span className="review-stars">{renderStars(r.rating)}</span>
                      <span className="review-date">{r.date ? (new Date(r.date).toLocaleDateString()) : ''}</span>
                    </div>
                    <div className="review-text">{r.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* === BIGGER MODERN INFO MODAL === */}
      {showDetailsModal && detailsData && (
        <div
          className="modal-bg"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10002,
            background: 'rgba(23,133,182,0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
            animation: 'fadeInModal 0.32s cubic-bezier(.22,.68,0,1.71)'
          }}
          onClick={e => {
            if (e.target.className && e.target.className.includes('modal-bg')) handleCloseDetailsModal();
          }}
        >
          <div
            className="details-modal-content"
            style={{
              background: '#fff',
              minWidth: 420,
              maxWidth: 520,
              maxHeight: "88vh",
              overflowY: "auto",
              boxShadow: '0 8px 42px 0 rgba(23,133,182,0.18)',
              borderRadius: 19,
              padding: 32,
              position: 'relative',
              animation: 'modalPopIn 0.35s cubic-bezier(.18,.74,.42,1.13)',
              margin: 15
            }}
          >
            <button
              className="modal-close-btn"
              style={{
                position: 'absolute',
                right: 18,
                top: 12,
                fontSize: 36,
                color: '#aaa',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 200,
                zIndex: 10
              }}
              onClick={handleCloseDetailsModal}
            >&times;</button>
            <h2 style={{ fontWeight: 700, marginBottom: 16, color: "#1785b6", textAlign: "center" }}>
              {detailsData.name}
            </h2>
            <img
              src={detailsData.image || getFallbackImage(detailsData.tourism || detailsData.amenity)}
              alt={detailsData.name}
              style={{
                width: '144px',
                height: '144px',
                borderRadius: 17,
                objectFit: 'cover',
                display: 'block',
                margin: '0 auto 15px auto',
                boxShadow: '0 2px 16px #1785b629'
              }}
            />
            <div style={{ fontSize: 17, margin: '12px 0 8px 0', lineHeight: 1.56 }}>
              {renderModalFields(detailsData)}
            </div>
          </div>
        </div>
      )}

      <div className="explore-wrapper">
        <div className="filter-panel">
          {/* Distance Chemnitz filter */}
          <div className="distance-filter">
            <button
              className="distance-filter-btn"
              onClick={() => setDistanceExpanded(v => !v)}
            >
              <FaMapMarkerAlt style={{ marginRight: 8 }} /> Distance (Chemnitz)
              {distanceExpanded ? <FaAngleUp style={{ marginLeft: 8 }} /> : <FaAngleDown style={{ marginLeft: 8 }} />}
            </button>
            {distanceExpanded && (
              <div className="distance-fields">
                <div className="distance-field-row">
                  <label>From:</label>
                  <input
                    type="text"
                    placeholder="My Location or Place"
                    value={fromInput}
                    onChange={e => {
                      setFromInput(e.target.value);
                      setFromOption('');
                      if (e.target.value.length > 1) {
                        setFromSuggestions(
                          chemnitzNames.filter(name => name && name.toLowerCase().includes(e.target.value.toLowerCase())).slice(0, 5)
                        );
                      } else {
                        setFromSuggestions([]);
                      }
                    }}
                  />
                  <button
                    className="gps-btn"
                    title="Use My Location"
                    onClick={() => {
                      setFromOption('My Location');
                      setFromInput('My Location');
                      setFromSuggestions([]);
                    }}
                  >📍</button>
                </div>
                {fromSuggestions.length > 0 && (
                  <div className="distance-suggestions">
                    {fromSuggestions.map((s, idx) =>
                      <div key={idx} className="distance-suggestion-item" onClick={() => {
                        setFromInput(s);
                        setFromOption(s);
                        setFromSuggestions([]);
                      }}>{s}</div>
                    )}
                  </div>
                )}
                <button
                  className="distance-search-btn"
                  onClick={handleDistanceSearch}
                  disabled={distanceLoading || (!fromOption && !fromInput)}
                  style={{ marginTop: 10 }}
                >
                  {distanceLoading ? "Calculating..." : "Show Distances"}
                </button>
                {distanceError && <div className="distance-error">{distanceError}</div>}
              </div>
            )}
          </div>

          <select value={cityFilter} onChange={(e) => { setCityFilter(e.target.value); setDistrictFilter("all"); setZipFilter("all"); }}>
            <option value="Chemnitz">Chemnitz</option>
            <option value="all">All Cities</option>
            {allCities.filter(c => c !== "Chemnitz").map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
          <select value={zipFilter} onChange={(e) => setZipFilter(e.target.value)}>
            <option value="all">All ZIPs</option>
            {allZips.map((zip, i) => <option key={i} value={zip}>{zip}</option>)}
          </select>
          <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
            <option value="all">All Districts</option>
            {allDistricts.map((d, i) => <option key={i} value={d}>{d}</option>)}
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All Types</option>
            <option value="museum">Museum</option>
            <option value="gallery">Gallery</option>
            <option value="artwork">Artwork</option>
            <option value="guest_house">Guest House</option>
            <option value="hotel">Hotel</option>
            <option value="restaurant">Restaurant</option>
            <option value="theatre">Theatre</option>
          </select>
          <button onClick={filterData}>Search</button>

          {/* ==== Results List ==== */}
          {searchClicked && (
            <div className="results-list">
              {(distances.length > 0 ? distances : filtered).map((item, i) => {
                const f = item.f || item;
                const props = f.properties;
                const type = props.tourism || props.amenity;
                const imageSrc = props.image || getFallbackImage(type);

                let reviewsObj = placeReviews[props.name] || {};
                let avg = reviewsObj.average;
                let count = reviewsObj.count;
                const showReview = count > 0 && avg > 0;

                let showDistance = false, distVal = null;
                if (distances.length > 0 && item.distance !== undefined) {
                  showDistance = true;
                  distVal = item.distance;
                }
                return (
                  <div
                    key={i}
                    className={`result-card ${type}`}
                    onClick={() => openPopupForIndex(item.idx ?? i, f)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={imageSrc} alt={props.name} />
                    <div className="card-details">
                      <h4>{props.name}</h4>
                      <div
                        className={`card-rating${showReview ? ' clickable' : ''}`}
                        title={showReview ? 'Click to see all reviews' : ''}
                        style={showReview ? { cursor: 'pointer', userSelect: 'none', display: "inline-flex", alignItems: "center", gap: 10 } : {}}
                        onClick={showReview ? (e) => {
                          e.stopPropagation();
                          setModalReviews(reviewsObj.reviews || []);
                          setModalPlace(props.name);
                          setShowReviewModal(true);
                        } : undefined}
                      >
                        {showReview ? (
                          <>
                            <span style={{ display: 'flex', alignItems: 'center', fontSize: 17 }}>
                              {renderStars(avg)}
                            </span>
                            <span style={{
                              fontWeight: 700,
                              fontSize: "15px",
                              color: "#fdba2c",
                              background: "#fffbe7",
                              borderRadius: "5px",
                              padding: "2px 8px"
                            }}>
                              {Number(avg).toFixed(1)}
                            </span>
                            <span style={{
                              color: "#888",
                              fontSize: "13px",
                              marginLeft: "2px"
                            }}>
                              ({count} review{count === 1 ? '' : 's'})
                            </span>
                          </>
                        ) : (
                          <span style={{ color: "#aaa", fontSize: 14 }}>No reviews yet</span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#1785b6",
                          margin: "8px 0 5px 0",
                          display: "inline-block",
                          cursor: "pointer",
                          fontWeight: 500,
                          letterSpacing: ".1px"
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          handleShowDetailsModal(props);
                        }}
                      >
                        <span role="img" aria-label="info" style={{ marginRight: 4, fontSize: 16 }}>ℹ️</span>
                        More Info
                      </div>
                      <p>
                        {props['addr:street'] && <>{props['addr:street']}, </>}
                        {props['addr:postcode'] && <>{props['addr:postcode']} </>}
                        {props['addr:city'] && <>{props['addr:city']}</>}
                      </p>
                      {props.phone && <p>📞 {props.phone}</p>}
                      {showDistance &&
                        <p className="distance-info">Distance: <b>{distVal.toFixed(2)} km</b></p>
                      }
                      {props.website && (
                        <a
                          href={props.website.startsWith('http') ? props.website : `https://${props.website}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Visit Website
                        </a>
                      )}
                    </div>
                    <div
                      className="save-icon"
                      onClick={e => {
                        e.stopPropagation();
                        if (savedPlaces.includes(props.name)) {
                          toast.info('You have already saved this place!');
                          return;
                        }
                        if (visitedPlaces.includes(props.name)) {
                          toast.info('You have already visited this place!');
                          return;
                        }
                        handleAddToRoute({ ...props, geometry: f.geometry });
                      }}
                      style={savedPlaces.includes(props.name) || visitedPlaces.includes(props.name)
                        ? { cursor: "not-allowed", opacity: 0.5 }
                        : {}}
                    >
                      {savedPlaces.includes(props.name) || visitedPlaces.includes(props.name)
                        ? <FaBookmark size={20} color="gold" />
                        : <FaRegBookmark size={20} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="map-panel">
          <div className="map-search-container right">
            <div className="search-bar-wrapper">
              <FaSearch className="search-icon" />
              <input
                className="map-search-input"
                placeholder="Search name or ZIP..."
                value={searchTerm}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchTerm(val);
                  const matches = allNames.filter((n) =>
                    n.toLowerCase().includes(val.toLowerCase())
                  );
                  setSuggestions(matches.slice(0, 6));
                }}
              />
            </div>
            {searchTerm && suggestions.length > 0 && (
              <div className="autocomplete-box">
                {suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    className="autocomplete-item"
                    onClick={() => {
                      setSearchTerm(s);
                      setSuggestions([]);
                      let match;
                      if (cityFilter === "Chemnitz") {
                        match = chemnitzFeatures.find(f =>
                          f.properties.name?.toLowerCase() === s.toLowerCase()
                        );
                      } else {
                        match = geoData.find(f =>
                          f.properties.name?.toLowerCase() === s.toLowerCase()
                        );
                      }
                      if (match && mapRef.current) {
                        const [lng, lat] = match.geometry.coordinates;
                        mapRef.current.setView([lat, lng], 15, { animate: true });
                        setFiltered([match]);
                        setSearchClicked(true);
                        setTimeout(() => {
                          if (markerRefs.current[0]) markerRefs.current[0].openPopup();
                        }, 300);
                      }
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
          <MapContainer
            center={[50.83, 12.92]}
            zoom={8}
            className="leaflet-container"
            whenCreated={(map) => (mapRef.current = map)}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {filtered.map((f, i) => {
              const [lng, lat] = f.geometry.coordinates;
              const props = f.properties;
              const type = props.tourism || props.amenity;
              const imageSrc = props.image || getFallbackImage(type);

              let reviewsObj = placeReviews[props.name] || {};
              let avg = reviewsObj.average;
              let count = reviewsObj.count;
              const showReview = count > 0 && avg > 0;

              return (
                <Marker
                  key={i}
                  position={[lat, lng]}
                  icon={getPinIcon(type)}
                  ref={ref => markerRefs.current[i] = ref}
                  eventHandlers={{
                    popupopen: () => setActiveIndex(i)
                  }}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="popup-box">
                      <img
                        src={imageSrc}
                        alt="site"
                        className="popup-image"
                      />
                      <div className="popup-info">
                        <strong className="popup-title">{props.name || 'Unnamed'}</strong>
                        <div className="popup-rating" style={{ margin: "7px 0 0", display: 'flex', alignItems: 'center', gap: 7 }}>
                          {showReview ? (
                            <>
                              <span style={{ display: 'flex', alignItems: 'center', fontSize: 19 }}>
                                {renderStars(avg)}
                              </span>
                              <span style={{
                                fontWeight: 700,
                                fontSize: "15px",
                                color: "#fdba2c",
                                background: "#fffbe7",
                                borderRadius: "5px",
                                padding: "2px 8px"
                              }}>
                                {Number(avg).toFixed(1)}
                              </span>
                              <span style={{
                                color: "#888",
                                fontSize: "13px"
                              }}>
                                ({count} review{count === 1 ? "" : "s"})
                              </span>
                            </>
                          ) : (
                            <span style={{ color: "#aaa", fontSize: 14 }}>No reviews yet</span>
                          )}
                        </div>
                        <p>Type: {type || 'Unknown'}</p>
                        <p>
                          {props['addr:street'] && <>{props['addr:street']}, </>}
                          {props['addr:postcode'] && <>{props['addr:postcode']} </>}
                          {props['addr:city'] && <>{props['addr:city']}</>}
                        </p>
                        {props.phone && <p>Phone: {props.phone}</p>}
                        <button
                          className="modern-route-btn"
                          disabled={savedPlaces.includes(props.name) || visitedPlaces.includes(props.name)}
                          onClick={e => {
                            e.stopPropagation();
                            if (savedPlaces.includes(props.name) || visitedPlaces.includes(props.name)) {
                              toast.info('You have already saved or visited this place!');
                              return;
                            }
                            handleAddToRoute({ ...props, geometry: f.geometry });
                          }}
                          style={(savedPlaces.includes(props.name) || visitedPlaces.includes(props.name))
                            ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                        >
                          ➕ Add to Route
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </>
  );
};

export default Explore;
