import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTripById, getActivities, getTripStops } from '../api';
import Timeline from '../components/Timeline';
import { MapPin, Calendar, Wallet, Sparkles, Share2 } from 'lucide-react';

const DESTINATION_IMAGES = {
  Goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
  Jaipur: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
  Manali: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
  Bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80'
};

const SharedTrip = () => {
  const { id: tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        const resTrip = await getTripById(tripId);
        if (resTrip.success && resTrip.data && resTrip.data.trip) {
          setTrip(resTrip.data.trip);
        }

        const resAct = await getActivities(tripId);
        if (resAct.success && resAct.data && resAct.data.activities) {
          setActivities(resAct.data.activities);
        }
      } catch (err) {
        console.error('Failed to load shared trip:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedData();
  }, [tripId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <Sparkles className="spin" size={32} color="var(--accent-terracotta)" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="main-wrapper" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>Shared Trip Not Found</h2>
      </div>
    );
  }

  const coverImg = DESTINATION_IMAGES[trip.destination] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="main-wrapper">
      <div
        style={{
          position: 'relative',
          height: '320px',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          marginBottom: '32px',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <img src={coverImg} alt={trip.destination} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(18, 19, 22, 0.85) 0%, rgba(18, 19, 22, 0.2) 60%)',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '32px'
          }}
        >
          <div style={{ color: '#FFF' }}>
            <div className="editorial-badge" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FFF', border: '1px solid rgba(255, 255, 255, 0.3)', marginBottom: '8px' }}>
              <Share2 size={14} />
              <span>Public Shared Journey</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#FFF', marginBottom: '8px' }}>
              {trip.title || trip.destination}
            </h1>
            <div style={{ display: 'flex', gap: '20px', fontSize: '0.95rem', opacity: 0.9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} />
                <span>{trip.destination}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wallet size={16} />
                <span>Budget: ₹{(trip.budget || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '20px' }}>Shared Itinerary Timeline</h2>
      <Timeline activities={activities} isOrganizer={false} />
    </div>
  );
};

export default SharedTrip;
