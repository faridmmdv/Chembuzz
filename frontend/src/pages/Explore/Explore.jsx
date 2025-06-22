import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Explore.css';
import { FaRegBookmark, FaBookmark } from 'react-icons/fa';

// Corrected image imports (from assets root)
import restaurantIcon from '../../assets/restaurant.png';
import museumIcon from '../../assets/museum.png';
import artworkIcon from '../../assets/artwork.png';
import galleryIcon from '../../assets/gallery.png';
import hotelIcon from '../../assets/hotel.png';
import guestHouseIcon from '../../assets/guest_house.png';
import theatreIcon from '../../assets/theatre.png';

const Explore = () => {
  const [geoData, setGeoData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('all');
  const [zipFilter, setZipFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('Chemnitz');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [allZips, setAllZips] = useState([]);
  const [allNames, setAllNames] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [searchClicked, setSearchClicked] = useState(false);
  const mapRef = useRef();

  useEffect(() => {
    const loadGeoData = async () => {
      const [chemnitz, sachsen, stadtteile] = await Promise.all([
        fetch('/data/Chemnitz.geojson').then(res => res.json()),
        fetch('/data/Sachsen.geojson').then(res => res.json()),
        fetch('/data/Stadtteile.geojson').then(res => res.json())
      ]);

      const combined = [...chemnitz.features, ...sachsen.features, ...stadtteile.features].filter(
        f => f.geometry?.type === 'Point'
      );

      setGeoData(combined);

      const zips = new Set();
      const names = new Set();
      const cities = new Set();
      const districts = new Set();

      combined.forEach(f => {
        const props = f.properties;
        if (props['addr:postcode']) zips.add(props['addr:postcode']);
        if (props.name) names.add(props.name);
        if (props['addr:city']) cities.add(props['addr:city']);
        if (props.suburb) districts.add(props.suburb);
        if (props['addr:suburb']) districts.add(props['addr:suburb']);
      });

      setAllZips([...zips].sort());
      setAllNames([...names].sort());
      setAllCities([...cities].sort());
      setAllDistricts([...districts].sort());
    };

    loadGeoData();
  }, []);

  const filterData = () => {
    let results = geoData;

    if (category !== 'all') {
      results = results.filter(f =>
        f.properties.tourism?.toLowerCase() === category ||
        f.properties.amenity?.toLowerCase() === category
      );
    }
    if (zipFilter !== 'all') {
      results = results.filter(f => f.properties['addr:postcode'] === zipFilter);
    }
    if (cityFilter !== 'all') {
      results = results.filter(f => f.properties['addr:city'] === cityFilter);
    }
    if (districtFilter !== 'all') {
      results = results.filter(
        f => f.properties.suburb === districtFilter || f.properties['addr:suburb'] === districtFilter
      );
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        f => f.properties.name?.toLowerCase().includes(term) ||
             f.properties['addr:postcode']?.includes(term)
      );
    }

    setFiltered(results);
    setSearchClicked(true);

    if (results.length && mapRef.current) {
      const [lng, lat] = results[0].geometry.coordinates;
      mapRef.current.setView([lat, lng], 14);
    }
  };

  const handleAddToRoute = async (place) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Please login to save places');

    const payload = {
      name: place.name,
      tourism: place.tourism,
      amenity: place.amenity,
      city: place['addr:city'],
      postcode: place['addr:postcode'],
      street: place['addr:street'],
      district: place.suburb || place['addr:suburb'],
      website: place.website,
      image: place.image,
      phone: place.phone
    };

    await fetch('http://localhost:8000/api/save-place/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    setSavedPlaces(prev => [...prev, place.name]);
    alert('✅ Saved to favorites!');
  };

  const getDefaultImage = (props) => {
    const type = props.tourism || props.amenity;
    switch (type) {
      case 'restaurant': return restaurantIcon;
      case 'museum': return museumIcon;
      case 'artwork': return artworkIcon;
      case 'gallery': return galleryIcon;
      case 'hotel': return hotelIcon;
      case 'guest_house': return guestHouseIcon;
      case 'theatre': return theatreIcon;
      default: return null;
    }
  };

  return (
    <>
      <Navbar className="explore-navbar" />

      <div className="explore-wrapper">
        <div className="filter-panel">
          <input
            type="text"
            placeholder="Search name or ZIP"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
            <option value="all">All Cities</option>
            {allCities.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>

          <select value={zipFilter} onChange={(e) => setZipFilter(e.target.value)}>
            <option value="all">All ZIPs</option>
            {allZips.map((zip, i) => (
              <option key={i} value={zip}>{zip}</option>
            ))}
          </select>

          <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
            <option value="all">All Districts</option>
            {allDistricts.map((d, i) => (
              <option key={i} value={d}>{d}</option>
            ))}
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

          {searchClicked && (
            <div className="results-list">
              {filtered.map((f, i) => {
                const props = f.properties;
                const imageSrc = props.image || getDefaultImage(props);

                return (
                  <div key={i} className="result-card">
                    {imageSrc && <img src={imageSrc} alt={props.name} />}
                    <div className="card-details">
                      <h4>{props.name}</h4>
                      <p>{props['addr:street']}, {props['addr:postcode']} {props['addr:city']}</p>
                      {props.phone && <p>📞 {props.phone}</p>}
                      {props.website && (
                        <a href={props.website.startsWith('http') ? props.website : `https://${props.website}`} target="_blank" rel="noreferrer">Visit Website</a>
                      )}
                    </div>
                    <div className="save-icon" onClick={() => handleAddToRoute(props)}>
                      {savedPlaces.includes(props.name) ? (
                        <FaBookmark size={20} color="gold" />
                      ) : (
                        <FaRegBookmark size={20} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="map-panel">
          <MapContainer
            center={[50.83, 12.92]}
            zoom={8}
            className="leaflet-container"
            whenCreated={(map) => (mapRef.current = map)}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {searchClicked && filtered.map((f, i) => {
              const [lng, lat] = f.geometry.coordinates;
              const props = f.properties;
              return (
                <Marker
                  key={i}
                  position={[lat, lng]}
                  icon={L.icon({
                    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41]
                  })}
                >
                  <Popup>
  <strong>{props.name || 'Unnamed'}</strong><br />
  Type: {props.tourism || props.amenity || 'Unknown'}<br />
  City: {props['addr:city'] || 'N/A'}<br />
  ZIP: {props['addr:postcode'] || 'N/A'}<br />
  Street: {props['addr:street'] || 'N/A'}<br />
  District: {props.suburb || props['addr:suburb'] || 'N/A'}<br />
  Phone: {props.phone || 'N/A'}<br />
  {props.website && (
    <div style={{ marginTop: '6px' }}>
      <a href={props.website.startsWith('http') ? props.website : `https://${props.website}`} target="_blank" rel="noopener noreferrer">
        Visit Website
      </a>
    </div>
  )}
  {props.image && (
    <img src={props.image} alt="site" style={{ width: '100%', marginTop: '8px', borderRadius: '5px' }} />
  )}
  <button className="route-btn" onClick={() => handleAddToRoute(props)}>
    ➕ Add to Route
  </button>
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
