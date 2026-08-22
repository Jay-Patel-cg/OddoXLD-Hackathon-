import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDestinations } from '../api';
import DestinationCard from '../components/DestinationCard';
import { Search, Compass, Sparkles, Filter } from 'lucide-react';

const CATEGORIES = ['All', 'Beach', 'Culture', 'Mountain', 'Heritage', 'Nature'];

const Destinations = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await getDestinations();
        if (res.success && res.data && res.data.destinations) {
          setDestinations(res.data.destinations);
        }
      } catch (err) {
        console.error('Failed to load destinations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const handlePlanClick = (cityName) => {
    navigate(`/plan?destination=${encodeURIComponent(cityName)}`);
  };

  const filteredDestinations = destinations.filter((dest) => {
    const name = (dest.city || dest.name || '').toLowerCase();
    const country = (dest.country || '').toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || country.includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (dest.popularCategories && dest.popularCategories.some(c => c.toLowerCase() === selectedCategory.toLowerCase())) || (dest.category || '').toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="main-wrapper">
      <div style={{ textAlign: 'center', margin: '32px 0 28px 0' }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '12px' }}>
          Explore <span>Destinations</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
          Discover incredible coastal escapes, heritage cities, and mountain retreats. Click any destination to explore places and photos.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '840px', margin: '0 auto 40px auto' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by city or country (e.g. Goa, Jaipur, Paris)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '50px', height: '54px', borderRadius: 'var(--border-radius-pill)', fontSize: '1rem', boxShadow: 'var(--shadow-sm)' }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`nav-item ${selectedCategory === cat ? 'active' : ''}`}
              style={{ cursor: 'pointer', padding: '8px 18px', borderRadius: 'var(--border-radius-pill)' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Destination Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Compass className="spin" size={36} color="var(--accent-terracotta)" />
        </div>
      ) : filteredDestinations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--surface-card)', borderRadius: 'var(--border-radius-xl)', border: 'var(--border-light)' }}>
          <Compass size={40} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3>No destinations found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search query or category filter.</p>
        </div>
      ) : (
        <div className="card-grid">
          {filteredDestinations.map((dest, idx) => (
            <DestinationCard
              key={dest._id || idx}
              destination={dest}
              onPlanClick={handlePlanClick}
              isFeatured={idx === 0 && selectedCategory === 'All' && !searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Destinations;
