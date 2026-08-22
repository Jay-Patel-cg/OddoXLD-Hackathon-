import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTrip } from '../api';
import { Compass, Calendar, Wallet, Users, ArrowLeft, Sparkles } from 'lucide-react';

const CreateTrip = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState(25000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !destination || !startDate || !endDate) {
      setError('Please complete all required trip fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createTrip({
        title,
        destination,
        startDate,
        endDate,
        budget: Number(budget)
      });

      if (res.success && res.data && res.data.trip) {
        navigate(`/trips/${res.data.trip._id}`);
      } else {
        throw new Error('Failed to create trip');
      }
    } catch (err) {
      console.error('Create trip error:', err);
      setError(err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper" style={{ paddingTop: '40px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <Link to="/trips" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: '600', marginBottom: '24px' }}>
          <ArrowLeft size={16} />
          <span>Back to My Trips</span>
        </Link>

        <div className="wizard-card">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-ocean)', textTransform: 'uppercase' }}>Manual Setup</span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '4px' }}>Create New Journey</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Set up custom trip dates and target budget.</p>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 'var(--border-radius-md)', background: 'rgba(217,56,56,0.1)', color: 'var(--status-error)', fontSize: '0.88rem', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Trip Title</label>
              <input type="text" placeholder="e.g. Summer Escape 2026" value={title} onChange={(e) => setTitle(e.target.value)} required className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Destination City</label>
              <input type="text" placeholder="e.g. Paris or Sydney" value={destination} onChange={(e) => setDestination(e.target.value)} required className="form-input" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="form-input" />
              </div>

              <div className="form-group">
                <label className="form-label">End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="form-input" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Target Budget (₹)</label>
              <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="form-input" />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }} disabled={loading}>
              <span>{loading ? 'Creating Trip...' : 'Create Trip'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;
