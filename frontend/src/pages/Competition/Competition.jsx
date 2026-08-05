import React, { useEffect, useState } from "react";
import {
  Trophy,
  Medal,
  Award,
  MapPin,
  Users,
  TrendingUp,
  Eye,
  Building,
  Palette,
  Hotel,
  Theater,
  Home,
  Utensils,
  Crown,
  Gift,
  Star,
  Sparkles
} from "lucide-react";
import "./Competition.css";

// Venue types for columns
const venueTypes = [
  { key: "museum", label: "Museum", icon: Building, color: "text-blue-600" },
  { key: "theatre", label: "Theatre", icon: Theater, color: "text-purple-600" },
  { key: "hotel", label: "Hotel", icon: Hotel, color: "text-green-600" },
  { key: "artwork", label: "Artwork", icon: Palette, color: "text-pink-600" },
  { key: "guesthouse", label: "Guesthouse", icon: Home, color: "text-orange-600" },
  { key: "gallery", label: "Gallery", icon: Eye, color: "text-indigo-600" },
  { key: "restaurant", label: "Restaurant", icon: Utensils, color: "text-red-600" },
];

// Badges for the badge panel
const badges = [
  {
    id: 'pro',
    name: 'Pro Explorer',
    description: '50 Places Visited',
    placesRequired: 50,
    icon: <MapPin className="badge-icon" />,
    gradient: 'from-blue-500 to-cyan-500',
    glowColor: 'shadow-blue-500/50'
  },
  {
    id: 'elite',
    name: 'Elite Explorer',
    description: '75 Places Visited',
    placesRequired: 75,
    icon: <Star className="badge-icon" />,
    gradient: 'from-purple-500 to-pink-500',
    glowColor: 'shadow-purple-500/50'
  },
  {
    id: 'legendary',
    name: 'Legendary Explorer',
    description: '100 Places Visited',
    placesRequired: 100,
    icon: <Crown className="badge-icon" />,
    gradient: 'from-yellow-500 to-orange-500',
    glowColor: 'shadow-yellow-500/50'
  }
];

// Helper to show badges next to leaderboard names
const getUserBadges = (total) => {
  const out = [];
  if (total >= 100)
    out.push(
      <span className="explorer-badge badge-legendary" title="Legendary Explorer (100+ places)" key="legendary">
        <Crown size={20} style={{ color: "#FFD700", marginRight: 2 }} />
        Legendary
      </span>
    );
  if (total >= 75)
    out.push(
      <span className="explorer-badge badge-elite" title="Elite Explorer (75+ places)" key="elite">
        <Crown size={17} style={{ color: "#C0C0C0", marginRight: 2 }} />
        Elite
      </span>
    );
  if (total >= 50)
    out.push(
      <span className="explorer-badge badge-pro" title="Pro Explorer (50+ places)" key="pro">
        <Crown size={15} style={{ color: "#cd7f32", marginRight: 2 }} />
        Pro
      </span>
    );
  return out;
};

