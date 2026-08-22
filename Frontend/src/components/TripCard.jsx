import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Wallet, ArrowRight, Users, Trash2 } from 'lucide-react';
import { getDestinationImage } from '../data/destinationImages';

const TripCard = ({ trip, onDelete }) => {
  if (!trip) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const start = formatDate(trip.startDate);
  const end = formatDate(trip.endDate);
  const imgUrl = trip.imageUrl || getDestinationImage(trip.destination);
  const participantsCount = 1 + (trip.participants ? trip.participants.length : 0);
  const statusText = (trip.status || 'PLANNED').toUpperCase();

  return (
    <div
      className="travel-card"
      style={{
        background: 'var(--surface-card)',
        border: 'var(--border-light)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Image Container with Floating Status Pill */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        <img
          src={imgUrl}
          alt={trip.destination}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'var(--surface-card)',
            backdropFilter: 'blur(8px)',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '800',
            color: 'var(--accent-emerald)',
            letterSpacing: '0.05em',
            border: 'var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {statusText}
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '20px 24px 24px 24px', display: 'flex', flexDirection: 'column', flexGrow: 1, textAlign: 'left' }}>
        {/* Title */}
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: '800',
            color: 'var(--text-main)',
            margin: '0 0 12px 0',
            lineHeight: 1.3,
            textAlign: 'left'
          }}
        >
          {trip.title || trip.destination}
        </h3>

        {/* Clean Left-Aligned Metadata Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', textAlign: 'left' }}>
          {/* Destination */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            <MapPin size={15} color="var(--accent-emerald)" />
            <span>{trip.destination}</span>
          </div>

          {/* Dates */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            <Calendar size={15} color="var(--accent-emerald)" />
            <span>{start} — {end}</span>
          </div>

          {/* Budget & Travellers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wallet size={15} color="var(--accent-emerald)" />
              <span>₹{(trip.budget || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={15} color="var(--accent-emerald)" />
              <span>{participantsCount} {participantsCount === 1 ? 'Traveller' : 'Travellers'}</span>
            </div>
          </div>
        </div>

        {/* View Itinerary CTA */}
        <div style={{ display: 'flex', gap: '10px', borderTop: 'var(--border-light)', paddingTop: '16px', marginTop: 'auto' }}>
          <Link
            to={`/trips/${trip._id}`}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flex: 1,
              padding: '12px',
              borderRadius: '9999px',
              textDecoration: 'none'
            }}
          >
            <span>View Itinerary</span>
            <ArrowRight size={16} />
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(trip._id)}
              style={{
                padding: '12px',
                borderRadius: '9999px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--status-error)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Delete Trip"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripCard;
