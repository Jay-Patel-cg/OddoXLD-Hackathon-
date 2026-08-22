import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTrips, deleteTrip } from '../api';
import TripCard from '../components/TripCard';
import { Sparkles, Plus, Compass } from 'lucide-react';

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('upcoming'); // upcoming | past

  const fetchTrips = async () => {
    try {
      const res = await getTrips();
      if (res.success && res.data && res.data.trips) {
        setTrips(res.data.trips);
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDelete = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      await deleteTrip(tripId);
      fetchTrips();
    } catch (err) {
      alert(err.message || 'Failed to delete trip');
    }
  };

  const filteredTrips = trips.filter((t) => {
    const isPast = t.status === 'completed' || (t.endDate && new Date(t.endDate) < new Date());
    return filterTab === 'past' ? isPast : !isPast;
  });

  return (
    <div className="main-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '32px 0 24px 0', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '4px', color: '#0F172A' }}>My Trips</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Manage your travel itineraries, active stops, and itineraries</p>
        </div>

        <Link to="/plan" className="btn-ai" style={{ padding: '10px 22px' }}>
          <Plus size={18} />
          <span>+ Plan a new trip</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: 'var(--border-light)', paddingBottom: '16px', marginBottom: '32px' }}>
        <button
          onClick={() => setFilterTab('upcoming')}
          className={`nav-item ${filterTab === 'upcoming' ? 'active' : ''}`}
          style={{ padding: '8px 18px', fontSize: '0.92rem' }}
        >
          Upcoming & Active ({trips.filter(t => t.status !== 'completed').length})
        </button>
        <button
          onClick={() => setFilterTab('past')}
          className={`nav-item ${filterTab === 'past' ? 'active' : ''}`}
          style={{ padding: '8px 18px', fontSize: '0.92rem' }}
        >
          Past Journeys ({trips.filter(t => t.status === 'completed').length})
        </button>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Sparkles className="spin" size={32} color="var(--accent-terracotta)" />
        </div>
      ) : filteredTrips.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: 'var(--surface-card)', borderRadius: 'var(--border-radius-xl)', border: 'var(--border-light)' }}>
          <Compass size={44} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '8px' }}>No {filterTab} trips found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Start planning your next adventure with Musafir AI engine.</p>
          <Link to="/plan" className="btn-ai">
            <Sparkles size={16} />
            <span>Build Trip with AI</span>
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {filteredTrips.map((trip) => (
            <TripCard key={trip._id} trip={trip} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTrips;
