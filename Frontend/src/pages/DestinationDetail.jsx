import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDestinationById } from '../api';
import { getCuratedHighlights } from '../data/destinationHighlights';
import { getDestinationImage } from '../data/destinationImages';
import { ArrowLeft, MapPin, Star, Calendar, Wallet, Compass, Sparkles, X, ChevronLeft, ChevronRight, Plus, ImageOff } from 'lucide-react';

const DestinationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lightbox Modal state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // User photo preview state
  const [userPhotos, setUserPhotos] = useState([]);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getDestinationById(id);
        if (res.success && res.data && res.data.destination) {
          setDestination(res.data.destination);
        } else {
          throw new Error('Destination not found');
        }
      } catch (err) {
        console.error('Failed to load destination:', err);
        setError(err.message || 'Failed to load destination details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handlePlanTripClick = () => {
    const name = destination?.city || destination?.name || '';
    navigate(`/plan?destination=${encodeURIComponent(name)}`);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newUrls = files.map((file) => URL.createObjectURL(file));
      setUserPhotos((prev) => [...prev, ...newUrls]);
    }
  };

  if (loading) {
    return (
      <div className="main-wrapper" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ height: '360px', borderRadius: '24px', background: '#E2ECF2', marginBottom: '32px', animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: '28px', width: '200px', background: '#E2ECF2', marginBottom: '16px', borderRadius: '8px' }} />
          <div style={{ height: '18px', width: '60%', background: '#E2ECF2', borderRadius: '6px' }} />
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="main-wrapper" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>Destination Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px 0' }}>We couldn't retrieve the requested destination details.</p>
        <Link to="/explore" className="btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Explore</span>
        </Link>
      </div>
    );
  }

  const cityName = destination.city || destination.name;
  const countryName = destination.country || 'Travel Destination';
  const curated = getCuratedHighlights(cityName);

  // Single Source of Truth for Imagery
  const mainImage = destination.imageUrl || (destination.gallery && destination.gallery[0]) || getDestinationImage(cityName);
  const gallery = (destination.gallery && destination.gallery.length > 0) ? destination.gallery : curated.gallery;
  const places = (destination.places && destination.places.length > 0) ? destination.places : curated.highlights;

  return (
    <div style={{ paddingBottom: '100px' }}>
      {/* 1. Large Immersive Hero */}
      <div
        style={{
          position: 'relative',
          height: '460px',
          borderBottomLeftRadius: '32px',
          borderBottomRightRadius: '32px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <img
          src={mainImage}
          alt={`${cityName}, ${countryName}`}
          onError={(e) => { e.target.style.display = 'none'; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(23, 43, 58, 0.92) 0%, rgba(23, 43, 58, 0.2) 60%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 'clamp(24px, 4vw, 40px)'
          }}
        >
          {/* Back button */}
          <div>
            <Link
              to="/explore"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--border-radius-pill)',
                background: 'rgba(255,255,255,0.2)',
                color: '#FFF',
                backdropFilter: 'blur(8px)',
                fontSize: '0.88rem',
                fontWeight: '600'
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Explore</span>
            </Link>
          </div>

          {/* Hero Bottom Content */}
          <div style={{ color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="editorial-badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)', padding: '4px 12px', borderRadius: 'var(--border-radius-pill)', fontSize: '0.82rem' }}>
                  <MapPin size={14} />
                  <span>{countryName}</span>
                </span>
                <span className="editorial-badge" style={{ background: 'var(--accent-sunset)', color: '#FFF', padding: '4px 12px', borderRadius: 'var(--border-radius-pill)', fontSize: '0.82rem' }}>
                  <Star size={14} fill="#FFF" color="#FFF" />
                  <span>{curated.rating} · Popular Destination</span>
                </span>
              </div>

              <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.5rem)', fontWeight: '800', color: '#FFF', lineHeight: 1.1, marginBottom: '8px' }}>
                {cityName}
              </h1>
              <p style={{ fontSize: '1.05rem', opacity: 0.9, maxWidth: '640px' }}>
                {curated.tagline || destination.description}
              </p>
            </div>

            <button onClick={handlePlanTripClick} className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.05rem', background: 'var(--accent-sunset)' }}>
              <Sparkles size={18} />
              <span>Plan a Trip with AI</span>
            </button>
          </div>
        </div>
      </div>

      <div className="main-wrapper" style={{ paddingTop: '40px', paddingInline: 'clamp(16px, 4vw, 48px)' }}>
        {/* 2. Destination Overview */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '12px' }}>
            Why visit {cityName}?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '840px', marginBottom: '32px' }}>
            {destination.description || `Discover rich history, vibrant dining, and memorable sights in ${cityName}.`}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'var(--surface-card)', padding: '20px', borderRadius: 'var(--border-radius-lg)', border: 'var(--border-light)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '4px' }}>Best Time to Visit</div>
              <div style={{ fontWeight: '700', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={18} color="var(--accent-ocean)" />
                <span>{destination.bestTimeToVisit || 'October — March'}</span>
              </div>
            </div>

            <div style={{ background: 'var(--surface-card)', padding: '20px', borderRadius: 'var(--border-radius-lg)', border: 'var(--border-light)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '4px' }}>Estimated Daily Cost</div>
              <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--accent-ocean)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wallet size={18} />
                <span>₹{(destination.averageCostPerDay || (destination.costIndex ? destination.costIndex * 1200 : 3500)).toLocaleString()}/day</span>
              </div>
            </div>

            <div style={{ background: 'var(--surface-card)', padding: '20px', borderRadius: 'var(--border-radius-lg)', border: 'var(--border-light)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '4px' }}>Popular Categories</div>
              <div style={{ fontWeight: '700', fontSize: '1.05rem', textTransform: 'capitalize' }}>
                {destination.popularCategories ? destination.popularCategories.join(', ') : 'Sightseeing, Culture'}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Traveler Favorites / Places */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '20px' }}>
            Traveler Favorites in {cityName}
          </h2>
          <div className="card-grid">
            {places.map((place, idx) => (
              <div key={idx} className="travel-card">
                <img
                  src={place.image || mainImage}
                  alt={`${cityName} — ${place.name}`}
                  className="card-media"
                  onError={(e) => { e.target.src = mainImage; }}
                />
                <div className="card-body">
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--accent-ocean)', textTransform: 'uppercase', marginBottom: '4px' }}>{place.category || 'Landmark'}</span>
                  <h3 className="card-title" style={{ fontSize: '1.2rem' }}>{place.name}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{place.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Photo Gallery */}
        <section style={{ marginBottom: '48px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A' }}>See {cityName} through photos</h2>
            <button onClick={() => setLightboxOpen(true)} className="btn-secondary" style={{ fontSize: '0.88rem', padding: '8px 16px', borderRadius: '9999px' }}>
              View all photos ({gallery.length})
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', height: '360px', borderRadius: '20px', overflow: 'hidden' }}>
            <img
              src={gallery[0]}
              alt={`${cityName} photo 1`}
              onClick={() => { setActivePhotoIdx(0); setLightboxOpen(true); }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflow: 'hidden' }}>
              <img
                src={gallery[1] || gallery[0]}
                alt={`${cityName} photo 2`}
                onClick={() => { setActivePhotoIdx(1 % gallery.length); setLightboxOpen(true); }}
                style={{ width: '100%', height: 'calc(50% - 8px)', objectFit: 'cover', borderRadius: '16px', cursor: 'pointer' }}
              />
              <img
                src={gallery[2] || gallery[0]}
                alt={`${cityName} photo 3`}
                onClick={() => { setActivePhotoIdx(2 % gallery.length); setLightboxOpen(true); }}
                style={{ width: '100%', height: 'calc(50% - 8px)', objectFit: 'cover', borderRadius: '16px', cursor: 'pointer' }}
              />
            </div>
            <img
              src={gallery[3] || gallery[0]}
              alt={`${cityName} photo 4`}
              onClick={() => { setActivePhotoIdx(3 % gallery.length); setLightboxOpen(true); }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px', cursor: 'pointer' }}
            />
          </div>
        </section>

        {/* 5. User Photos / Community Section */}
        <section style={{ marginBottom: '64px', marginTop: '24px', background: '#FFFFFF', padding: '36px', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(15,23,42,0.04)', clear: 'both', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>Share your Musafir moments</h3>
              <p style={{ color: '#64748B', fontSize: '0.92rem', margin: 0 }}>Add your travel photos to the destination community map.</p>
            </div>

            <label className="btn-secondary" style={{ cursor: 'pointer', padding: '10px 20px', borderRadius: '9999px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#0F172A', fontWeight: '700', fontSize: '0.88rem' }}>
              <Plus size={16} />
              <span>Add Photos</span>
              <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </label>
          </div>

          {userPhotos.length > 0 ? (
            <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingTop: '8px' }}>
              {userPhotos.map((url, idx) => (
                <img key={idx} src={url} alt={`User uploaded photo for ${cityName}`} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '14px' }} />
              ))}
            </div>
          ) : (
            <div style={{ color: '#94A3B8', fontSize: '0.9rem', fontStyle: 'italic', marginTop: '8px' }}>
              No community photos yet. Be the first to share a Musafir moment in {cityName}!
            </div>
          )}
        </section>

        {/* 6. Destination Bottom CTA */}
        <section style={{ background: 'var(--surface-card)', borderRadius: 'var(--border-radius-xl)', padding: '48px', border: 'var(--border-light)', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px' }}>Ready to explore {cityName}?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '24px' }}>Let Musafir AI build your perfect multi-day trip plan.</p>
          <button onClick={handlePlanTripClick} className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem', background: 'var(--accent-sunset)' }}>
            <Sparkles size={18} />
            <span>Plan a Trip with AI</span>
          </button>
        </section>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setLightboxOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', color: '#FFF', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={32} />
          </button>

          <button onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : gallery.length - 1))} style={{ position: 'absolute', left: '24px', color: '#FFF', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ChevronLeft size={44} />
          </button>

          <img src={gallery[activePhotoIdx]} alt={`${cityName} Lightbox ${activePhotoIdx + 1}`} style={{ maxWidth: '85vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px' }} />

          <button onClick={() => setActivePhotoIdx((prev) => (prev + 1) % gallery.length)} style={{ position: 'absolute', right: '24px', color: '#FFF', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ChevronRight size={44} />
          </button>

          <div style={{ position: 'absolute', bottom: '24px', color: '#FFF', fontSize: '0.9rem', fontWeight: '600' }}>
            {activePhotoIdx + 1} of {gallery.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationDetail;
