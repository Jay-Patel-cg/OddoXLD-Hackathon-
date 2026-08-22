import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Sparkles, Star } from 'lucide-react';
import { getDestinationImage } from '../data/destinationImages';

const DestinationCard = ({ destination, onPlanClick, isFeatured = false }) => {
  const navigate = useNavigate();

  const city = destination.city || destination.name || 'Destination';
  const country = destination.country || 'India';
  const imgUrl = destination.imageUrl || getDestinationImage(city);
  const cost = destination.averageCostPerDay ? `₹${destination.averageCostPerDay.toLocaleString()}/day` : (destination.costIndex ? `₹${(destination.costIndex * 1200).toLocaleString()}/day` : '₹3,500/day');
  const category = destination.popularCategories && destination.popularCategories.length > 0 ? destination.popularCategories[0] : (destination.category || 'Sightseeing');
  const id = destination._id || city;

  const handleCardClick = () => {
    navigate(`/explore/${id}`);
  };

  const handlePlanClick = (e) => {
    e.stopPropagation();
    if (onPlanClick) {
      onPlanClick(city);
    } else {
      navigate(`/plan?destination=${encodeURIComponent(city)}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`travel-card ${isFeatured ? 'featured-card' : ''}`}
      style={{
        cursor: 'pointer',
        background: 'var(--surface-card)',
        border: 'var(--border-light)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={imgUrl}
          alt={city}
          className={`card-media ${isFeatured ? 'card-media-large' : ''}`}
          style={{ width: '100%', height: '220px', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: '14px', right: '14px', background: 'var(--surface-card)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-main)', border: 'var(--border-light)' }}>
          <Star size={14} fill="#F59E0B" color="#F59E0B" />
          <span>4.9</span>
        </div>
      </div>

      <div className="card-body" style={{ padding: '20px 24px 24px 24px', display: 'flex', flexDirection: 'column', flexGrow: 1, textAlign: 'left' }}>
        {/* Top Title & Category Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h3 className="card-title" style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: 'var(--text-main)', textAlign: 'left' }}>{city}</h3>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', padding: '4px 12px', borderRadius: '9999px', background: 'var(--accent-sand)', color: 'var(--accent-emerald)', textTransform: 'capitalize', flexShrink: 0 }}>
            {category}
          </span>
        </div>

        {/* Left-Aligned Country Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '12px', textAlign: 'left' }}>
          <MapPin size={14} color="var(--accent-emerald)" />
          <span>{country}</span>
        </div>

        {/* Description */}
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px', flexGrow: 1, textAlign: 'left', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {destination.description || `Discover culture, dining, and scenic highlights in ${city}.`}
        </p>

        {/* Bottom Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: 'var(--border-light)', paddingTop: '16px', marginTop: 'auto' }}>
          <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {cost}
          </div>
          <button
            onClick={handlePlanClick}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.84rem', fontWeight: '700', borderRadius: '9999px' }}
          >
            <Sparkles size={14} color="var(--accent-emerald)" />
            <span>Plan Trip</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
