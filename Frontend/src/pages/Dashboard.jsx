import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripsAPI, destinationsAPI } from '../api/client';
import TripCard from '../components/TripCard';
import DestinationCard from '../components/DestinationCard';
import { Sparkles, Compass, Plus, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAuthenticated) {
          const resTrips = await tripsAPI.getTrips();
          if (resTrips.success && resTrips.data && resTrips.data.trips) {
            setTrips(resTrips.data.trips);
          }
        }

        const resDest = await destinationsAPI.getDestinations();
        if (resDest.success && resDest.data && resDest.data.destinations) {
          setDestinations(resDest.data.destinations);
        }
      } catch (err) {
        console.error('Dashboard Load Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handlePlanClick = (cityName) => {
    navigate(`/plan?destination=${encodeURIComponent(cityName)}`);
  };

  return (
    <div className="main-wrapper">
      {/* Editorial Travel Hero */}
      <section className="editorial-hero">
        <div className="editorial-badge">
          <Sparkles size={14} />
          <span>AI-Powered Travel Intelligence</span>
        </div>

        <h1 className="editorial-title">
          Your next <span>great journey</span> starts here.
        </h1>

        <p className="editorial-subtitle">
          Let Musafir AI generate complete multi-city itineraries, balance your target budget, and guide you with your personal travel copilot.
        </p>

        <div className="hero-actions">
          <Link to="/plan" className="btn-ai" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <Sparkles size={18} />
            <span>Plan a Trip with AI</span>
          </Link>
          <Link to="/explore" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <Compass size={18} />
            <span>Explore Destinations</span>
          </Link>
        </div>
      </section>

      {/* User's Active Journeys */}
      {isAuthenticated && (
        <section style={{ marginTop: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Your Journeys</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Manage your upcoming itineraries and active travel plans</p>
            </div>
            <Link to="/plan" className="btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
              <Plus size={16} />
              <span>Create New Trip</span>
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Sparkles className="spin" size={24} color="var(--accent-terracotta)" />
            </div>
          ) : trips.length === 0 ? (
            <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', padding: '48px 24px', textAlign: 'center', border: 'var(--border-light)' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No active trips yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Ready for your next adventure? Let AI craft your perfect itinerary.</p>
              <Link to="/plan" className="btn-ai">
                <Sparkles size={16} />
                <span>Build First Trip with AI</span>
              </Link>
            </div>
          ) : (
            <div className="card-grid">
              {trips.map((trip) => (
                <TripCard key={trip._id} trip={trip} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Featured Travel Destinations */}
      <section style={{ marginTop: '64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Trending Destinations</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Popular travel hubs curated for your next escape</p>
          </div>
          <Link to="/explore" className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="card-grid">
          {destinations.slice(0, 3).map((dest, index) => (
            <DestinationCard
              key={dest._id || dest.name || index}
              destination={dest}
              onPlanClick={handlePlanClick}
              isFeatured={index === 0}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