const Competition = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Load leaderboard and find current user stats
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/leaderboard/");
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const data = await res.json();
        setUsers(data);

        // --- Detect current user by username from localStorage/profile API ---
        const username =
          JSON.parse(localStorage.getItem("user"))?.username ||
          localStorage.getItem("username");
        // Try to find by backend username
        let me = null;
        if (username) {
          me = data.find(u => u.name === username);
        }
        // Fallback: Try /api/profile/
        if (!me) {
          const token = localStorage.getItem("token");
          if (token) {
            const res = await fetch("http://localhost:8000/api/profile/", {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              const pdata = await res.json();
              me = data.find(u => u.name === pdata.name);
            }
          }
        }
        // Fallback to first user if still not found (avoid crash)
        setCurrentUser(me || data[0] || { total: 0, name: "You" });
      } catch (err) {
        setUsers([]);
        setCurrentUser({ total: 0, name: "You" });
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Stats cards logic
  const stats = [
    {
      icon: <Users className="icon-card users" />,
      label: "Total Explorers",
      value: users.length,
      cardClass: "glass-card card-blue",
    },
    {
      icon: <MapPin className="icon-card venues" />,
      label: "Venue Types",
      value: venueTypes.length,
      cardClass: "glass-card card-green",
    },
    {
      icon: <Trophy className="icon-card trophy" />,
      label: "Top Score",
      value: users.length ? Math.max(...users.map((u) => u.total)) : 0,
      cardClass: "glass-card card-gold",
    },
    {
      icon: <TrendingUp className="icon-card trending" />,
      label: "Avg Visits",
      value: users.length
        ? Math.round(users.reduce((sum, u) => sum + u.total, 0) / users.length)
        : 0,
      cardClass: "glass-card card-purple",
    },
  ];

  // Leaderboard helpers
  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-glow" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400 drop-shadow-glow" />;
      case 2:
        return <Award className="w-6 h-6 text-orange-400 drop-shadow-glow" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">
            #{index + 1}
          </span>
        );
    }
  };

  const getRankClass = (index) => {
    switch (index) {
      case 0:
        return "rank-first";
      case 1:
        return "rank-second";
      case 2:
        return "rank-third";
      default:
        return "";
    }
  };

  const getVenueGradient = (venueKey) => {
    const gradients = {
      museum: "from-blue-400.to-blue-600",
      theatre: "from-purple-400.to-purple-600",
      hotel: "from-green-400.to-green-600",
      artwork: "from-pink-400.to-pink-600",
      guesthouse: "from-orange-400.to-orange-600",
      gallery: "from-indigo-400.to-indigo-600",
      restaurant: "from-red-400.to-red-600",
    };
    return gradients[venueKey] || "from-gray-400.to-gray-600";
  };

  // For badges panel (show 0 if user not found)
  const placesVisited = currentUser?.total || 0;

  // For lively badge panel, as in your friend's code
  const isEarned = (placesRequired) => placesVisited >= placesRequired;

  return (
    <div className="competition-bg">
      <div className="comp-container">
        {/* Header */}
        <div className="comp-header">
          <div className="header-icon-glow">
            <TrendingUp className="main-icon" />
          </div>
          <h1 className="leaderboard-title">Cultural Explorer Leaderboard</h1>
          <p className="subtitle">
            Discover who's leading the cultural exploration journey across museums, galleries, theatres, and more!
          </p>
        </div>

        {/* Your Achievement Panel */}
        <div className="bg-white/90 backdrop-blur rounded-2xl p-8 max-w-3xl mx-auto my-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold mb-2 text-blue-600">Your Exploration Achievements</h2>
            <div className="flex flex-col items-center justify-center gap-2 mb-5">
              <div className="text-4xl font-bold text-slate-700 mb-1">
                {placesVisited}
              </div>
              <div className="text-lg text-slate-500">Places Visited</div>
              {/* Badge earned label */}
              <div className="mt-2 flex gap-2 justify-center">
                {badges.filter(b => isEarned(b.placesRequired)).length > 0 ? (
                  badges
                    .filter(b => isEarned(b.placesRequired))
                    .map(b => (
                      <span
                        key={b.id}
                        className={`explorer-badge font-bold ${b.id === "legendary" ? "badge-legendary" : b.id === "elite" ? "badge-elite" : "badge-pro"}`}
                      >
                        {b.icon}
                        {b.name}
                      </span>
                    ))
                ) : (
                  <span className="explorer-badge" style={{ color: "#abb0c6" }}>
                    No badges earned yet!
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Lively Badges Panel */}
          <div className="grid md:grid-cols-3 grid-cols-1 gap-8 mb-8">
            {badges.map((badge) => {
              const earned = isEarned(badge.placesRequired);
              return (
                <div
                  key={badge.id}
                  className={`relative group transition-all duration-500 ${
                    earned ? 'scale-105' : 'scale-100 opacity-60'
                  }`}
                >
                  <div
                    className={`
                      relative p-8 rounded-3xl border-2 transition-all duration-500
                      ${earned 
                        ? `bg-gradient-to-br ${badge.gradient} border-white/30 shadow-2xl ${badge.glowColor} animate-pulse` 
                        : 'bg-slate-100 border-slate-300/70 backdrop-blur'
                      }
                    `}
                  >
                    {/* Sparkle for earned badges */}
                    {earned && (
                      <>
                        <Sparkles className="absolute top-4 right-4 w-6 h-6 text-white/80 animate-bounce" />
                        <Sparkles className="absolute bottom-4 left-4 w-4 h-4 text-white/60 animate-bounce delay-300" />
                      </>
                    )}
                    <div
                      className={`
                        badge-oval-bg ${badge.id === "legendary" ? "badge-legendary" : badge.id === "elite" ? "badge-elite" : "badge-pro"}
                      `}
                    >
                      {badge.icon}
                    </div>
                    <div className="text-center">
                      <h3 className={`text-xl font-bold mb-2 ${earned ? 'text-white' : 'text-slate-700'}`}>
                        {badge.name}
                      </h3>
                      <p className={`text-sm mb-4 ${earned ? 'text-white/80' : 'text-slate-500'}`}>
                        {badge.description}
                      </p>
                      <div
                        className={`
                          inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold
                          ${earned 
                            ? 'bg-green-500/20 text-green-700 border border-green-500/30' 
                            : 'bg-slate-200 text-slate-500 border border-slate-300/70'
                          }
                        `}
                      >
                        {earned ? (
                          <>
                            <Award className="w-4 h-4" />
                            Badge Earned
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4" />
                            {badge.placesRequired - placesVisited} more to go
                          </>
                        )}
                      </div>
                    </div>
                    {/* Progress Bar for unearned badges */}
                    {!earned && (
                      <div className="mt-6">
                        <div className="w-full bg-slate-300 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-1000"
                            style={{
                              width: `${Math.min((placesVisited / badge.placesRequired) * 100, 100)}%`
                            }}
                          />
                        </div>
                        <div className="text-center mt-2">
                          <span className="text-xs text-slate-400">
                            {placesVisited}/{badge.placesRequired} places
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Glow for earned badges */}
                  {earned && (
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${badge.gradient} opacity-20 blur-xl -z-10`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="comp-stats-row">
          {stats.map((stat, i) => (
            <div key={stat.label} className={`stat-card ${stat.cardClass}`}>
              <div className="icon-bg">{stat.icon}</div>
              <div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Table */}
        <div className="comp-leaderboard-table">
          <div className="comp-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Explorer</th>
                  {venueTypes.map((venue) => (
                    <th key={venue.key} className="venue-header">
                      <venue.icon className="venue-icon" />
                      <span className="venue-label">{venue.label}</span>
                    </th>
                  ))}
                  <th>
                    <TrendingUp className="venue-icon" />
                    <span className="venue-label">Total</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: "center", padding: 32 }}>
                      <span>Loading leaderboard...</span>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: "center", padding: 32 }}>
                      <span>No explorers found yet!</span>
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user.id} className={getRankClass(index)}>
                      <td>{getRankIcon(index)}</td>
                      <td>
                        <div className="user-cell">
                          <img
                            src={
                              user.avatar && user.avatar.startsWith("http")
                                ? user.avatar
                                : "/assets/default-avatar.png"
                            }
                            alt={user.name}
                            className="user-avatar"
                          />
                          <div>
                            <div className="user-name">
                              {user.name}
                              <span style={{ marginLeft: 6, display: "inline-block", verticalAlign: "middle" }}>
                                {getUserBadges(user.total)}
                              </span>
                            </div>
                            <div className="user-desc">Cultural Explorer</div>
                          </div>
                        </div>
                      </td>
                      {venueTypes.map((venue) => (
                        <td key={venue.key}>
                          <span className={`venue-badge ${getVenueGradient(venue.key)}`}>
                            {user[venue.key] ?? 0}
                          </span>
                        </td>
                      ))}
                      <td>
                        <span className="total-badge">{user.total}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ====== Surprise Announcement and Badges Legend ====== */}
        <div className="announcement-box">
          <Gift size={24} style={{ color: "#ffbc42", marginRight: 7, verticalAlign: "middle" }} />
          <span className="announcement-text">
            <b>Top 3 ranked users will have a huge surprise!</b>
          </span>
        </div>
        <div className="badges-legend">
          <span><Crown size={17} style={{ color: "#FFD700", verticalAlign: "middle" }} /> <b>Legendary Explorer</b> (100+ places)</span>
          <span><Crown size={15} style={{ color: "#C0C0C0", verticalAlign: "middle" }} /> <b>Elite Explorer</b> (75+ places)</span>
          <span><Crown size={13} style={{ color: "#cd7f32", verticalAlign: "middle" }} /> <b>Pro Explorer</b> (50+ places)</span>
        </div>

        {/* Footer */}
        <div className="comp-footer">
          Keep exploring and climb the leaderboard! <span role="img" aria-label="trophy">🏆</span>
        </div>
      </div>
    </div>
  );
};

export default Competition;
